
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: {type: String, unique: true}
});

module.exports = mongoose.model('EventType', EventSchema);