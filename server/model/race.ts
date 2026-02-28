import { randomUUID } from 'node:crypto';
import type { WebClient } from '@slack/web-api';
import { CodedError } from '@yeehaw/errors';
import mongoose from 'mongoose';
import { Racer } from './racer.ts';

interface StartOptions {
	teamId: string;
	channelId: string;
	userId: string;
	slack: WebClient;
}

const racerCount = 5;

const RaceRacerSchema = new mongoose.Schema({
	racer: { type: String, index: true, required: true, ref: 'Racer' }
});

const RaceSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true, default: randomUUID },
		team: { type: String, index: true, required: true, ref: 'Team' },
		channel: { type: String, index: true, required: true, ref: 'Channel' },
		user: { type: String, index: true, required: true, ref: 'User' },
		messageTimestamp: { type: String, required: true },
		racers: { type: [RaceRacerSchema], required: true, default: [] }
	},
	{
		timestamps: true,
		statics: {
			async start({ teamId, channelId, userId, slack }: StartOptions) {
				const racers = await Racer.aggregate().sample(racerCount);
				if (racers.length < racerCount) {
					throw new CodedError('Could not fetch enough racers', {
						code: 'RACERS_MISSING'
					});
				}

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
					messageTimestamp: message.ts,
					racers: racers.map((racer) => ({ racer: racer._id }))
				});
				// TODO kick off the race timers
			}
		}
	}
);

export const Race = mongoose.model('Race', RaceSchema);
