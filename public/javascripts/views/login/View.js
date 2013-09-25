define([
  'underscore',
  'backbone',
  'ashe',
  'urls',
  'helper/dialogs',
  'text!./template.html',
  'jquery'], function(_, Backbone, Ashe, urls, dialogs, templateData, $) {

  var View = Backbone.View.extend({
    el: $("#app-container"),

    render: function() {
      this.$el.html(Ashe.parse(templateData, {}));

      this.$el.trigger('create');

      this.joinEvents();

      return this;
    },

    joinEvents: function() {
      var self = this;

      $("#do_login").on('click tap', function(e) {
        $.post( urls.login, {
          username: $("#username").val(),
          password: $("#password").val()
        }, function(data) {
          if( data.response ) {
            localStorage.setItem('user', JSON.stringify( data.data ) );

            window.router.navigate('#', { trigger: true });
          } else {
            dialogs.toast('Usuario o contraseña incorrecta');
          }
        }, 'json' );

        return false;
      });

    },

  });

  return View;

});