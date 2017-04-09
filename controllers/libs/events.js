
const Model = require("../../models/events");
const Repo = require("./repo");
const Actors = require("./actors");
const EventType = require("./eventType");
const _ = require("lodash");
const Promise = require("bluebird");

function Events() {

}

// TODO - Return records filtered by the repository id and event type
// Get event from frontend by id rather than plain string "CreateEvent" to avoid ambiguity.
Events.prototype.getRepoFilteredByIdAndEvent = function (id, event) {
    return new Promise(function (resolve, reject) {
        Promise.all([Repo.getRepoByExtId(id), EventType.getEvent(event)])
            .then(function (results) {
                console.log(results);
                return Model.find({repoId: results[0]._id, type: results[1]})
                    .populate("type")
                    .populate("repoId")
                    .populate("actor")
                    .lean().exec();
            })
            .then(function (result) {
                resolve(result);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

Events.prototype.getListOfAllContributedRepo = function (login) {
    var self = this, actor;
    return new Promise(function (resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function (a) {
                actor = a;
                return self.getAllEventsWithActorContribs(a._id);
            })
            .then(function (events) {
                actor.repos = events.map(function (event) {
                    console.log(event);
                    return event.repoId;
                });
                actor.repos = _.uniqBy(actor.repos, function (o) {
                    return o._id;
                });
                resolve(actor);
            })
            .catch(function (err) {
                reject(err);
            })
    });

};


Events.prototype.getAllEventsWithActorContribs = function (actorId) {
    return Model.find({actor: actorId}).populate("repoId").lean().exec();
};


// Find the repository with the highest number of events from an actor (by login).
// If multiple repos have the same number of events, return the one with the latest event.
Events.prototype.getHighestActionByUser = function (login) {
    const self = this;
    return new Promise(function (resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function (actor) {
                return self.getAllEventsWithActorContribs(actor);
            })
            .then(function (events) {
                // This portion has been written badly. Can be improved a lot.
                let groups = _.groupBy(events, function (o) {
                    return o.repoId._id;
                });
                let repos = [], maxCount=0;
                _.forOwn(groups, function (value, key) {
                    let repo = value[0].repoId;
                    repo.events = value.map(function (v) {
                        v.repoId = undefined;
                        return v;
                    });
                    repo.count = value.length;
                    if (maxCount < value.length) {
                        maxCount = value.length;
                    }
                    repo.latestDate = _.sortBy(value, function (o) {
                        return o.eventDate;
                    })[0].eventDate;
                    repos.push(repo);
                });

                repos = _.sortBy(repos, function (r) {
                    return r.count;
                });
                if (repos.length > 1) {
                    if (repos[0].count === repos[1].count) {
                        repos = repos.filter(function (o) {
                            return o.count === maxCount;
                        }).sort(function (o) {
                            return o.eventDate;
                        })
                    }
                }
                resolve(repos[0]);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

//Return list of all repositories with their top contributor (actor with most events).
Events.prototype.getAllTopActorsForRepo = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        Repo.getAllRepo()
            .then(function (repos) {
                return Promise.map(repos, function (repo) {
                    return new Promise(function (resolve, reject) {
                        self.getTopContributor(repo._id)
                            .then(function (name) {
                                repo.topContributor = name;
                                resolve(repo);
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                    });
                });
            })
            .then(function (result) {
                resolve(result);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

Events.prototype.getTopContributor = function (id) {
    return new Promise(function (resolve, reject) {
        Model.find({repoId: id}).populate("actor").lean().exec()
            .then(function (events) {
                let groups = _.groupBy(events, function (o) {
                    return o.actor.login;
                });
                let topContributor = "", maxCount = 0;
                _.forOwn(groups, function (value, key) {
                    if (maxCount < value.length) {
                        maxCount = value.length;
                        topContributor = key;
                    }
                });
                resolve(topContributor);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

Events.prototype.removeHistoryByLoginName = function (login) {
    return new Promise(function (resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function (actor) {
                return Model.remove({actor: actor._id}).lean().exec();
            })
            .then(function (result) {
                resolve(result);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};


module.exports = new Events();