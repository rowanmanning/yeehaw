'use strict';

module.exports = async function startRaceInChannelInteraction(interactionOptions) {
	const {payload, slackWebClient, view} = interactionOptions;
	const channel = view.state.values.channel;
	console.log('CHANNEL VALUE', channel);

	await {
		payload,
		slackWebClient
	};
	console.log('VIEW SUBMISSION', view);
};
