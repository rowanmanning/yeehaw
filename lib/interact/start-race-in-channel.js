'use strict';

module.exports = async function startRaceInChannelInteraction(interactionOptions) {
	const {payload, slackWebClient, view} = interactionOptions;
	const channelInput = view.state.values.channelInput;
	console.log('CHANNEL INPUT', channelInput);
	console.log('SELECTED CHANNEL', channelInput.channelInputSelect.selected_channel);

	await {
		payload,
		slackWebClient
	};
	console.log('VIEW SUBMISSION', view);
};
