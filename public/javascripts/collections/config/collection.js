define([
  'baucis',
  'urls',
  './model'], function(Baucis, urls, Model) {

  var singleton = function() {
    var Collection = Baucis.Collection.extend({
      model: Model,

      url: urls.configs
    });

    return new Collection();
  };


  return (new singleton());
});