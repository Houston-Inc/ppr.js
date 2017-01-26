import $ from 'jquery';
import BasePrototype from 'ppr.component.baseprototype';

export default BasePrototype.createComponent({

  componentLoaderWrapper: null,

  /**
   * @inheritdoc
   */
  afterBuild() {
    this.componentLoaderWrapper = this.node.find('.component-loader__wrapper');

    const subscribers = [
      this.eventBus.subscribe(this, 'reload', this.reload, this.id),
      this.eventBus.subscribe(this, 'reload_started', this.onReloadStarted, this.id),
      this.eventBus.subscribe(this, 'reload_ready', this.onReloadReady, this.id),
      this.eventBus.subscribe(this, 'reload_components', this.reload),
    ];

    this.cacheSubscribers = this.cacheSubscribers.concat(subscribers);

    // Publish build finished
    this.eventBus.publish('component_build_finished', this.id);

    this.isBuilt = true;
  },

  /**
   * Function to be called when reload is started
   */
  onReloadStarted() {
    if (this.componentLoaderWrapper.length) {
      this.componentLoaderWrapper.addClass('component-loader__wrapper--active');
    }
  },

  /**
   * Function to be called when ajax is done
   */
  onReloadReady(node) {
    const targetNode = node.filter('*:not(text):not(comment)');

    this.reset();

    // Replace nodes
    this.node.replaceWith(targetNode);

    // Use existing id
    targetNode.attr('data-component-id', this.id);

    // Rebuild component
    this.eventBus.publish('build_component', targetNode);
  },

  /**
   * Reload component
   */
  reload() {
    this.eventBus.publishTo(this.id, 'reload_started');

    // Load component html
    $.get(this.href).done((html) => {
      this.eventBus.publishTo(this.id, 'reload_ready', $(html));
    });
  },
});
