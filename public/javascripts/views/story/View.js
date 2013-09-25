define([
  'underscore',
  'backbone',
  'collections/users/collection',
  'collections/stories/model',
  'helper/dialogs',
  'text!./template.html',
  'ashe',
  'jquery'], function(_, Backbone, collection, model, dialogs, templateData, Ashe, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    render: function() {
      var self = this;

      if (_.isUndefined(collection) || collection.length == 0) {
        window.router.navigate("#stories", {
          trigger: true
        });
        return;
      }

      if (!_.isUndefined(this.options.uid)) {
        var user = collection.findWhere({
          _id: this.options.uid
        });

        data = {
          firstname: user.get('firstname'),
          lastname: user.get('lastname'),
          id: user.get('_id')
        };
      }

      this.$el.html(Ashe.parse(templateData, data));

      this.$el.trigger('create');

      this.joinEvents();

      return this;
    },

    joinEvents: function() {
      var self = this;

      $("#save_story").on('click, tap', function(e) {
        e.stopPropagation();

        if( _.isEmpty( $("#text").val() ) ) {
          dialogs.toast("El texto no puede quedar vacío.");

          return;
        }

        var cuid = window.user()._id;

        var nu = new model({
          user: $("#id").val(),
          text: $("#text").val(),
          owner: cuid
        });

        nu.save({}, {
          success: function() {
            window.router.navigate('#stories=' + self.options.uid, {
              trigger: true
            });
          }
        });

        return false;
      });
    },

  });

  return View;

});