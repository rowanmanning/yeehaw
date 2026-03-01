import { randomUUID } from 'node:crypto';
import { randomEmoji, randomName } from '@yeehaw/racer-generator';
import mongoose from 'mongoose';

const nameRegExp = /^([a-zA-Zà-üÀ-Ü0-9'-]+(\s[a-zA-Zà-üÀ-Ü0-9'-]+)*){3,32}$/i;
const nameValidationMessage =
	'Name must only contain alphanumeric characters, spaces, dashes, and single quotes. It must be 3–32 characters in length.';
function validateName(name: unknown) {
	return typeof name === 'string' && nameRegExp.test(name);
}

const emojiRegExp = /^:(([a-z0-9'+_-]{1,100})(::(skin-tone-\d))?):$/;
const emojiValidationMessage = 'Emoji must be a single Slack emoji.';
function validateEmoji(emoji: unknown) {
	return typeof emoji === 'string' && emojiRegExp.test(emoji);
}

const RacerSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true, default: randomUUID },
		team: { type: String, index: true, required: true, ref: 'Team' },
		user: { type: String, index: true, ref: 'User', default: null },
		name: {
			type: String,
			required: true,
			default: randomName,
			validate: { validator: validateName, message: nameValidationMessage }
		},
		emoji: {
			type: String,
			required: true,
			default: randomEmoji,
			validate: { validator: validateEmoji, message: emojiValidationMessage }
		}
	},
	{
		timestamps: true,
		statics: {
			assertValidName(name: unknown) {
				if (typeof name !== 'string' || !validateName(name)) {
					throw new Error(nameValidationMessage);
				}
			},
			assertValidEmoji(emoji: unknown) {
				if (typeof emoji !== 'string' || !validateEmoji(emoji)) {
					throw new Error(emojiValidationMessage);
				}
			}
		}
	}
);

export const Racer = mongoose.model('Racer', RacerSchema);
