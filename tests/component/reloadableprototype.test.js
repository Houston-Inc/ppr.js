import $ from 'jquery';
import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';
import PageBasePrototype from 'ppr.page.baseprototype';
import ReloadablePrototype from 'ppr.component.reloadableprototype';

/* eslint-disable no-unused-expressions */
describe('ppr.component.reloadableprototype', () => {
  const pageNode = $('<div>');
  const componentNode = $('<div>').attr('data-component', '').attr('data-component-href', '/test.html').appendTo(pageNode);

  let pageInstance;
  let componentInstance;

  before(() => {
    pageInstance = PageBasePrototype.createPage({});

    pageInstance.initialize({
      node: pageNode,
      name: 'base_prototype',
    });

    pageInstance.build();
    pageInstance.afterBuild();

    componentInstance = ReloadablePrototype.createComponent({});

    componentInstance.initialize({
      name: 'base_prototype',
      node: componentNode,
      eventBus: pageInstance.eventBus,
      page: pageInstance,
      id: _.uniqueId('ReloadableComponent_'),
    });

    componentInstance.build();
    componentInstance.afterBuild();

    pageInstance.components[componentInstance.id] = pageInstance;
  });

  describe('#reload', () => {
    before(() => {
      sinon.stub($, 'get').returns($.Deferred().resolve('<div class="reloadedComponent" data-component></div>').promise());
    });

    after(() => {
      $.get.restore();
    });

    it('should reload component html', (done) => {
      componentInstance.eventBus.subscribe(null, 'component_build_finished', (componentId) => {
        if (componentId === componentInstance.id) {
          chai.expect(pageInstance.getComponent(componentId).node.hasClass('reloadedComponent')).to.be.true;
          done();
        }
      });

      componentInstance.reload();
    });
  });
});
