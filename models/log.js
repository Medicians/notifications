var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = mongoose.Schema({
	log: { type: String, required: true },
	owner: { type: String, required: true },
	created: { type: Date, 'default' : (new Date()) }
});

var Log = module.exports = mongoose.model('Log', schema);