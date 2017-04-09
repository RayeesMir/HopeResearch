const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ActorSchema = new Schema({
	actorId: {
		type: String,
		required: true
	},
	login: {
		type: String,
		required: true,
		index: true
	},
	gravatar_id: {
		type: String
	},
	url: {
		type: String
	},
	avatar_url: {
		type: String
	}
});

module.exports = mongoose.model('Actor', ActorSchema);