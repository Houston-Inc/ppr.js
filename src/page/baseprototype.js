(function(root, factory) {

  // AMD
  // istanbul ignore next
  if (typeof define === 'function' && define.amd) {
    define('ppr.page.base_prototype', [
      'ppr.config',
      'ppr.library.utils.object',
      'ppr.library.utils.loader',
      'ppr.library.event_bus_prototype',
      'jquery',
      'lodash'
    ], factory);
  }

  // Node, CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory(
      require('../ppr.config'),
      require('../library/utils/object'),
      require('../library/utils/loader'),
      require('../library/eventbusprototype'),
      require('jquery'),
      require('lodash')
    );
  }

  // Browser globals
  // istanbul ignore next
  else {
    root.ppr.page.base_prototype = factory(
      root.ppr.config,
      root.ppr.library.utils.object,
      root.ppr.library.utils.loader,
      root.ppr.library.event_bus_prototype,
      root.$,
      root._
    );
  }
})(this, function(Config, ObjectUtils, UniversalLoader, EventBusPrototype, $, _) {

  'use strict';

  return {

    eventBus: new EventBusPrototype(Config.get('event_bus', {})),
    name: null,
    node: null,
    components: {},
    data: null,

    cacheComponentReady: [],

    /**
     * Function to be triggered when build is done
     */
    afterBuild: function() {

      this.setDefaultSubscribers();

      this.buildComponents();
      this.buildUIExtensions();
    },

    /**
     * Build page
     * @returns {Boolean|undefined}
     */
    build: function() {
      return true;
    },

    /**
     * Build component
     * @param {Object} node jQuery node of element
     */
    buildComponent: function(node) {

      var _this = this,
        namespace,
        name = node.attr('data-component').trim(),
        instanceName = _.snakeCase(name),
        params = {},
        loaderParams = {};

      // Use custom name if present
      if (name.length > 0) {
        namespace = 'ppr.component.' + instanceName;
        loaderParams.custom = true;
      } else {

        // Detected to be reloadable
        if (node.attr('data-component-href')) {
          namespace = 'ppr.component.reloadable_prototype';
          name = 'reloadable_prototype';
        }

        // Normal component
        else {
          namespace = 'ppr.component.base_prototype';
          name = 'base_prototype';
        }
      }

      // Use existing id
      if (node.attr('data-component-id')) {
        params.id = node.attr('data-component-id');
      }

      // Create new id
      else {
        params.id = _.uniqueId('Component_');
      }

      params.name = name;
      params.node = node;
      params.eventBus = this.eventBus;
      params.page = this;

      UniversalLoader.load(namespace, loaderParams, function(ComponentPrototype) {

        // Instantiate prototype
        var instance = new function() { return $.extend(true, {}, ComponentPrototype); };

        // Remember instance
        _this.components[params.id] = instance;

        // Initialize
        instance.initialize(params);

        // Map required modules to namespaces
        var requiredModuleNames = instance.getRequiredModules(),
          requiredModules = _.map(requiredModuleNames, function(namespace) {
            return 'ppr.module.' + namespace;
          });

        // Load modules
        UniversalLoader.load(requiredModules, { custom: true }, function() {

          var modules = Array.prototype.slice.call(arguments),
            messages = {};

          // Initialize modules
          _.each(modules, function(module, index) {
            module.initialize({}, _this.eventBus);
            messages[requiredModuleNames[index]] = module.getMessages();
          });

          instance.setModuleMessages(messages);


          // Wait until instance is buildable
          instance.isBuildable().then(function(data) {

            // Component build failed
            if (instance.build(data) === false) {

              // Remove reference
              delete _this.components[params.id];

              // Remove from DOM
              node.remove();

              return;
            }

            // After build
            instance.afterBuild();
          });
        });
      });
    },

    /**
     * Build all components in page
     */
    buildComponents: function() {

      var _this = this;

      // Loop through components
      this.node.find('[data-component]').each(function(index, element) {
        _this.eventBus.publish('build_component', $(element));
      });
    },

    /**
     * Build UI extensions
     */
    buildUIExtensions: function() {

      // Load builders
      UniversalLoader.load(Config.get('ui.builders', []), { custom: true }, function() {
        var builders = Array.prototype.slice.call(arguments);

        _.each(builders, function(builder) {
          builder.initialize();
        });
      });
    },

    /**
     * Get component by id
     * @param {string} id component id
     * @returns {Object}
     */
    getComponent: function(id) {
      return typeof this.components[id] !== 'undefined' ?
        this.components[id] : null;
    },

    /**
     * Initialize page instance
     * @param {Object} params list of parameters
     */
    initialize: function(params) {

      this.name = params.name;
      this.node = params.node;
      this.data = {};

      // Set page data
      if (this.node.attr('data-page-data')) {

        this.data = $.extend({}, this.data, ObjectUtils.parseJSON(
          this.node.attr('data-page-data')
        ));
      }

      return true;
    },

    /**
     * Function to be called when each component is ready
     * @param {string} componentId
     */
    onComponentBuildFinished: function(componentId) {

      this.cacheComponentReady.push(componentId);

      // All components ready
      if (this.cacheComponentReady.length === _.keys(this.components).length) {
        this.eventBus.publish('page_build_finished');
      }
    },

    /**
     * Set default subscribers
     */
    setDefaultSubscribers: function() {

      this.eventBus.subscribe(this, 'build_component', this.buildComponent);
      this.eventBus.subscribe(this, 'component_build_finished', this.onComponentBuildFinished);
    }
  };
});
