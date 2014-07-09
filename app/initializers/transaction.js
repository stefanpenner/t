import Ember from 'ember';
import TransactionEvent from 't/models/transaction-event';

export default {
  name: 'transaction',
  initialize: function(container, app) {
    app.inject('route',      'transactionService', 'service:transaction');
    app.inject('router',     'transactionService', 'service:transaction');
    app.inject('controller', 'transactionService', 'service:transaction');
  }
};

Ember.Router.reopen({
  _doTransition: function() {
    var service = this.transactionService;

    var transaction = service.start();

    var event = arguments[0];
    var path  = arguments[1];

    var transactionEvent = TransactionEvent.create({
      type: event,
      payload: {
        path: path,
        previousPath: window.location.pathname
      }
    });

    transaction.addEvent(transactionEvent);

    return this._super.apply(this, arguments).promise.finally(function() {
      transaction.end();
    });
  }
});

