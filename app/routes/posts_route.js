'use strict';

module.exports = Ember.Route.extend({
  model: function () {
    return this.store.find('post');
  }
});