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
Events.prototype.getRepoFilteredByIdAndEvent = function(id, event) {
    return new Promise(function(resolve, reject) {
        Promise.all([Repo.getRepoByExtId(id), EventType.getEvent(event)])
            .then(function(results) {
                return Model.find({
                        repoId: results[0]._id,
                        type: results[1]
                    })
                    .populate("type")
                    .populate("repoId")
                    .populate("actor")
                    .lean().exec();
            })
            .then(function(result) {
                resolve(result);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};

Events.prototype.getListOfAllContributedRepo = function(login) {
    var self = this,
        actor;
    return new Promise(function(resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function(a) {
                actor = a;
                return self.getAllEventsWithActorContribs(a._id);
            })
            .then(function(events) {
                actor.repos = events.map(function(event) {
                    return event.repoId;
                });
                actor.repos = _.uniqBy(actor.repos, function(o) {
                    return o._id;
                });
                resolve(actor);
            })
            .catch(function(err) {
                reject(err);
            })
    });

};
Events.prototype.getActorAndHisRepo = function(login) {
    const self = this;
    let actor;
    return new Promise(function(resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function(a) {
                actor = a;
                return Model.aggregate(
                    [{
                        $match: {
                            "actor": a._id
                        }
                    }, {
                        $lookup: {
                            from: "repos",
                            localField: "repoId",
                            foreignField: "_id",
                            as: "Repository"
                        }
                    }, {
                        $lookup: {
                            from: "actors",
                            localField: "actor",
                            foreignField: "_id",
                            as: "Actor"
                        }
                    }, {
                        $group: {
                            _id: {
                                "Actor": "$actor"
                            },
                            Repository: {
                                $push: "$Repository"
                            },
                            Actor: {
                                $push: "$Actor"
                            }

                        }
                    }, {
                        $project: {
                            "Repository": 1,
                            "Actor": {
                                $slice: ["$Actor", 1]
                            },
                            _id: 0
                        }
                    }]
                ).exec()
            })
            .then(function(actorRepos) {
                let repos = _.flatten(actorRepos[0].Repository)
                let actor = _.flatten(actorRepos[0].Actor)
                let uniqRepo = _.uniqBy(repos, function(o) {
                    return o.repoId;
                });
                const result = {
                    actor: actor[0],
                    repositories: uniqRepo
                }
                resolve(result);
            })
            .catch(function(err) {
                reject(err);
            })
    });

};

Events.prototype.getAllEventsWithActorContribs = function(actorId) {
    return Model.find({
        actor: actorId
    }).populate("repoId").lean().exec();
};


// Find the repository with the highest number of events from an actor (by login).
// If multiple repos have the same number of events, return the one with the latest event.
Events.prototype.getHighestActionByUser = function(login) {
    const self = this;
    return new Promise(function(resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function(actor) {
                return self.getAllEventsWithActorContribs(actor);
            })
            .then(function(events) {
                // This portion has been written badly. Can be improved a lot.
                let groups = _.groupBy(events, function(o) {
                    return o.repoId._id;
                });
                let repos = [],
                    maxCount = 0;
                _.forOwn(groups, function(value, key) {
                    let repo = value[0].repoId;
                    repo.events = value.map(function(v) {
                        v.repoId = undefined;
                        return v;
                    });
                    repo.count = value.length;
                    if (maxCount < value.length) {
                        maxCount = value.length;
                    }
                    repo.latestDate = _.sortBy(value, function(o) {
                        return o.eventDate;
                    })[0].eventDate;
                    repos.push(repo);
                });

                repos = _.sortBy(repos, function(r) {
                    return r.count;
                });
                if (repos.length > 1) {
                    if (repos[0].count === repos[1].count) {
                        repos = repos.filter(function(o) {
                            return o.count === maxCount;
                        }).sort(function(o) {
                            return o.eventDate;
                        })
                    }
                }
                resolve(repos[0]);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};

//Return list of all repositories with their top contributor (actor with most events).
Events.prototype.getAllTopActorsForRepo = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        Repo.getAllRepo()
            .then(function(repos) {
                return Promise.map(repos, function(repo) {
                    return new Promise(function(resolve, reject) {
                        self.getTopContributor(repo._id)
                            .then(function(name) {
                                repo.topContributor = name;
                                resolve(repo);
                            })
                            .catch(function(err) {
                                reject(err);
                            })
                    });
                });
            })
            .then(function(result) {
                resolve(result);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};

Events.prototype.getAllRepoWithToContributor = function(skip, limit) {
    var self = this;

    return new Promise(function(resolve, reject) {
        console.log("test")
        console.log(skip, limit)
        Model.aggregate(
                [{
                        $lookup: {
                            from: "repos",
                            localField: "repoId",
                            foreignField: "_id",
                            as: "Repostory"
                        }
                    }, {
                        $lookup: {
                            from: "actors",
                            localField: "actor",
                            foreignField: "_id",
                            as: "Actor"
                        }
                    }, {
                        $lookup: {
                            from: "eventtypes",
                            localField: "type",
                            foreignField: "_id",
                            as: "EventType"
                        }
                    }, {
                        $group: {
                            _id: {
                                "Repo": "$Repostory",
                                "topContributor": "$Actor"
                            },
                            totalContributions: {
                                $sum: 1
                            },
                            eventDates: {
                                $push: "$eventDate"
                            }

                        }

                    }, {
                        $project: {
                            "_id.Repo": 1,
                            "topContributor": {
                                $slice: ["$_id.topContributor", 1]
                            },
                            "totalContributions": 1,
                            "latestDate": {
                                $slice: ["$eventDates", -1]
                            }
                        }
                    }, {
                        $sort: {
                            count: -1,
                            "latestDate.0": -1
                        }
                    },

                    {
                        $skip: skip
                    }, {
                        $limit: limit
                    }
                ]
            ).exec()
            .then(function(repositories) {
                let result = [];
                _.forOwn(repositories, function(value, key) {
                    let repo = {};
                    repo.Repository = value._id.Repo[0];
                    repo.topContributor = value.topContributor[0];
                    repo.totalContributions = value.totalContributions;
                    repo.latestEventDate = value.latestDate[0]
                    result.push(repo);

                })
                resolve(result);
            })
            .catch(function(err) {
                console.log(err);
                reject(err);
            })
    });
};


Events.prototype.getTopContributor = function(id) {
    return new Promise(function(resolve, reject) {
        Model.find({
                repoId: id
            }).populate("actor").lean().exec()
            .then(function(events) {
                let groups = _.groupBy(events, function(o) {
                    return o.actor.login;
                });
                let topContributor = "",
                    maxCount = 0;
                _.forOwn(groups, function(value, key) {
                    if (maxCount < value.length) {
                        maxCount = value.length;
                        topContributor = key;
                    }
                });
                resolve(topContributor);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};
Events.prototype.getHighestEventsByUser = function(login) {
    const self = this;
    return new Promise(function(resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function(actor) {
                return Model.aggregate(
                    [{
                        $match: {
                            "actor": actor._id
                        }
                    }, {
                        $lookup: {
                            from: "repos",
                            localField: "repoId",
                            foreignField: "_id",
                            as: "Repostory"
                        }
                    }, {
                        $lookup: {
                            from: "actors",
                            localField: "actor",
                            foreignField: "_id",
                            as: "Actor"
                        }
                    }, {
                        $group: {
                            _id: {
                                "Repo": "$Repostory",
                                "Actor": "$Actor"
                            },
                            count: {
                                $sum: 1
                            },
                            eventDates: {
                                $push: "$eventDate"
                            }

                        }

                    }, {
                        $project: {
                            "_id.Repo": 1,
                            "Actor": {
                                $slice: ["$_id.Actor", 1]
                            },
                            "count": 1,
                            "latestDate": {
                                $slice: ["$eventDates", -1]
                            }
                        }
                    }, {
                        $sort: {
                            count: -1,
                            "latestDate.0": -1
                        }
                    }]
                ).exec();

            })
            .then(function(repos) {
                const result = {
                    actorId: repos[0].Actor[0].actorId,
                    login: repos[0].Actor[0].login,
                    gravatar_id: repos[0].Actor[0].gravatar_id,
                    url: repos[0].Actor[0].url,
                    avatar_url: repos[0].Actor[0].avatar_url,
                    repostory: repos[0]._id.Repo[0],
                    numberOfEvents: repos[0].count,
                    latestDate: repos[0].latestDate[0],

                }
                resolve(result);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};


Events.prototype.removeHistoryByLoginName = function(login) {
    return new Promise(function(resolve, reject) {
        Actors.getActorByLoginName(login)
            .then(function(actor) {
                return Model.remove({
                    actor: actor._id
                }).lean().exec();
            })
            .then(function(result) {
                resolve(result);
            })
            .catch(function(err) {
                reject(err);
            })
    });
};


module.exports = new Events();