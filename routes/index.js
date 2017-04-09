const express = require('express');
const router = express.Router();
const eventsCtrl = require('../controllers/');
const ResourceHandler = require("../controllers/resource");

const ActorModel = require('../models/actor');
const RepoModel = require('../models/repo');
const EventModel = require('../models/events');


// router.get('/', eventsCtrl.dumpTodb);

//first route
router.get("/events/:repo/:event", ResourceHandler.getFilteredRepoByEventType);

//fourth route
router.get("/repo/all", ResourceHandler.getRepoWithAllTopActors);

//2nd route
router.get("/actor/:login", ResourceHandler.getActorDetailsByLogin);

//third route
router.get("/repo/highest/:login", ResourceHandler.getRepoWithHighestActions);

//last route
router.delete("/events/:login", ResourceHandler.deleteHistoryByActors);


module.exports = router;