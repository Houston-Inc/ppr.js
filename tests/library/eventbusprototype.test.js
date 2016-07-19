var EventBusPrototype = require('../../src/library/eventbusprototype'),
  _ = require('lodash');

'use strict';

describe('ppr.library.eventbusprototype', function() {
  var EventBus,
    testEvent = sinon.spy(),
    testEventId;

  before(function() {
    EventBus = new EventBusPrototype;
  });

  it('should allow subscribing to events', function() {
    testEventId = EventBus.subscribe(null, 'my_event', function() {});
    chai.expect(_.keys(EventBus.getEventsByMessage('my_event'))).to.have.length(1);

    EventBus.subscribe(null, 'test_event', testEvent);
  });

  it('should allow unsubscribing event', function() {
    chai.expect(EventBus.unsubscribe(testEventId)).to.be.true;
    chai.expect(_.keys(EventBus.getEventsByMessage('my_event'))).to.have.length(0);
  })

  it('should publish event', function() {
    EventBus.publish('test_event', 'test');
    chai.expect(testEvent.called).to.be.true;
  });

  it('should publish event to given target', function() {

    var eventToBeCalled = sinon.spy(),
      eventToNotBeCalled = sinon.spy();

    EventBus.subscribe(null, 'trigger_only_once', eventToBeCalled, 'eventToBeCalled');
    EventBus.subscribe(null, 'trigger_only_once', eventToBeCalled, 'eventToNotBeCalled');

    EventBus.publishTo('eventToBeCalled', 'trigger_only_once', true);

    chai.expect(eventToBeCalled.called).to.be.true;
    chai.expect(eventToNotBeCalled.called).to.be.false;
  });

  it('should return list of all events', function() {
    chai.expect(_.keys(EventBus.getEvents())).to.have.length(2);
  });
});
