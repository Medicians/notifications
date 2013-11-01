var mongoose = require('mongoose'),
	crypto = require('crypto'),
	_ = require('underscore');

// notifications.medicians.org

/*
 * GET home page.
 */

exports.index = function(req, res) {
	
};

exports.send_email = function(req, res) {
	var email = require('../helpers/email');

	email.send_email(req.body);

	res.json({
		result: true
	});
};

exports.send_short_message = function(req, res) {
	var sm = require('../helpers/shortmessage');
	
	sm.send_message(req.body);

	res.json({
		result: true
	});
};