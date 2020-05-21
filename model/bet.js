'use strict';

const {Schema} = require('@rowanmanning/app');

module.exports = function initBetModel(app) {

	const betSchema = new Schema({
		slackTeamId: {
			type: String,
			required: true,
			index: true
		},
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

	betSchema.static('findWinningBets', async function(teamId, channelId) {
		const query = {teamId};
		if (channelId) {
			query.channelId = channelId;
		}
		const races = await app.models.Race.find(query);
		const winningHorseIds = races
			.reduce((horses, race) => {
				return horses.concat(race.horses.filter(horse => horse.finishingPosition === 1));
			}, [])
			.map(horse => horse.id);
		return this.find({horseId: {$in: winningHorseIds}});
	});

	return betSchema;
};
