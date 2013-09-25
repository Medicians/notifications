var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = mongoose.Schema({
	user: { type: Types.ObjectId, ref: 'User', required: true },
	text: { type: String, required: true },
	owner: { type: Types.ObjectId, ref: 'User', required: true },
	updated_at : { type: Date },
	created: { type: Date, 'default' : (new Date()) }
});

schema.pre('save', function(next) {
	// Update updated
  	this.updated_at = (new Date());

  	next();
});

var Story = module.exports = mongoose.model('Story', schema);