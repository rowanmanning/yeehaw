'use strict';

const {Schema} = require('@rowanmanning/app');

module.exports = function initBotModel() {

	return new Schema({
		slackAuthScope: {
			type: String,
			required: true
		},
		slackBotAccessToken: {
			type: String,
			required: true
		},
		slackBotUserId: {
			type: String,
			required: true
		},
		slackTeamId: {
			type: String,
			required: true,
			index: true
		},
		slackUserAccessToken: {
			type: String,
			required: true
		},
		slackUserId: {
			type: String,
			required: true
		}
	}, {timestamps: true});

};
