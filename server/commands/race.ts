import type { App } from '@slack/bolt';
import type { WebClient } from '@slack/web-api';
import { CodedError } from '@yeehaw/errors';
import type { Logger } from '@yeehaw/logger';

interface Options {
	app: App;
	logger: Logger;
}

export function addRaceCommand({ app, logger }: Options) {
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
			if (!channel.is_member) {
				await joinConversation(command.channel_id, client);
			}

			// TODO run race
			await client.chat.postMessage({
				channel: command.channel_id,
				text: 'This will be a race one day'
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

async function getConversationInfo(conversationId: string, client: WebClient) {
	try {
		const { channel } = await client.conversations.info({ channel: conversationId });
		if (!channel?.id) {
			throw new CodedError('Conversation has no channel ID', {
				code: 'CONVERSATION_INFO_CHANNEL_ID'
			});
		}
		return channel;
	} catch (cause) {
		if (cause instanceof CodedError) {
			throw cause;
		}
		throw new CodedError('Conversation info could not be found', {
			code: 'CONVERSATION_INFO_NOT_FOUND',
			cause
		});
	}
}

async function joinConversation(conversationId: string, client: WebClient) {
	try {
		await client.conversations.join({ channel: conversationId });
	} catch (cause) {
		throw new CodedError('Failed to join the conversation', {
			code: 'CONVERSATION_JOIN',
			cause
		});
	}
}
