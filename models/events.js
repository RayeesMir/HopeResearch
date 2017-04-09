const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventSchema = new Schema({
    eventId: {
        type: String,
        required: true
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: "EventType",
        required: true,
        index: true
    },
    actor: {
        type: Schema.Types.ObjectId,
        ref: "Actor"
    },
    repoId: {
        type: Schema.Types.ObjectId,
        ref: "Repo",
        index: true
    },
    eventDate: {
        type: Date
    },
    public: {
        type: Boolean
    }

});

module.exports = mongoose.model('Event', EventSchema);