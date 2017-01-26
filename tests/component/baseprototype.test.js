import _ from 'lodash';
import $ from 'jquery';
import chai from 'chai';
import ComponentBasePrototype from 'ppr.component.baseprototype';
import PageBasePrototype from 'ppr.page.baseprototype';
import EventBusPrototype from 'ppr.library.eventbusprototype';

/* eslint-disable no-unused-expressions */

/**
 * Helper function to test multiple components
 * @param {Object} componentNode
 * @param {Object} component
 * @param {Object} page
 * @param {Object} eventBus
 */
const componentTester = (componentId, componentNode, component, page, eventBus) => {
  const targetPage = page;

  let params = {};

  describe('initialize', () => {
    beforeEach(() => {
      params = {
        id: componentId,
        node: componentNode.clone(),
        name: 'base_prototype',
        eventBus,
        page,
      };
    });

    it('should initialize with min amount of params', () => {
      params.node = componentNode;

      component.initialize(params);

      chai.assert.equal(component.id, params.id);
      chai.assert.equal(component.name, params.name);
      chai.assert.deepEqual(component.data, {});
      chai.expect(component.href).to.be.null;
    });

    it('should initialize with data', () => {
      const testData = {
        testProperty: true,
        testProperty2: false,
      };

      params.node.attr({
        'data-component-data': JSON.stringify(testData),
      });

      component.reset();
      component.initialize(params);

      chai.assert.equal(component.id, params.id);
      chai.assert.equal(component.name, params.name);
      chai.assert.deepEqual(component.data, testData);
      chai.expect(component.href).to.be.null;
    });

    it('should initialize with href', () => {
      const componentHref = 'https://www.google.com';

      params.node.attr({
        'data-component-href': componentHref,
        'data-component-data': '',
      });

      component.reset();
      component.initialize(params);

      chai.assert.equal(component.id, params.id);
      chai.assert.equal(component.name, params.name);
      chai.assert.deepEqual(component.data, {});
      chai.assert.equal(component.href, componentHref);
    });

    it('should not have any required modules', () => {
      chai.expect(component.getRequiredModules()).to.have.length(0);
    });

    it('should be buildable', (done) => {
      component.isBuildable().then(() => {
        done();
      });
    });
  });

  describe('build', () => {
    before(() => {
      targetPage.components[component.id] = component;
      component.initialize(params);
    });

    it('should not be built', () => {
      chai.expect(component.isBuilt).to.be.false;
    });

    it('should build', () => {
      component.build();
      component.afterBuild();

      chai.expect(component.isBuilt).to.be.true;
    });
  });
};

describe('ppr.component.baseprototype', () => {
  describe('standalone component', () => {
    const pageNode = $('<body>');
    const componentNode = $('<div>').attr('data-component', '').appendTo(pageNode);
    const component = ComponentBasePrototype.createComponent({});
    const page = PageBasePrototype.createPage({});
    const eventBus = new EventBusPrototype();

    // Initialize page
    page.initialize({
      node: pageNode,
      name: 'base_prototype',
    });

    componentTester(_.uniqueId('Component_'), componentNode, component, page, eventBus);

    it('should allow adding messages', () => {
      component.setModuleMessages({ test_module: { MODULE_TEST_MESSAGE: 'module_test_message' } });

      chai.expect(_.keys(component.messages)).to.have.length(1);
    });

    describe('references', () => {
      it('should not have any child components', () => {
        chai.expect(component.getChildren()).to.have.length(0);
      });

      it('should not have parent component', () => {
        chai.expect(component.getParent()).to.be.null;
      });
    });
  });

  describe('component with references', () => {
    const pageNode = $('<div>');
    const parentComponentNode = $('<div>').attr('data-component', '').appendTo(pageNode);
    const childComponentNode = $('<div>').attr('data-component', '');
    const secondChildComponentNode = $('<div>').attr('data-component', '');

    const componentId = _.uniqueId('Component_');
    const childComponentId = _.uniqueId('Component_');
    const secondChildComponentId = _.uniqueId('Component_');

    const parentComponent = ComponentBasePrototype.createComponent({});
    const childComponent = ComponentBasePrototype.createComponent({});
    const secondChildComponent = ComponentBasePrototype.createComponent({});
    const rootPage = PageBasePrototype.createPage({});
    const eventBus = new EventBusPrototype();

    // Initialize page
    rootPage.initialize({
      node: pageNode,
      name: 'base_prototype',
    });

    componentTester(componentId, parentComponentNode, parentComponent, rootPage, eventBus);

    childComponent.initialize({ node: childComponentNode, id: childComponentId, name: 'base_prototype', eventBus, page: rootPage });
    secondChildComponent.initialize({ node: secondChildComponentNode, id: secondChildComponentId, name: 'base_prototype', eventBus, page: rootPage });

    describe('references', () => {
      before(() => {
        rootPage.components[childComponentId] = childComponent;
        rootPage.components[secondChildComponentId] = secondChildComponent;

        childComponent.node.appendTo(parentComponent.node);
        secondChildComponent.node.appendTo(childComponent.node);
      });


      it('should have one child component', () => {
        chai.expect(parentComponent.getChildren()).to.have.length(1);
        chai.assert.equal(_.first(parentComponent.getChildren()).id, childComponent.id);
      });

      it('should have parent component', () => {
        chai.expect(childComponent.getParent()).to.be.a('object');
        chai.assert.equal(childComponent.getParent().id, parentComponent.id);
      });
    });
  });
});
