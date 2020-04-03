'use strict';

const extractEmoji = require('../extract-emoji');

module.exports = async function startCommand(commandOptions) {
	const {channelId, slackWebClient, teamId, text, userId} = commandOptions;
	const {Race} = commandOptions.models;

	// Get the emoji to use in the start command. The entire
	// slash command string is read as emoji then limited to 5
	const emoji = extractEmoji(text).slice(0, 5);

	// Set up the race and save basic details
	const race = await Race.create({
		emoji: emoji.length ? emoji : undefined,
		channelId,
		teamId,
		userId
	});

	// Run the race
	await race.runOnSlack(slackWebClient);
};
