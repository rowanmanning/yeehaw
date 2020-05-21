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

	betSchema.static('getBettingRatiosForTeam', async teamId => {
		const races = await app.models.Race.find({teamId});
		const winningHorseIds = races
			.reduce((horses, race) => {
				return horses.concat(race.horses.filter(horse => horse.finishingPosition === 1));
			}, [])
			.map(horse => horse.id);
		const bets = await app.models.Bet.find({slackTeamId: teamId});
		const betRatiosByUser = bets.reduce((ratios, bet) => {
			ratios[bet.slackUserId] = ratios[bet.slackUserId] || {
				userId: bet.slackUserId,
				bets: 0,
				wins: 0
			};
			ratios[bet.slackUserId].bets += 1;
			if (winningHorseIds.includes(bet.horseId)) {
				ratios[bet.slackUserId].wins += 1;
			}
			return ratios;
		}, {});
		return Object.values(betRatiosByUser).map(userBettingDetails => {
			userBettingDetails.ratio = userBettingDetails.wins / userBettingDetails.bets;
			return userBettingDetails;
		});
	});

	return betSchema;
};
