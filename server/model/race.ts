import type { WebClient } from '@slack/web-api';
import { CodedError } from '@yeehaw/errors';
import mongoose from 'mongoose';

interface StartOptions {
	teamId: string;
	channelId: string;
	userId: string;
	slack: WebClient;
}

const RaceSchema = new mongoose.Schema(
	{
		team: { type: String, index: true, required: true, ref: 'Team' },
		channel: { type: String, index: true, required: true, ref: 'Channel' },
		user: { type: String, index: true, required: true, ref: 'User' },
		messageTimestamp: { type: String, required: true }
	},
	{
		timestamps: true,
		statics: {
			async start({ teamId, channelId, userId, slack }: StartOptions) {
				const { message } = await slack.chat.postMessage({
					channel: channelId,
					text: '[placeholder]'
				});
				if (!message?.ts) {
					throw new CodedError('Could not create a Slack message', {
						code: 'SLACK_MESSAGE'
					});
				}
				await this.create({
					team: teamId,
					channel: channelId,
					user: userId,
					messageTimestamp: message.ts
				});
				// TODO kick off the race timers
			}
		}
	}
);

export const Race = mongoose.model('Race', RaceSchema);
