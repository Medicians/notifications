var exec = require('child_process').exec;

exports.send_message = function(number, message) {
	var pythonx = __dirname + '/yowsup/yowsup-cli';
	var config_file = __dirname + '/config.ws';

	console.info(pythonx);
	console.info(config_file);

	console.info(number);
	console.info(message);

	var command = 'python ' + pythonx + ' -c ' + config_file + ' -s ' + number + ' "' + message + '"';

	console.info(command);

	exec(command, function(error, stdout, stderr) {
		console.error(error);
		console.info(stdout);
		console.error(stderr);
	});
};