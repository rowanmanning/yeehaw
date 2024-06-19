'use strict';

const runRace = require('../../lib/race');

/**
 * @param {object} options
 *     Shortcut options.
 * @param {import('@slack/bolt').App} options.app
 *     The app to add the shortcut to.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeRaceShortcut({ app, logger, mongoose }) {
	// Setup the race shortcut
	app.shortcut('race', async ({ ack, client, shortcut }) => {
		const log = logger.child({
			shortcut: 'race',
			triggerId: shortcut.trigger_id
		});

		try {
			await ack();
			log.info({
				msg: 'Shortcut executed',
				teamId: shortcut.team?.id,
				teamDomain: shortcut.team?.domain,
				userId: shortcut.user?.id
			});
			await client.views.open({
				trigger_id: shortcut.trigger_id,
				view: {
					type: 'modal',
					callback_id: 'startRaceInChannel',
					clear_on_close: true,
					title: {
						type: 'plain_text',
						text: 'Set up your race'
					},
					submit: {
						type: 'plain_text',
						text: 'Start the race!'
					},
					close: {
						type: 'plain_text',
						text: 'Cancel'
					},
					blocks: [
						{
							type: 'input',
							block_id: 'channelInput',
							label: {
								type: 'plain_text',
								text: 'Channel'
							},
							element: {
								type: 'channels_select',
								action_id: 'channelInputSelect',
								placeholder: {
									type: 'plain_text',
									text: 'Which channel shall we start a race in?'
								}
							}
						}
					]
				}
			});
		} catch (/** @type {any} */ error) {
			log.error({
				msg: 'Shortcut failed',
				error: error.message
			});
			throw error;
		}
	});

	// Handle the race shortcut view action
	app.view('startRaceInChannel', async ({ ack, body, client, view }) => {
		const log = logger.child({
			view: 'startRaceInChannel',
			hash: view.hash
		});

		try {
			await ack();

			const channelId =
				view?.state?.values?.channelInput?.channelInputSelect?.selected_channel;

			log.info({
				msg: 'View executed',
				teamId: view.team_id,
				channelId,
				userId: body.user.id
			});
			if (!channelId) {
				throw new Error('No channel ID provided');
			}
			const { channel } = await client.conversations.info({ channel: channelId });
			if (channel?.id) {
				if (!channel.is_member && !channel.is_im) {
					await client.conversations.join({ channel: channel.id });
				}
				await runRace({
					channelId: channel.id,
					logger,
					mongoose,
					slackClient: client,
					teamId: view.team_id,
					userId: body.user.id
				});
			}
		} catch (/** @type {any} */ error) {
			log.error({
				msg: 'View failed',
				error: error.message
			});
			throw error;
		}
	});
};
