'use strict';

const placeBet = require('../../lib/race/bet');

/**
 * @param {object} options
 *     Action options.
 * @param {import('@slack/bolt').App} options.app
 *     The app to add the action to.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeBetAction({app, logger, mongoose}) {
	const Race = mongoose.model('Race');

	// Handle the race betting action
	app.action('bet', async ({ack, action, body, client}) => {
		// @ts-ignore
		const horseId = `${action?.value}`;

		let log = logger.child({
			action: 'bet',
			teamId: body.team?.id,
			userId: body.user?.id,
			horseId
		});

		try {
			await ack();

			const race = await Race.findOne({
				horses: {$elemMatch: {_id: horseId}}
			});
			if (!race) {
				throw new Error('Horse does not exist');
			}

			log = log.child({
				raceId: race.id
			});

			log.info({
				msg: 'Action executed'
			});

			await placeBet({
				horseId,
				logger: log,
				mongoose,
				race,
				slackClient: client,
				userId: body.user.id
			});
		} catch (/** @type {any} */ error) {
			log.error({
				msg: 'Action failed',
				error: error.message
			});
			throw error;
		}
	});

};
