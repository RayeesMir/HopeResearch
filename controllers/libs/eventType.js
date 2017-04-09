
const Model = require("../../models/eventType");


function EventType() {

}

EventType.prototype.getEvent = function (nameOrId) {
    return new Promise(function (resolve, reject) {
        console.log("Match", new RegExp(/Event$/).test(nameOrId));
        if (new RegExp(/Event$/).test(nameOrId)) {
            Model.findOne({name: nameOrId}).lean().exec()
                .then(function (eventType) {
                    resolve(eventType._id);
                })
                .catch(function (err) {
                    reject(err);
                })
        } else {
            resolve(nameOrId);
        }
    });
};

module.exports = new EventType();