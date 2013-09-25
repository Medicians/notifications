define([
  'underscore',
  'backbone',
  'ashe',
  'text!./template.html',
  'jquery',
  'jquery_depend'], function(_, Backbone, Ashe, templateData, $) {

  var View = Backbone.View.extend({
    el: $("#sidebar"),

    render: function() {
      $("#sidebar").replaceWith(Ashe.parse(templateData, {
        isAdmin: (window.user().type == 'admin')
      }));

      $("#sidebar").trigger('create');

      if ( $.platform.mobile ) {
        $("#menu").show();

        $("#panel").panel({
          dismissible: true,
          swipeClose: true,
          display: 'overlay'
        });

        $("#menu").on('click tap', function(e) {
          if ($.mobile.activePage.jqmData("panel") !== "open") {
            $("#panel").panel("open");
          } else {
            $("#panel").panel("close");
          }

          return false;
        });
      } else {
        $("#menu").hide();
      }

      this.joinEvents();

      return this;
    },

    joinEvents: function() {
      var self = this;

      $("#tab-add").on('click tap', function(event) {

        return false;
      });

      $("#tab-list").on('click tap', function(event) {

        return false;
      });
    },

  });

  return View;

});