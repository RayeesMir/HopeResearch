const EventCtrl = require("./libs/events");
const ActorsCtrl = require("./libs/actors");
const RepoCtrl = require("./libs/repo");
const Helper = require("../lib/helper")

function ResourceHandler() {

}

// Return records filtered by the repository id and event type
ResourceHandler.prototype.getFilteredRepoByEventType = function(request, response) {

    // If the any of Params are not present this function will not hit
    // so no need to validate for empty 
    const event = request.params.event;
    const repo = request.params.repo;

    EventCtrl.getRepoFilteredByIdAndEvent(repo, event)
        .then(function(result) {
            Helper.sendSuccess(response, result, "events");
        })
        .catch(function(err) {
            Helper.sendError(response, err);
        });
};


// Return actor details and list of contributed repositories by actor login
ResourceHandler.prototype.getActorDetailsByLogin = function(request, response) {

    const login = request.params.login;
    EventCtrl.getActorAndHisRepo(login)
        .then(function(result) {
            Helper.sendSuccess(response, result, "actorDetails");
        })
        .catch(function(err) {
            Helper.sendError(response, err);
        });
};


// Find the repository with the highest number of events from an actor (by login).
// If multiple repos have the same number of events, return the one with the latest event.
ResourceHandler.prototype.getRepoWithHighestActions = function(request, response) {

    const login = request.params.login;
    EventCtrl.getHighestEventsByUser(login)
        .then(function(result) {
            Helper.sendSuccess(response, result, "repo");
        })
        .catch(function(err) {
            Helper.sendError(response, err);
        });

};


//Return list of all repositories with their top contributor (actor with most events).

ResourceHandler.prototype.getRepoWithAllTopActors = function(request, response) {
    const offset = parseInt(request.query.offset) || 0;
    const limit = parseInt(request.query.limit) || 20;

    EventCtrl.getAllRepoWithToContributor(offset, limit)
        .then(function(result) {
            Helper.sendSuccess(response, result, "repo");
        })
        .catch(function(err) {
            Helper.sendError(response, err);
        });

};


// Delete the history of actor’s events by login
ResourceHandler.prototype.deleteHistoryByActors = function(request, response) {

    const login = request.params.login;

    EventCtrl.removeHistoryByLoginName(login)
        .then(function(result) {
            Helper.sendSuccess(response, result, "result");
        })
        .catch(function(err) {
            Helper.sendError(response, err);
        });

};


module.exports = new ResourceHandler();