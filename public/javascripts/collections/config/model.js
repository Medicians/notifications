define([
  'baucis', 'urls',], function(Baucis, urls) {

  var Model = Baucis.Model.extend({
  	urlRoot: urls.configs
  });

  return Model;

});