'use strict';

module.exports = async function startRaceInChannelInteraction(interactionOptions) {
	const {payload, slackWebClient, view} = interactionOptions;
	await {
		payload,
		slackWebClient
	};
	console.log('VIEW SUBMISSION', view);
};
