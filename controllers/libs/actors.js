
const Model = require("../../models/actor");
const Events = require("./events");
const _ = require("lodash");

function Actors() {

}


// Actors.prototype.getListOfAllContributedRepo = function (loginName) {
//     var self = this, actor;
//     return new Promise(function (resolve, reject) {
//         self.getActorByLoginName(loginName)
//             .then(function (a) {
//                 console.log(a);
//                 actor = a;
//
//             .catch(function (err) {
//                 reject(err);
//             })
//     });
// };


Actors.prototype.getActorByLoginName = function (login) {
    return Model.findOne({login: login}).lean().exec();
};


module.exports = new Actors();