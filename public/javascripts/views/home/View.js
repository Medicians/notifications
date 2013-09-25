define([
  'underscore',
  'backbone',
  'ashe',
  'collections/calendar/collection',
  'helper/dialogs',
  'text!./template.html',
  'moment',
  'jquery',
  'fullcalendar'], function(_, Backbone, Ashe, calendarCollection, dialogs, templateData, moment, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    render: function() {
      this.$el.html(Ashe.parse(templateData, {}));

      this.$el.trigger('create');

      this.joinEvents();

      var self = this;

      var conditions = {};

      if( window.user().type == 'admin' ) {
        conditions.conditions = {
          owner: window.user()._id
        };
      }

      calendarCollection.baucis(conditions).then(function() {
        var filtered = calendarCollection.toJSON();

        self.events_data = [];
        for (var i in filtered) {
          var bckColor = "red";
          if (filtered[i].confirmed) {
            bckColor = "green";
          }

          self.events_data.push({
            _id: filtered[i]._id,
            title: filtered[i].user_name,
            start: moment(filtered[i].startTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            end: moment(filtered[i].endTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            backgroundColor: bckColor,
            borderColor: 'transparent'
          });
        }

        self.prepareCalendar(self.events_data);
      });

      return this;
    },

    prepareCalendar: function(events) {
      var date = new Date();
      var d = date.getDate();
      var m = date.getMonth();
      var y = date.getFullYear();

      $('#calendar').fullCalendar({
        header: {
          left: '',
          center: '',
          right: ''
        },
        events: events,
        droppable: false,
        editable: false,
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles',
          'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
        allDayDefault: false,
        eventClick: function(calEvent, jsEvent, view) {
          window.router.navigate("#appointment=" + calEvent._id, {
            trigger: true
          });
        }
      });

      this.showDate();
    },

    showDate: function() {
      var dt = $('#calendar').fullCalendar('getDate');

      $("#calendar_title").text($.fullCalendar.formatDate(dt, 'MMMM dd, yyyy', {
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles',
          'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
      }));
    },

    joinEvents: function() {
      var self = this;

      $("#calendar_today").on('click tap', function(e) {
        $('#calendar').fullCalendar('today');

        self.showDate();

        return false;
      });

      $("#calendar_prev").on('click tap', function(e) {
        $('#calendar').fullCalendar('prev');

        self.showDate();

        return false;
      });

      $("#calendar_next").on('click tap', function(e) {
        $('#calendar').fullCalendar('next');

        self.showDate();

        return false;
      });

      $("#calendar_month").on('click tap', function(e) {
        $('#calendar').fullCalendar('changeView', 'month');

        self.showDate();

        return false;
      });

      $("#calendar_week").on('click tap', function(e) {
        $('#calendar').fullCalendar('changeView', 'basicWeek');

        self.showDate();

        return false;
      });

      $("#calendar_day").on('click tap', function(e) {
        $('#calendar').fullCalendar('changeView', 'basicDay');

        self.showDate();

        return false;
      });

      $("#tab-add").on('click tap', function(event) {
        $("#add-container").show();
        $("#list-container").hide();

        return false;
      });

      $("#tab-list").on('click tap', function(event) {
        $("#add-container").hide();
        $("#list-container").show();

        return false;
      });

      $("#add-button").on('click tap', function(ev) {
        if ($("#name").val().trim() == "" || $("#search").val().trim() == "") {
          dialogs.showToast("You must complete all fields");
        } else {
          persistence.create({
            name: $("#name").val().trim(),
            search: $("#search").val().trim()
          });

          $("#name").val("");
          $("#search").val("");

          self.checkData();
          $("#add-container").hide();
          $("#list-container").show();

          self.actionbar.setSelectedTab($("#tab-list").get(0));
        }

        return false;
      });
    },

  });

  return View;

});