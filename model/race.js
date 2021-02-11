'use strict';

const adjectives = require('../lib/words/adjectives');
const valentinesDayAdjectives = require('../lib/words/adjectives-valentines-day');
const christmasAdjectives = require('../lib/words/adjectives-christmas');
const nouns = require('../lib/words/nouns');
const valentinesDayNouns = require('../lib/words/nouns-valentines-day');
const christmasNouns = require('../lib/words/nouns-christmas');
const sample = require('lodash/sample');
const {Schema} = require('@rowanmanning/app');

const horseMovement = [1, 1, 2, 2, 3, 4];
const defaultEmoji = ':horse_racing:';

module.exports = function initRaceModel(app) {

	function isValentinesDayIsh() {
		const date = new Date();
		const month = date.getUTCMonth();
		const day = date.getUTCDate();
		return (month === 1 && day >= 12 && day <= 16);
	}

	function isDecember() {
		return (new Date().getUTCMonth() === 11);
	}

	function generateHorseName() {
		if (isValentinesDayIsh()) {
			return `${sample(valentinesDayAdjectives)} ${sample(valentinesDayNouns)}`;
		}
		if (isDecember()) {
			return `${sample(christmasAdjectives)} ${sample(christmasNouns)}`;
		}
		return `${sample(adjectives)} ${sample(nouns)}`;
	}

	const horseSchema = new Schema({
		name: {
			type: String,
			required: true,
			default: generateHorseName
		},
		emoji: {
			type: String
		},
		distanceFromFinish: {
			type: Number,
			default: 40
		},
		hasFinished: {
			type: Boolean,
			default: false
		},
		finishingPosition: {
			type: Number
		}
	});

	const raceSchema = new Schema({
		teamId: {
			type: String,
			required: true
		},
		channelId: {
			type: String,
			required: true
		},
		userId: {
			type: String,
			required: true
		},
		messageTimestamp: {
			type: String
		},
		emoji: {
			type: [String],
			default: [defaultEmoji]
		},
		horses: {
			type: [horseSchema],
			default: () => Array(5).fill({})
		},
		phase: {
			type: String,
			required: true,
			default: 'betting',
			enum: ['betting', 'racing', 'finished']
		}
	}, {timestamps: true});

	horseSchema.method('renderForSlack', function(betting) {
		let accessory;
		if (betting) {
			accessory = {
				type: 'button',
				text: {
					type: 'plain_text',
					text: 'Place Bet',
					emoji: true
				},
				action_id: 'bet',
				value: this._id
			};
		}
		if (this.hasFinished) {
			let trophy;
			switch (this.finishingPosition) {
				case 1: trophy = 'first_place_medal'; break;
				case 2: trophy = 'second_place_medal'; break;
				case 3: trophy = 'third_place_medal'; break;
				default: trophy = 'blank'; break;
			}
			return markdownSectionBlock(`:${trophy}:${this.emoji} _${this.name}_`);
		}
		const spacing = Array(this.distanceFromFinish).fill(' ').join('');
		return markdownSectionBlock(`:checkered_flag:${spacing}${this.emoji} _${this.name}_`, accessory);

	});

	raceSchema.method('renderForSlack', async function() {
		if (this.phase === 'betting') {
			return [
				markdownSectionBlock(`Please place your bets! You can bet on one horse and change the bet until the race commences (in 30 seconds)`),
				{type: 'divider'},
				...this.horses.map(horse => horse.renderForSlack(true)),
				{type: 'divider'},
				markdownContextBlock(`*Race organiser:* <@${this.userId}>`)
			];
		} else if (this.phase === 'racing') {
			return [
				markdownSectionBlock(`The race is on!\nDon't forget to cheer on your horse!`),
				{type: 'divider'},
				...this.horses.map(horse => horse.renderForSlack()),
				{type: 'divider'},
				markdownContextBlock(`*Race organiser:* <@${this.userId}>`)
			];
		} else if (this.phase === 'finished') {
			const winningHorses = this.horses.filter(horse => horse.finishingPosition === 1);
			const winningHorseIds = winningHorses.map(horse => horse._id);
			const winningHorseNames = winningHorses.map(horse => horse.name);
			const winningBets = await app.models.Bet.find({
				horseId: {$in: winningHorseIds}
			});
			const winningBetterNames = (
				winningBets.length ?
					winningBets.map(bet => `<@${bet.slackUserId}>`) :
					['nobody']
			);
			return [
				markdownSectionBlock(`This race is over!\nCongratulations *_${winningHorseNames.join(', ')}_* :trophy:`),
				{type: 'divider'},
				...this.horses.map(horse => horse.renderForSlack()),
				{type: 'divider'},
				markdownSectionBlock(`Well done ${winningBetterNames.join(', ')} for betting on the right horse.`),
				markdownContextBlock(`*Race organiser:* <@${this.userId}>`)
			];
		}
	});

	raceSchema.method('calculateNextSteps', function() {
		if (this.horses.every(horse => horse.hasFinished)) {
			this.phase = 'finished';
		}
		const nextFinishingPosition = this.horses.reduce((position, horse) => {
			if (horse.hasFinished && position <= horse.finishingPosition) {
				return horse.finishingPosition + 1;
			}
			return position;
		}, 1);
		this.horses.forEach(horse => {
			if (horse.distanceFromFinish > 0) {
				horse.distanceFromFinish -= sample(horseMovement);
			}
			if (!horse.hasFinished && horse.distanceFromFinish <= 0) {
				horse.finishingPosition = nextFinishingPosition;
				horse.hasFinished = true;
			}
		});
	});

	raceSchema.method('runOnSlack', async function(slackWebClient) {

		// Set horse emoji
		this.horses.forEach((horse, index) => {
			horse.emoji = this.emoji[index] || sample(this.emoji) || defaultEmoji;
		});
		this.set('emoji', undefined, {strict: false});

		// Send the initial message, saving the message timestamp
		const slackMessage = await slackWebClient.chat.postMessage({
			channel: this.channelId,
			blocks: await this.renderForSlack()
		});
		this.messageTimestamp = slackMessage.ts;
		await this.save();

		// Wait for bets to be placed before beginning the race
		await timer(1000 * 30);

		// Start the race!
		this.phase = 'racing';

		// Enter the race loop
		while (this.phase !== 'finished') {
			await slackWebClient.chat.update({
				channel: this.channelId,
				ts: this.messageTimestamp,
				blocks: await this.renderForSlack()
			});
			this.calculateNextSteps();
			await timer(200);
		}

		// One final update
		await slackWebClient.chat.update({
			channel: this.channelId,
			ts: this.messageTimestamp,
			blocks: await this.renderForSlack()
		});

		// Return a final save promise
		return this.save();
	});

	raceSchema.method('placeBet', async function({slackWebClient, horseId, slackChannelId, slackTeamId, slackUserId}) {
		const horse = this.horses.find(({_id}) => _id.toString() === horseId);
		const existingBet = await app.models.Bet.findOne({
			slackUserId,
			raceId: this._id
		});

		let successMessage;
		if (existingBet) {
			existingBet.horseId = horseId;
			await existingBet.save();
			successMessage = `<@${slackUserId}> changed their bet to *_${horse.name}_*.`;
		} else {
			const newBet = new app.models.Bet({
				slackTeamId,
				slackUserId,
				raceId: this._id,
				horseId
			});
			await newBet.save();
			successMessage = `<@${slackUserId}> bet on *_${horse.name}_*.`;
		}

		try {
			await slackWebClient.chat.postMessage({
				channel: slackChannelId,
				thread_ts: this.messageTimestamp,
				text: successMessage
			});
		} catch (error) {
			app.log.error('Error posting Slack message:', error.message);
		}

	});

	function timer(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	function markdownSectionBlock(text, accessory) {
		return {
			type: 'section',
			text: {
				type: 'mrkdwn',
				text
			},
			accessory
		};
	}

	function markdownContextBlock(text) {
		return {
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text
				}
			]
		};
	}

	return raceSchema;

};
