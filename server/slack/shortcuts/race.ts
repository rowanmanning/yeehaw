import type { App } from '@slack/bolt';
import { CodedError } from '@yeehaw/errors';
import type { Logger } from '@yeehaw/logger';
import { getConversationInfo, joinConversation } from '../../lib/conversation.ts';
import { Channel } from '../../model/channel.ts';
import { Race } from '../../model/race.ts';
import { User } from '../../model/user.ts';

interface Options {
	app: App;
	logger: Logger;
}

export function addRaceShortcut({ app, logger }: Options) {
	// Handle the race shortcut
	app.shortcut('race', async ({ ack, client, shortcut }) => {
		const log = logger.child({ shortcut: 'race', triggerId: shortcut.trigger_id });
		try {
			await ack();
			log.info({
				event: 'SHORTCUT_RUN',
				team: { id: shortcut.team?.id, domain: shortcut.team?.domain },
				user: { id: shortcut.user.id, name: shortcut.user.username }
			});
			await client.views.open({
				trigger_id: shortcut.trigger_id,
				view: {
					type: 'modal',
					callback_id: 'startRaceInChannel',
					clear_on_close: true,
					title: { type: 'plain_text', text: 'Set up your race' },
					submit: { type: 'plain_text', text: 'Start the race!' },
					close: { type: 'plain_text', text: 'Cancel' },
					blocks: [
						{
							type: 'input',
							block_id: 'channel',
							label: { type: 'plain_text', text: 'Channel' },
							element: {
								type: 'channels_select',
								action_id: 'select',
								placeholder: {
									type: 'plain_text',
									text: 'What channel shall we start a race in?'
								}
							}
						}
					]
				}
			});
		} catch (cause) {
			log.error({ event: 'SHORTCUT_ERROR', error: cause });
			throw cause;
		}
	});

	// Handle the race modal being completed
	app.view('startRaceInChannel', async ({ ack, body, client, view }) => {
		const log = logger.child({ view: 'startRaceInChannel', hash: view.hash });
		try {
			await ack();
			const channelId = view?.state?.values?.channel?.select?.selected_channel;
			log.info({
				event: 'VIEW_RUN',
				channel: { id: channelId },
				team: { id: view.team_id, domain: undefined },
				user: { id: body.user.id, name: body.user.name }
			});

			if (!channelId) {
				throw new CodedError('No channel ID provided', { code: 'CHANNEL_ID' });
			}

			const channel = await getConversationInfo(channelId, client);
			if (channel.is_im) {
				throw new CodedError('Unable to race in DM', { code: 'CONVERSATION_TYPE' });
			}
			if (channel.id && !channel.is_member) {
				await joinConversation(channel.id, client);
			}

			await Promise.all([
				User.findOneAndUpdate(
					{ _id: body.user.id },
					{ _id: body.user.id, team: view.team_id },
					{ upsert: true }
				),
				Channel.findOneAndUpdate(
					{ _id: channelId },
					{ _id: channelId, team: view.team_id },
					{ upsert: true }
				)
			]);

			await Race.start({
				teamId: view.team_id,
				channelId,
				userId: body.user.id,
				slack: client
			});
		} catch (cause) {
			log.error({ event: 'VIEW_ERROR', error: cause });
			throw cause;
		}
	});
}
