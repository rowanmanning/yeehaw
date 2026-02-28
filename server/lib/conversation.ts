import type { WebClient } from '@slack/web-api';
import { CodedError } from '@yeehaw/errors';

export async function getConversationInfo(conversationId: string, client: WebClient) {
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

export async function joinConversation(conversationId: string, client: WebClient) {
	try {
		await client.conversations.join({ channel: conversationId });
	} catch (cause) {
		throw new CodedError('Failed to join the conversation', {
			code: 'CONVERSATION_JOIN',
			cause
		});
	}
}
