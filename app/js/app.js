App = Ember.Application.create({
  LOG_TRANSITIONS: true
});

App.Store = DS.Store.extend({
  adapter: DS.RESTAdapter.extend({
    namespace: 'rest'
  })
});

var get = Ember.get, set = Ember.set;

Ember.Location.registerImplementation('hashbang', Ember.HashLocation.extend({
  getURL: function () {
    return get(this, 'location').hash.substr(2);
  },

  setURL: function (path) {
    get(this, 'location').hash = '!' + path;
    set(this, 'lastSetURL', '!' + path);
  },

  onUpdateURL: function (callback) {
    var self = this;
    var guid = Ember.guidFor(this);

    Ember.$(window).bind('hashchange.ember-location-' + guid, function () {
      Ember.run(function() {
        var path = location.hash.substr(2);
        if (get(self, 'lastSetURL') === path) { return; }
        set(self, 'lastSetURL', null);
        callback(path);
      });
    });
  },

  formatURL: function (url) {
    return '#!' + url;
  }
}));

App.Router.reopen({
  location: 'hashbang'
});

App.Router.map(function () {
  this.resource('posts');
  this.resource('post', { path: 'posts/:post_id' });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function () {
    this.transitionTo('posts');
  }
});

App.PostsRoute = Ember.Route.extend({
  model: function () {
    return App.Post.find();
  }
});

var attr = DS.attr;

App.Post = DS.Model.extend({
  title: attr('string'),
  intro: attr('string'),
  body: attr('string'),
  date: attr('date')
});

var showdown = new Showdown.converter();

Ember.Handlebars.registerBoundHelper('markdown', function (input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.registerBoundHelper('date', function (date) {
  return moment(date).format('MMMM Do, YYYY');
});

App.DisqusView = Ember.View.extend({
  elementId: 'disqus_thread',
  tagName: 'div',
  didInsertElement: function () {
    var existingScript = document.getElementById('disqus_script');
    if (existingScript) { // Simply reload disqus
      var title = this.get('post.id');          
      DISQUS.reset({
        reload: true,
        config: function () {  
          this.page.identifier = title;
          this.page.url = window.location.toString();
        }
      });
    } else {
      window.disqus_shortname = 'haurwitz';
      window.disqus_identifier = this.get('post.id');
      window.disqus_url = window.location.toString();
      (function() {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
      })();
    }
  }
});