define([
  'baucis', 'urls',], function(Baucis, urls) {

  var Model = Baucis.Model.extend({
  	urlRoot: urls.stories
  });

  return Model;

});