define([
  'underscore',
  'backbone',
  'collections/users/collection',
  'collections/stories/collection',
  'helper/dialogs',
  'text!./template.html',
  'text!./row.html',
  'ashe',
  'sifter',
  'pubsub',
  'moment',
  'jquery'], function(_, Backbone, model, stories, dialogs, templateData, rowData, Ashe, Sifter, PubSub, moment, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    sifter: undefined,
    data: [],

    render: function() {
      var self = this;

      if (_.isUndefined(model) || model.length == 0) {
        window.router.navigate("#stories", {
          trigger: true
        });
        return;
      }

      var user = model.findWhere({
        _id: this.options.uid
      });

      this.$el.html(Ashe.parse(templateData, {
        id: this.options.uid,
        firstname: user.get('firstname'),
        lastname: user.get('lastname')
      }));

      this.$el.trigger('create');

      this.loadData();

      this.loadSearch();

      return this;
    },

    loadSearch: function() {
      var self = this;

      $(document).on("keyup", '.searchList', function(e) {
        var result = self.sifter.search($(this).val(), {
          fields: ['created', 'formated_date', 'text'],
          sort: 'created',
          direction: 'desc',
        });

        $("#data_list").empty();
        _.each(result.items, function(r) {
          var row = self.data[r.id];

          $("#data_list").append(Ashe.parse(rowData, {
            text: row.text,
            formated_date: row.formated_date
          }));
        });

        return false;
      });
    },

    loadData: function() {
      var self = this;

      $("#data_list").empty();

      var cuid = window.user()._id;

      stories.baucis({
        conditions: {
          user: self.options.uid,
          owner: cuid
        }
      }).then(function() {
        var filtered = stories.toJSON().reverse();

        self.data = [];
        for (var i in filtered) {
          self.data.push(_.extend(filtered[i], {
            formated_date: moment(filtered[i].created).format('LLL')
          }))
        }

        _.each(self.data, function(row) {
          $("#data_list").append(Ashe.parse(rowData, {
            text: row.text,
            formated_date: row.formated_date
          }));
        });

        self.sifter = new Sifter(self.data);
      });
    },

  });

  return View;

});