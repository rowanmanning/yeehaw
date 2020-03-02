'use strict';

module.exports = function initRaceModel(app) {
	const {Schema} = app;

	return new Schema({
		complete: {
			type: Boolean,
			required: true,
			default: false
		}
	});

};
