'use strict';

module.exports = function initBetModel(app) {
	const {Schema} = app;

	return new Schema({
		slackUserId: {
			type: String,
			required: true,
			index: true
		},
		raceId: {
			type: String,
			required: true,
			index: true
		},
		horseId: {
			type: String,
			required: true
		}
	}, {timestamps: true});

};
