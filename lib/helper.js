const errors = {
	// Request related Error codes
	300: "Invalid Quantity",
	301: "Query Parameters Missing",
	404: "Not Found",
	409: "Some parameters missing",
	411: "Invalid Params"
};

function CustomErrors() {

}


CustomErrors.prototype = {	
	sendError: function(code) {
		const builderData = {
			status: "failure",
			code: err.code,
			message: {
				error: error[code]
			}
		};
		response.json(builderData);
	},
	sendSuccess: function(response, data, key) {
		const builderData = {
			status: "success",
			code: 200
		};
		builderData.message = {};
		builderData.message[key] = data;
		return response.json(builderData);
	},

}


module.exports = new CustomErrors()