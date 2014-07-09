import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value) {
  return window.moment(value).format('LLLL');
});
