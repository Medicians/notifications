var nodemailer = require('nodemailer'),
	path = require('path'),
	moment = require('moment'),
	emailTemplates = require('swig-email-templates');

moment.lang('es');

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: "smtp.mailgun.org", // hostname
	port: 587,
	domain: "medicians.mailgun.org",
	auth: {
		domain: "medicians.mailgun.org",
		user: "postmaster@medicians.mailgun.org",
		pass: "3pw6chzqsol4"
	}
});

exports.send_email = function(data) {

	if (data.ics == 1) {
		var ics_file = 'BEGIN:VCALENDAR\n';
		ics_file += 'VERSION:2.0\n';
		ics_file += 'PRODID:-//hacksw/handcal//NONSGML v1.0//EN\n';
		ics_file += 'BEGIN:VEVENT\n';
		ics_file += 'UID:' + data.from + '\n';
		ics_file += 'DTSTAMP:' + moment(data.startTime).format('YYYYMMDTHHmmssZ') + '\n'; //19970714T170000Z
		ics_file += 'ORGANIZER;CN=' + data.sign_name + ':MAILTO:' + data.from + '\n';
		ics_file += 'DTSTART:' + moment(data.startTime).format('YYYYMMDTHHmmssZ') + '\n';
		ics_file += 'DTEND:' + moment(data.endTime).format('YYYYMMDTHHmmssZ') + '\n';
		ics_file += 'SUMMARY:' + data.eventSummary + '\n';
		ics_file += 'END:VEVENT\n';
		ics_file += 'END:VCALENDAR';
	}

	emailTemplates({
		root: app.get('templates_path')
	}, function(err, render, generateDummy) {
		render('basic.html', data, function(err, html) {
			var mailOptions = {
				from: data.from,
				to: data.to,
				subject: data.subject,
				html: html
			};

			if( data.ics == 1 ) {
				mailOptions.alternatives = [{
					contentType: 'text/calendar; method=REQUEST; name="meeting.ics"',
					contents: new Buffer(ics_file, 'utf8'),
					contentEncoding: 'utf8'
				}];
			}

			smtpTransport.sendMail(mailOptions, function(err, res) {
				if (err) console.log(err);
				console.log('done');
			});
		});
	});
};