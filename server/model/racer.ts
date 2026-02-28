import { randomUUID } from 'node:crypto';
import { randomEmoji, randomName } from '@yeehaw/racer-generator';
import mongoose from 'mongoose';

const RacerSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true, default: randomUUID },
		team: { type: String, index: true, required: true, ref: 'Team' },
		user: { type: String, index: true, ref: 'User', default: null },
		name: { type: String, required: true, default: randomName },
		emoji: { type: String, required: true, default: randomEmoji }
	},
	{
		timestamps: true
	}
);

export const Racer = mongoose.model('Racer', RacerSchema);
