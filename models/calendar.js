var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types,
    moment = require('moment'),
    Mailgun = require('mailgun').Mailgun;

moment.lang('es');

var schema = mongoose.Schema({
	user: { type: Types.ObjectId, ref: 'User', required: true },
	user_name: { type: String, required: true },
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	confirmed: { type: Boolean, default: false, required: true },
	special: { type: Boolean, default: false, required: true },
	updated: { type: Date, required: false },
	owner: { type: Types.ObjectId, ref: 'User', required: true },
	updated_at : { type: Date },
	created: { type: Date, 'default' : (new Date()) }
});

schema.pre('save', function(next) {
	// Update updated
  	this.updated_at = (new Date());

  	next();
});

schema.post('save', function (doc) {
	var mg = new Mailgun(app.get('mailgun_key'));

	mongoose.model('Config').find({}, function(err, configs) {
		mongoose.model('User').findById(doc.user, function(err, user) {
			mongoose.model('User').findById(doc.owner, function(err, adminUser) {
				var text = "Estimado " + doc.user_name + '\n\n';
			
				if( doc.updated != undefined ) {
					text += "Su turno ha sido actualizado: \n";
					text += "Médico: " + adminUser.firstname + ' ' + adminUser.lastname + '\n';
					text += "Turno anterior: " + moment( doc.updated ).format('LLL');
					text += "\nNuevo turno: " + moment( doc.startTime ).format('LLL');
				} else {
					text += "Su turno: \n";
					text += "Médico: " + adminUser.firstname + ' ' + adminUser.lastname + '\n';
					text += "Fecha y Hora: " + moment( doc.startTime ).format('LLL');
				}

				text += '\n\nConfirme su turno haciendo click en el siguiente enlace: \n';
				text += app.get('server_url') + '/appointment/confirm/' + doc._id;

				text += "\n\n" + configs[0].title;

				mg.sendText(configs[0].email, user.email, 'Confirmación Turno', text);
			});
		});
	});

});

var Calendar = module.exports = mongoose.model('Calendar', schema);