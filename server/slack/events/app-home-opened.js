'use strict';

const {divider, markdownSection} = require('../../lib/slack/block-kit-helpers');

const numberFormatter = new Intl.NumberFormat('en');

/**
 * @param {object} options
 *     Event options.
 * @param {import('@slack/bolt').App} options.app
 *     The app to add the event to.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeHomeView({app, logger, mongoose}) {
	const Bet = mongoose.model('Bet');
	const Race = mongoose.model('Race');

	// Handle the home page view
	app.event('app_home_opened', async ({client, context, event}) => {
		const log = logger.child({
			event: 'app_home_opened'
		});
		try {
			log.info({
				msg: 'Event received',
				userId: event.user
			});

			// Get leaderboard details
			const teamId = `${context?.teamId}`;

			const winningBetCounts = await getWinningBetCounts({
				Bet,
				Race,
				teamId
			});

			const leaderboard = winningBetCounts.slice(0, 10).map(([userId, count]) => {
				return `*<@${userId}>:* ${numberFormatter.format(count)} winning bets`;
			}).join('\n');

			await client.views.publish({
				user_id: event.user,
				view: {
					type: 'home',
					blocks: [
						markdownSection('Yeehaw! You can race horses in Slack channels using the `/race` command.'),
						divider(),
						(
							winningBetCounts.length ?
								markdownSection(`*Leaderboard*\nThese are the top betters across all of Slack\n${leaderboard}`) :
								markdownSection(`*Leaderboard*\nRace some horses and a leaderboard will appear here`)
						)
					]
				}
			});
		} catch (/** @type {any} */ error) {
			log.error({
				msg: 'View failed',
				error: error.message
			});
			throw error;
		}
	});

};

/**
 * Get the number of winning bets per user.
 *
 * @param {object} options
 *     Bet options.
 * @param {import('mongoose').Model} options.Bet
 *     The Bet model.
 * @param {string} options.teamId
 *     The Slack team to scope bets to.
 * @param {import('mongoose').Model} options.Race
 *     The Race model.
 */
async function getWinningBetCounts({Bet, Race, teamId}) {
	const races = await Race.find({teamId});
	const winningHorseIds = races
		.reduce((horses, race) => {
			return horses.concat(race.get('horses').filter(horse => horse.get('finishingPosition') === 1));
		}, [])
		.map(horse => horse.id);
	const winningBets = await Bet.find({horseId: {$in: winningHorseIds}});
	const winningBetCountsByUser = winningBets.reduce((counts, bet) => {
		const slackUserId = bet.get('slackUserId');
		counts[slackUserId] = counts[slackUserId] || 0;
		counts[slackUserId] += 1;
		return counts;
	}, {});
	return Object.entries(winningBetCountsByUser).sort(([, count1], [, count2]) => {
		return count1 - count2;
	});
}
