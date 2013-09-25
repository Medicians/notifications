/**
 * Agregar motivo de modificación
 */
define([
  'underscore',
  'backbone',
  'collections/calendar/collection',
  'collections/calendar/model',
  'collections/users/collection',
  'helper/dialogs',
  'text!./template.html',
  'ashe',
  'sifter',
  'moment',
  'jquery'], function(_, Backbone, model, calendarModel, usersCollection, dialogs, templateData, Ashe, Sifter, moment, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    sifter: undefined,
    usersData: [],
    udata: undefined,

    isAdmin: false,

    render: function() {
      var self = this;

      self.isAdmin = (window.user().type == 'admin');

      usersCollection.fetch({
        success: function() {
          self.usersData = usersCollection.toJSON();
          self.sifter = new Sifter(self.usersData);

          self.$el.html(Ashe.parse(templateData, {
            create: (!_.isUndefined(self.options.aid)),
            isAdmin: self.isAdmin
          }));

          if (!self.isAdmin) {
            var admins_users = usersCollection.where({
              type: 'admin'
            });

            for (var e in admins_users) {
              console.info(admins_users[e]);
              $("#admin_id").append($('<option>', {
                value: admins_users[e].attributes._id,
                text: admins_users[e].attributes.firstname + ' ' + admins_users[e].attributes.lastname
              }));
            }
          }

          if (!_.isUndefined(self.options.aid)) {
            self.udata = model.findWhere({
              _id: self.options.aid
            });

            $("#user_title").replaceWith(self.udata.attributes.user_name);

            $("#uid").val(self.udata.attributes.user);
            $("#user_name").val(self.udata.attributes.user_name);
            $("#search_person").val(self.udata.attributes.user_name);

            var md = moment(self.udata.attributes.startTime);

            $("#date").val(md.format('YYYY-MM-DD'));

            $("#startTime").val(md.format('HH:mm'));

            $("#endTime").val(moment(self.udata.attributes.endTime).format('HH:mm'));

            $("#admin_id").val(self.udata.attributes.owner);
          } else {
            if( self.isAdmin ) {
              $("#admin_id").val( window.user()._id );
            }
          }

          self.$el.trigger('create');

          self.joinEvents();

          self.loadSearch();
        }
      });

      return this;
    },

    loadSearch: function() {
      var self = this;

      $("#search_person").on("keyup", function(e) {
        if ($(this).val().length == 0) {
          $("#users_results").empty();

          return;
        }
        var result = self.sifter.search($(this).val(), {
          fields: ['firstname', 'lastname'],
          sort: 'firstname',
          direction: 'desc'
        });

        $("#users_results").empty();
        _.each(result.items, function(r) {
          var row = self.usersData[r.id];

          $("#users_results").append('<li data-uid="' + row._id + '">' + row.firstname + ' ' + row.lastname + '</li>');
        });

        $("#users_results").on('click tap', 'li', function(e) {
          $('#search_person').val($(this).text());
          $('#user_name').val($(this).text());
          $('#uid').val($(this).attr('data-uid'));

          $("#users_results").empty();
        });

        return false;
      });
    },

    checkData: function() {
      var self = this;

      if (persistence.size() == 0) {

      } else {
        $("#list-data").empty();

        persistence.each(function(row) {
          if (!_.isUndefined(row.get('retweeted_status'))) {
            $("#list-data").append(self.row_template({
              id: row.get('id'),
              name: row.get('retweeted_status').user.name,
              info: 'Retweets: ' + row.get('retweet_count') + ' - Favorites: ' + row.get('favorite_count'),
              message: row.get('text')
            }));
          }
        });

        document.getElementById('list-data').refresh();
      }
    },

    joinEvents: function() {
      var self = this;

      $('#startTime').on('keyup', function(e) {
        var st = $("#startTime").val().split(':');

        var et = (parseInt(st[0]) + 1) + ':' + st[1];
        $("#endTime").val(et);
      });

      $("#save_appointment").on('click tap', function(e) {
        e.stopPropagation();

        var data = {};

        if (_.isEmpty($("#uid").val()) || _.isEmpty($("#startTime").val()) || _.isEmpty($("#endTime").val()) || _.isEmpty($("#date").val())) {
          dialogs.toast("Debe completar todos los campos");

          return;
        }

        data.updated = undefined;
        if (!_.isUndefined(self.options.aid)) {
          data._id = self.options.aid;
        }

        data.user = $("#uid").val();
        data.user_name = $("#user_name").val();

        var st = $("#startTime").val().split(':');
        data.startTime = moment($("#date").val()).hour(st[0]).minute(st[1]);

        var et = $("#endTime").val().split(':');
        data.endTime = moment($("#date").val()).hour(et[0]).minute(et[1]);

        if (!_.isUndefined(self.options.aid)) {
          if (!moment(self.udata.attributes.startTime).isSame(data.startTime)) {
            data.updated = self.udata.attributes.startTime;
            data.confirmed = false;
          }
        }

        data.owner = $("#admin_id").val();

        var csave = new calendarModel(data);
        csave.save({}, {
          success: function() {
            window.router.navigate('#appointments', {
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