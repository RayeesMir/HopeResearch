
const Model = require("../../models/repo");
const Promise = require("bluebird");

function RepoFilter() {

}

RepoFilter.prototype.getAllRepo = function () {
    return Model.find().lean().exec();
};

RepoFilter.prototype.getRepoByExtId = function (id) {
    console.log("getRepoByExtId", id);
    return Model.findOne({repoId: id}).lean().exec();
};




module.exports = new RepoFilter();