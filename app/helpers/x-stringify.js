import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value) {
  if (value) {
    return JSON.stringify(value)
  }
});
