var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = new mongoose.Schema({
    title: { type: String, required: true, label: 'Title'},
    email: { type: String, required: true, label: ''}
});

var config = module.exports = mongoose.model('Config', schema);
config.single = true;
config.label = 'Config';