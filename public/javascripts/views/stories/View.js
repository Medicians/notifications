define([
  'underscore',
  'backbone',
  'collections/users/collection',
  'helper/dialogs',
  'text!./template.html',
  'text!./row.html',
  'ashe',
  'sifter',
  'pubsub',
  'jquery'], function(_, Backbone, model, dialogs, templateData, rowData, Ashe, Sifter, PubSub, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    sifter: undefined,
    data : [],

    render: function() {
      var self = this;

      this.$el.html(Ashe.parse(templateData, {}));

      this.$el.trigger('create');

      this.loadData();

      this.joinEvents();

      this.loadSearch();

      return this;
    },

    loadSearch: function() {
      var self = this;

      $(document).on("keyup", '.searchList', function(e) {
        var result = self.sifter.search($(this).val(), {
          fields: ['firstname', 'lastname'],
          sort: 'firstname',
          direction: 'desc',
        });

        $("#users_data").empty();
        _.each(result.items, function(r) {
          var row = self.data[r.id];
          
          $("#users_data").append(Ashe.parse(rowData, {
              id: row._id,
              firstname: row.firstname,
              lastname: row.lastname,
              email: row.email
            }));
        });

        return false;
      });
    },

    loadData: function() {
      var self = this;

      $("#users_data").empty();

      model.fetch({
        success: function() {
          self.data = model.toJSON();

          _.each(self.data, function(row) {
            $("#users_data").append(Ashe.parse(rowData, {
              id: row._id,
              firstname: row.firstname,
              lastname: row.lastname,
              email: row.email
            }));
          });

          self.sifter = new Sifter( self.data );
        },
        error: function() {
          console.info(persistence);
        }
      });
    },

    joinEvents: function() {
      var self = this;

      /*$('#users_data').off('click tap').on('click tap', '.see_user', function(e) {
        window.router.navigate('#stories=' + $(this).attr('data-app-id'), {
          trigger: true
        });

        return false;
      });*/

    },

  });

  return View;

});