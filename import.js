const config = require('./config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Events = require('./lib');
mongoose.connect(config.getDbString())
	.then(function(con) {
		console.log("Database Connected");
		(function() {
			Events.run(config.dataSource)
				.then((result) => {
					console.log(result)
				})
				.catch((error) => {
					console.log(error)
				})
		})();
	})
	.catch(function(err) {
		console.log("error connecting Database", err.message)
	});
