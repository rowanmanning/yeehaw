'use strict';

/**
 * Place a bet on a horse.
 *
 * @param {object} options
 *     Race options.
 * @param {string} options.horseId
 *     The ID of the horse to bet on.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose instance to get the Bet model from.
 * @param {import('mongoose').Document} options.race
 *     The race the horse is running in.
 * @param {import('@slack/web-api').WebClient} options.slackClient
 *     The Slack client.
 * @param {string} options.userId
 *     The ID of the user who placed the bet.
 */
module.exports = async function placeBet({
	horseId,
	logger,
	mongoose,
	race,
	slackClient,
	userId
}) {
	const Bet = mongoose.model('Bet');

	/** @type {import('mongoose').Document} */
	const horse = race.get('horses').find(({_id}) => _id.toString() === horseId);
	const existingBet = await Bet.findOne({
		slackUserId: userId,
		raceId: race._id
	});

	let successMessage;
	if (existingBet) {
		if (existingBet.get('horseId') === horseId) {
			return;
		}
		existingBet.set('horseId', horseId);
		await existingBet.save();
		logger.info({
			msg: 'Bet changed'
		});
		successMessage = `<@${userId}> changed their bet to *_${horse.get('name')}_*.`;
	} else {
		const newBet = new Bet({
			slackTeamId: race.get('teamId'),
			slackUserId: userId,
			raceId: race._id,
			horseId
		});
		await newBet.save();
		logger.info({
			msg: 'Bet placed'
		});
		successMessage = `<@${userId}> bet on *_${horse.get('name')}_*.`;
	}

	await slackClient.chat.postMessage({
		channel: race.get('channelId'),
		thread_ts: race.get('messageTimestamp'),
		text: successMessage
	});
};
