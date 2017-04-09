const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RepoSchema = new Schema({
    repoId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
});

module.exports = mongoose.model('Repo', RepoSchema);