'use strict';

const {Schema} = require('@rowanmanning/app');

module.exports = function initBetModel() {

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
