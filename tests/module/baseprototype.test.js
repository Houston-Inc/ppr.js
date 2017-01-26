import _ from 'lodash';
import chai from 'chai';
import BasePrototype from 'ppr.module.baseprototype';
import EventBusPrototype from 'ppr.library.eventbusprototype';

/* eslint-disable no-unused-expressions */
describe('ppr.module.baseprototype', () => {
  let moduleInstance;
  let eventBusInstance;

  before(() => {
    moduleInstance = BasePrototype.createModule({});
    eventBusInstance = new EventBusPrototype();
  });

  describe('#initialize', () => {
    const configuration = {
      testProperty: true,
    };

    it('should initialize correctly', () => {
      chai.expect(moduleInstance.initialize(configuration, eventBusInstance)).to.be.true;
    });

    it('should have instance of eventBus and given configuration', () => {
      chai.assert.deepEqual(moduleInstance.configList, configuration);
      chai.expect(moduleInstance.eventBus).to.be.a('object');
    });

    it('should not initialize again', () => {
      chai.expect(moduleInstance.initialize()).to.be.false;
    });
  });

  describe('#getMessages', () => {
    before(() => {
      moduleInstance.messages = {
        MODULE_MESSAGE_1: 'module_message_1',
      };
    });

    it('should return list of messages', () => {
      chai.expect(_.keys(moduleInstance.getMessages())).to.have.length(1);
    });
  });
});
