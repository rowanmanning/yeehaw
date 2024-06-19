'use strict';

const extractEmojiFromText = require('../../lib/emoji/extract-from-text');
const runRace = require('../../lib/race');

/**
 * @param {object} options
 *     Command options.
 * @param {import('@slack/bolt').App} options.app
 *     The app to add the command to.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeRaceCommand({ app, logger, mongoose }) {
	// Setup the race command
	app.command('/race', async ({ ack, client, command, respond }) => {
		const log = logger.child({
			command: 'race',
			triggerId: command.trigger_id
		});

		try {
			await ack();
			log.info({
				msg: 'Command executed',
				text: command.text,
				teamId: command.team_id,
				teamDomain: command.team_domain,
				channelId: command.channel_id,
				userId: command.user_id
			});
			const { channel } = await client.conversations.info({
				channel: command.channel_id
			});
			if (channel?.id) {
				if (!channel.is_member && !channel.is_im) {
					await client.conversations.join({ channel: channel.id });
				}
				if (command.text.startsWith('leaderboard')) {
					return await respond({
						text: 'The betting leaderboard has been moved to the home page for Yeehaw'
					});
				}
				await runRace({
					channelId: command.channel_id,
					emoji: extractEmojiFromText(command.text),
					logger,
					mongoose,
					slackClient: client,
					teamId: command.team_id,
					userId: command.user_id
				});
			}
		} catch (/** @type {any} */ error) {
			if (
				error?.code === 'slack_webapi_platform_error' &&
				error?.data?.error === 'channel_not_found'
			) {
				log.warn({
					msg: 'Channel not found'
				});
				if (command.channel_name === 'directmessage') {
					log.warn({
						msg: 'Attempt to race in a single-user DM'
					});
					return await respond({
						text: 'You cannot race in a direct message with another user'
					});
				}
				log.warn({
					msg: 'App is not in the channel'
				});
				return await respond({
					text: 'You must invite Yeehaw to this channel before you can start races'
				});
			}
			log.error({
				msg: 'Command failed',
				error: error.message
			});
			throw error;
		}
	});
};
