const Events = require('../lib')
module.exports = {
	dumpTodb: function(request, response) {

		Events.run()
			.then((result) => {
				console.log(result)
				response.json("data being processed")
			})
			.catch((error) => {
				console.log(error)
			})
	}
};