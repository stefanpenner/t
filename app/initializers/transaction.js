import Ember from 'ember';

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

    transaction.addEvent({
      type: event,
      payload: {
        path: path
      }
    });

    return this._super.apply(this, arguments).promise.finally(function() {
      transaction.end();
    });
  }
});

