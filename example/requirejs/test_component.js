define('ppr.component/test_component', ['ppr.component.reloadableprototype', 'jquery'], function(ReloadablePrototype, $) {
  'use strict';

  return $.extend(true, {}, ReloadablePrototype, {
    build: function() {
      var _this = this;

      this.node.on('click', '.btn', function(e) {
        e.preventDefault();

        _this.reload();
      });
    }
  });
})
