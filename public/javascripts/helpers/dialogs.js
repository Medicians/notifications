define(['text!./simple_dialog_template.html', 'text!./ask_dialog_template.html', 'ashe', 'backbone', 'backbone_modal', 'underscore'], function(SimpleTemplate, AskTemplate, Ashe, Backbone, _) {

	return {
		message: function(title, message) {
			var Modal = Backbone.Modal.extend({
				template: Ashe.parse(SimpleTemplate, {
					title: title,
					text: message
				}),
				cancelEl: '.bbm-button'
			});

			var modalView = new Modal();
        	$('#app-container').append(modalView.render().el);

		},

		toast: function(message) {
			this.message('Medicians', message);
		},

		ask: function(title, message, callback) {
			var Modal = Backbone.Modal.extend({
				template: Ashe.parse(AskTemplate, {
					title: title,
					text: message
				}),

				cancelEl: '.no',
				submitEl: '.yes',
				
				events: {
          			'click .yes': function(e) {
          				e.preventDefault();
          				callback(e, true);
          			},
          			/*'click .no': function(e) {
          				e.preventDefault();
          				callback(e, false);
          			},*/
        		},
			});

			var modalView = new Modal();
        	$('#app-container').append(modalView.render().el);
		}
	};

});