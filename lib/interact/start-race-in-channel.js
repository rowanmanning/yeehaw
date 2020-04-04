'use strict';

module.exports = async function startRaceInChannelInteraction(interactionOptions) {
	const {slackWebClient, teamId, userId, view} = interactionOptions;
	const {Race} = interactionOptions.models;
	const channelInput = view.state.values.channelInput;
	const channelId = channelInput.channelInputSelect.selected_channel;

	// Set up the race and save basic details
	const race = await Race.create({
		channelId,
		teamId,
		userId
	});

	// Run the race
	await race.runOnSlack(slackWebClient);
};
