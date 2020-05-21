'use strict';

module.exports = async function betInteraction(interactionOptions) {
	const {blockAction, channelId, slackWebClient, teamId, userId} = interactionOptions;
	const {Race} = interactionOptions.models;

	const race = await Race.findOne({
		horses: {$elemMatch: {_id: blockAction.value}}
	});
	if (!race) {
		throw new Error('Horse does not exist');
	}

	await race.placeBet({
		slackWebClient,
		horseId: blockAction.value,
		raceId: race._id,
		slackChannelId: channelId,
		slackUserId: userId,
		slackTeamId: teamId
	});
};
