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

export function addRaceCommand({ app, logger }: Options) {
	// Handle the race slash command
	app.command('/race', async ({ ack, client, command, respond }) => {
		const log = logger.child({ command: 'race', triggerId: command.trigger_id });
		try {
			await ack();
			log.info({
				event: 'COMMAND_RUN',
				text: command.text,
				channel: { id: command.channel_id, name: command.channel_name },
				team: { id: command.team_id, domain: command.team_domain },
				user: { id: command.user_id, name: command.user_name }
			});

			const channel = await getConversationInfo(command.channel_id, client);
			if (channel.is_im) {
				throw new CodedError('Unable to race in DM', { code: 'CONVERSATION_TYPE' });
			}
			if (channel.id && !channel.is_member) {
				await joinConversation(channel.id, client);
			}

			await Promise.all([
				User.findOneAndUpdate(
					{ _id: command.user_id },
					{ _id: command.user_id, team: command.team_id },
					{ upsert: true }
				),
				Channel.findOneAndUpdate(
					{ _id: command.channel_id },
					{ _id: command.channel_id, team: command.team_id },
					{ upsert: true }
				)
			]);

			await Race.start({
				teamId: command.team_id,
				channelId: command.channel_id,
				userId: command.user_id,
				slack: client
			});
		} catch (cause) {
			log.error({ event: 'COMMAND_ERROR', error: cause });
			if (cause instanceof CodedError) {
				if (cause.code === 'CONVERSATION_INFO_NOT_FOUND') {
					return await respond(
						':warning: You must invite Yeehaw to this channel before you can start races'
					);
				}
				if (cause.code === 'CONVERSATION_INFO_CHANNEL_ID') {
					return await respond(':warning: Yeehaw cannot start a race in this channel');
				}
				if (cause.code === 'CONVERSATION_JOIN') {
					return await respond(':warning: Yeehaw was unable to join this channel');
				}
			}
			await respond(':warning: Yeehaw was unable to start a race due to an unknown error');
			throw cause;
		}
	});
}
