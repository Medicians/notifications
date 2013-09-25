var cronJob = require('cron').CronJob,
	mongoose = require('mongoose'),
	moment = require('moment'),
	Mailgun = require('mailgun').Mailgun,
	whatsapp = require('./whatsapp');

exports.start = function() {
	// '00 00 5 * * *'

	var job = new cronJob({
		cronTime: '00 00 5 * * *',
		onTick: function() {
			var mg = new Mailgun(app.get('mailgun_key'));
			//runs once at the specified date.
			mongoose.model('Config').find({}, function(err, configs) {
				var config = configs[0];

				mongoose.model('Calendar').find({
					startTime: {
						$gte: moment().hour(0).minute(0).second(0).toDate(),
						$lt: moment().add('d', 1).hour(0).minute(0).second(0).toDate()
					}
				}, function(err, data) {
					for (var i in data) {
						var doc = data[i];

						mongoose.model('User').findById(doc.user, function(err, user) {
							mongoose.model('User').findById(doc.owner, function(err, adminUser) {
								var text = "Estimado " + doc.user_name + '\n\n';

								text += "Usted tiene programado un turno para hoy:\n"
								text += "Médico: " + adminUser.firstname + ' ' + adminUser.lastname + '\n';
								text += "Hora: " + moment(doc.startTime).format('LT');

								text += "\n\n" + config.title;

								mg.sendText(config.email, user.email, 'Recordatorio', text);

								if( user.whatsapp ) {
									whatsapp.send_message( user.phone, "Recordatorio turno a las " + moment(doc.startTime).format('LT') + ' con el médico ' + adminUser.firstname + ' ' + adminUser.lastname + '. Gracias.' );
								}
							});
						});

					}
				});

			});
		},
		onComplete: function() {
			// This function is executed when the job stops
		},
		start: true
	});
	job.start();
}