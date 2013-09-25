define([
  'underscore',
  'backbone',
  'collections/calendar/collection',
  'helper/dialogs',
  'text!./template.html',
  'text!./row.html',
  'ashe',
  'sifter',
  'pubsub',
  'moment',
  'jquery'], function(_, Backbone, model, dialogs, templateData, rowData, Ashe, Sifter, PubSub, moment, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    sifter: undefined,
    data: [],

    render: function() {
      var self = this;

      this.$el.html(Ashe.parse(templateData, {}));

      this.$el.trigger('create');

      this.loadData();

      this.loadSearch();

      this.joinEvents();

      return this;
    },

    loadSearch: function() {
      var self = this;

      $(document).on("keyup", '.searchList', function(e) {
        var result = self.sifter.search($(this).val(), {
          fields: ['user_name', 'date'],
          sort: 'created',
          direction: 'desc',
        });

        $("#data_list").empty();
        _.each(result.items, function(r) {
          var row = self.data[r.id];

          $("#data_list").append(Ashe.parse(rowData, row));
        });

        return false;
      });
    },

    loadData: function() {
      var self = this;

      $("#data_list").empty();

      model.baucis({
        conditions: {
          owner: window.user()._id
        }
      }).then(function() {
        var filtered = model.toJSON().reverse();

        self.data = [];
        for (var i in filtered) {
          var row = filtered[i];

          self.data.push({
            _id: row._id,
            user_name: row.user_name,
            created: row.startTime,
            date: moment(row.startTime).format('LL'),
            start_time: moment(row.startTime).format('HH:mm'),
            end_time: moment(row.endTime).format('HH:mm')
          });
        }

        _.each(self.data, function(row) {
          $("#data_list").append(Ashe.parse(rowData, row));
        });

        self.sifter = new Sifter(self.data);
      });
    },

    joinEvents: function() {
      $("#data_list").off('click tap').on('click tap', '.delete_appointment', function(e) {
        var cu = model.findWhere({
          _id: $(this).attr('data-app-id')
        });

        dialogs.ask('Atención', 'Esta seguro que desea eliminar el turno?', function(event, value) {
          console.info(value);
          if (value) {
            cu.destroy({
              success: function() {
                window.router.navigate('#', {
                  trigger: false
                });
                window.router.navigate('#appointments', {
                  trigger: true
                });
              }
            });
          }
        });

        return false;
      });
    }

  });

  return View;

});