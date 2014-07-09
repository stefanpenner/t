import Ember from 'ember';
import TransactionEvent from 't/models/transaction-event';

var ACTIVE    = 0;
var COMPLETED = 1;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0;
    var v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function Transaction(manager) {
  this.manager = manager;
  this.id      = uuid();
  this.state   = ACTIVE;
  this.events  = Ember.A();
}

Transaction.prototype.end = function() {
  this.state = COMPLETED;

  this.manager.removeTransaction(this);
  // we should likely flush this
};

Transaction.prototype.addEvent = function(event) {
  event.time = event.time || new Date().getTime();
  this.events.pushObject(event);
};

export default Ember.Object.extend({
  history: 10,
  init: function() {
    this._activeTransactions = Ember.A();
    this._recentTransactions = Ember.A();
    this._super();

    var service = this;

    Ember.$(document).on('ajaxSend.horizon-user-transaction', function(event, xhr, settings) {
      service.willSendAjax(event, xhr, settings);
    });

    Ember.$(document).on('ajaxComplete.horizon-user-transaction', function(event, xhr, settings) {
      service.didSendAjax(event, xhr, settings);
    });
  },

  willDestroy: function() {
    this._super();

    Ember.$(document).off('ajaxSend.horizon-user-transaction');
    Ember.$(document).off('ajaxComplete.horizon-user-transaction');
  },

  serializedActiveTransactionIds: function() {
    return JSON.stringify(this._activeTransactions.map(function(transaction) {
      return transaction._id;
    }));
  },

  willSendAjax: function(event, xhr, settings) {
    xhr.setRequestHeader("X-HORIZON-USER-TRANSACTIONS", this.serializedActiveTransactionIds());
    xhr.__horizon_request_id__ = uuid();

    this.addEvent(TransactionEvent.create({
      type: 'ajax:start',
      uuid: xhr.__horizon_request_id__,
      payload: {
        url: settings.url,
        method: settings.type
      }
    }));
  },

  didSendAjax: function(event, xhr) {
    this.addEvent(TransactionEvent.create({
      type: 'ajax:end',
      uuid: xhr.__horizon_request_id__,
      payload: {
        status:  xhr.status
      }
    }));
  },

  addEvent: function(event) {
    var transactions = this._activeTransactions;
    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];
      transaction.addEvent(event);
    }
  },

  start: function() {
    var transaction = new Transaction(this);
    this.addTransaction(transaction);
    return transaction;
  },

  addTransaction: function(transaction) {
    this._activeTransactions.pushObject(transaction);
    this._recentTransactions.unshiftObject(transaction);
    if (this._recentTransactions.length > this.get('history')) {
      this._recentTransactions.removeAt(this.get('history'));
    }
  },

  removeTransaction: function(transaction) {
    this._activeTransactions.removeObject(transaction);
  }
});
