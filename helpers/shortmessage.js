var exec = require('child_process').exec,
	_ = require('underscore');

exports.send_message = function(data) {

	if (data.whatsapp == 1) {
		var pythonx = __dirname + '/yowsup/yowsup-cli';
		var config_file = __dirname + '/config.ws';

		var command = 'python ' + pythonx + ' -c ' + config_file + ' -s 549' + data.number + ' "' + data.text + '"';

		//console.info(command);

		exec(command, function(error, stdout, stderr) {
			//console.error(error);
			//console.info(stdout);
			//console.error(stderr);
		});
	} else {
		// Send to sender with SocketIO
		var socket = app.get('socket');

		if( _.isUndefined(socket) || socket == null ) {
			// Notify me
		} else {
			socket.emit('sms', {
				number: data.number,
				text: data.text
			});
		}
	}
};