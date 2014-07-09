import Ember from 'ember';

var Router = Ember.Router.extend({
  location: TENV.locationType
});

Router.map(function() {
  this.route('apple');
});

export default Router;
