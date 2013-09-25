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

      //PubSub.subscribe('connection', function(msg, data) {
        //console.info(msg, data);
      //});

      return this;
    },

    loadSearch: function() {
      var self = this;

      $(document).on("keyup", '.searchList', function(e) {
        var result = self.sifter.search($(this).val(), {
          fields: ['firstname', 'lastname'],
          sort: 'firstname',
          direction: 'asc',
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

      model.comparator = function(row) {
        return row.get("firstname");
      };

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

      $('#users_data').off('click tap').on('click tap', '.delete_user', function(e) {
        var cu = model.findWhere({ _id : $(this).attr('data-app-id') });

        dialogs.ask('Atención', 'Esta seguro que desea eliminar el usuario?', function(event, value, message, formVals){
          if( value ) {
            cu.destroy({
              success: function() {
                window.router.navigate('#', {trigger: false });
                window.router.navigate('#users', {trigger: true });
              }
            });
          }
        });

        return false;
      });

    },

  });

  return View;

});