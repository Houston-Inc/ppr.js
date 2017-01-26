import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';
import EventBusPrototype from 'ppr.library.eventbusprototype';

/* eslint-disable no-unused-expressions */
describe('ppr.library.eventbusprototype', () => {
  let EventBus;
  let testEventId;

  const testEvent = sinon.spy();

  before(() => {
    EventBus = new EventBusPrototype();
  });

  it('should allow subscribing to events', () => {
    testEventId = EventBus.subscribe(null, 'my_event', () => {});
    chai.expect(_.keys(EventBus.getEventsByMessage('my_event'))).to.have.length(1);

    EventBus.subscribe(null, 'test_event', testEvent);
  });

  it('should allow unsubscribing event', () => {
    chai.expect(EventBus.unsubscribe(testEventId)).to.be.true;
    chai.expect(_.keys(EventBus.getEventsByMessage('my_event'))).to.have.length(0);
  });

  it('should publish event', () => {
    EventBus.publish('test_event', 'test');
    chai.expect(testEvent.called).to.be.true;
  });

  it('should publish event to given target', () => {
    const eventToBeCalled = sinon.spy();
    const eventToNotBeCalled = sinon.spy();

    EventBus.subscribe(null, 'trigger_only_once', eventToBeCalled, 'eventToBeCalled');
    EventBus.subscribe(null, 'trigger_only_once', eventToBeCalled, 'eventToNotBeCalled');

    EventBus.publishTo('eventToBeCalled', 'trigger_only_once', true);

    chai.expect(eventToBeCalled.called).to.be.true;
    chai.expect(eventToNotBeCalled.called).to.be.false;
  });

  it('should return list of all events', () => {
    chai.expect(_.keys(EventBus.getEvents())).to.have.length(2);
  });
});
