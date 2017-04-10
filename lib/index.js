'use strict';
const request = require('request');
const zlib = require('zlib');
const async = require('async');
const ActorModel = require('../models/actor');
const RepoModel = require('../models/repo');
const EventModel = require('../models/events');
const EventTypeModel = require('../models/eventType');

function Events(dataSource) {
    this.dataSource = dataSource;
}

Events.prototype.fetchEvents = function() {
    let self = this;
    return new Promise(function(resolve, reject) {
        request.get(self.dataSource, function(error, response, body) {
            if (error)
                reject(error);
            else
                resolve(body);

        });
    })
};

Events.prototype.decompress = function(compressedData) {
    let self = this;
    return new Promise((resolve, reject) => {
        zlib.gunzip(compressedData, (error, uncompressedData) => {
            if (error)
                reject(error);
            else {
                let jsonData = uncompressedData.toString().trim().split(/\r?\n/).map(line => JSON.parse(line));
                resolve(jsonData);
            }
        });
    })
};

Events.prototype.saveActor = function(actor, callback) {
    var newActor;
    ActorModel.findOne({
            login: actor.login
        })
        .then(function(actorFound) {
            if (actorFound)
                return actorFound;
            else {
                newActor = {
                    actorId: actor.id,
                    login: actor.login,
                    gravatar_id: actor.gravatar_id,
                    url: actor.url,
                    avatar_url: actor.avatar_url
                };
                console.log("Inside save Actor");
                return new ActorModel(newActor).save();
            }

        })
        .then(function(savedActor) {
            return callback(null, savedActor);
        })
        .catch(function(error) {
            console.log(error);
            return callback(error);
        })
};

Events.prototype.saveRepo = function(repo, actor, callback) {
    RepoModel.findOne({
            repoId: repo.id
        }).exec()
        .then(function(repoFound) {
            if (repoFound)
                return repoFound;
            else {
                let newRepo = {
                    repoId: repo.id,
                    name: repo.name,
                    url: repo.url
                };
                return new RepoModel(newRepo).save();
            }
        })
        .then(function(repo) {
            console.log("Inside save repo");
            callback(null, repo, actor)
        })
        .catch(function(error) {
            console.log(error);
            callback(null)
        })
};

Events.prototype.saveEventType = function(eventType, repo, actor, callback) {
    EventTypeModel.findOne({
            name: eventType
        }).lean().exec()
        .then(function(eventName) {
            if (eventName) {
                return eventName;
            } else {
                const ev = new EventTypeModel({
                    name: eventType
                });
                return ev.save();
            }
        })
        .then(function(eventType) {
            console.log("Inside save event");
            callback(null, eventType, repo, actor);
        })
        .catch(function(error) {
            console.log(error);
            callback(null)
        })
};

Events.prototype.saveEvent = function(event, eventType, repo, actor, callback) {
    EventModel.findOne({
            eventId: event.id
        }).lean().exec()
        .then(function(eventFound) {
            if (eventFound)
                return eventFound;
            else {
                let newEvent = {
                    eventId: event.id,
                    type: eventType,
                    actor: actor,
                    repoId: repo,
                    eventDate: event.created_at,
                    public: event.public
                };
                return new EventModel(newEvent).save();
            }
        })
        .then(function(repo) {
            console.log("Inside save event");
            callback(null, repo)
        })
        .catch(function(error) {
            console.log(error);
            callback(null)
        })
};

Events.prototype.processEvent = function(event, index, savecb) {
    console.log(event.type, "=======", index);
    const self = this;
    async.waterfall(
        [
            function(callback) {
                self.saveActor(event.actor, callback)
            },
            function(actor, callback) {
                self.saveRepo(event.repo, actor._id, callback)
            },
            function(repo, actor, callback) {
                self.saveEventType(event.type, repo._id, actor, callback)
            },
            function(eventType, repo, actor, callback) {
                self.saveEvent(event, eventType._id, repo, actor, callback)
            }
        ],
        function(error, result) {
            if (!error)
                savecb()
        })
};


Events.prototype.saveData = function(events) {
    const self = this;
    return new Promise(function(resolve, reject) {
        async.eachOfSeries(events, function(event, index, callback) {
            self.processEvent(event, index, callback)
        }, function(error) {
            if (error)
                reject();
            else
                resolve("Data Saved");
        })
    })
};



module.exports = {
    run: function(source) {
        const event = new Events({
            uri: source,
            encoding: null,
        });
        return new Promise((resolve, reject) => {
            event.fetchEvents()
                .then((result) => {
                    return event.decompress(result);
                })
                .then((result) => {
                    console.log(result)
                    return event.saveData(result);
                })
                .then((result) => {
                    resolve(result)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
};