const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const config = require('./config');
mongoose.Promise = global.Promise;

mongoose.connect(config.getDbString())
    .then(function (con) {
        console.log("Database Connected");
    })
    .catch(function (err) {
        console.log("error connecting Database", err.message)
    });


const routes = require('./routes');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: false
}));


app.use('/', routes);

app.use(function (req, res, next) {    
    res.json({status:"error",message:"End point Not Defined"})
    next();
});


module.exports = app;