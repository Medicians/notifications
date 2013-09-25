var mongoose = require('mongoose'),
	crypto = require('crypto'),
	_ = require('underscore');
/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', { isProd : ( app.get('env') != 'development' ) });
};

exports.login = function(req, res) {
	mongoose.model('User').auth(req.body.username, req.body.password, function(data) {
		if (data) {
			if (data.type == 'admin' || data.type == 'assistant') {
				res.json({
					response: true,
					data: {
						_id: data._id,
						email: data.email,
						firstname: data.firstname,
						lastname: data.lastname,
						type: data.type
					}
				});
			} else {
				res.json({
					response: false
				});
			}
		} else {
			res.json({
				response: false
			});
		}
	});
};


exports.confirm_appointment = function(req, res) {
	mongoose.model('Calendar').findByIdAndUpdate(req.params.aid, {
		$set: {
			confirmed: true
		}
	}, function(err) {
		res.end("Turno confirmado.");
	});
};