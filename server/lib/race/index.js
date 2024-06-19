'use strict';

const { divider, markdownContext, markdownSection } = require('../slack/block-kit-helpers');
const randomItem = require('random-item');
const wait = require('../wait');

const DEFAULT_HORSE_EMOJI = ':horse_racing:';
const HORSE_STARTING_DISTANCE = 40;
const HORSE_MOVEMENT_VALUES = [1, 1, 2, 2, 3, 4];
const BETTING_TIME_SECONDS = 30;
const BETTING_TIME_MS = 1000 * BETTING_TIME_SECONDS; // 30 seconds
const RACE_STEP_WAIT_TIME = 200; // 200 milliseconds

/**
 * Run a race.
 *
 * @param {object} options
 *     Race options.
 * @param {string} options.channelId
 *     The ID of the Slack channel to run the race in.
 * @param {Array<string>} [options.emoji]
 *     The emoji to use for the horses.
 * @param {import('pino').Logger} options.logger
 *     A shared logger.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose instance to get the Race model from.
 * @param {import('@slack/web-api').WebClient} options.slackClient
 *     The Slack client.
 * @param {string} options.teamId
 *     The ID of the Slack team to run the race in.
 * @param {string} options.userId
 *     The ID of the user who started the race.
 */
module.exports = async function runRace({
	channelId,
	emoji = [],
	logger,
	mongoose,
	slackClient,
	teamId,
	userId
}) {
	const Bet = mongoose.model('Bet');
	const Race = mongoose.model('Race');

	// Generate the horses
	const raceHorses = Array(5)
		.fill(0)
		.map((_, index) => {
			return {
				emoji: emoji[index] || randomItem(emoji) || DEFAULT_HORSE_EMOJI,
				distanceFromFinish: HORSE_STARTING_DISTANCE
			};
		});

	// Store the race in the database
	const race = await Race.create({
		teamId,
		channelId,
		userId,
		horses: raceHorses
	});

	// Scope the logger to this race
	const log = logger.child({
		raceId: race.id
	});
	log.info({
		msg: 'Started a race',
		teamId,
		channelId,
		emoji
	});

	// Send the initial message, saving the message timestamp
	const slackMessage = await slackClient.chat.postMessage({
		channel: channelId,
		text: 'Place your bets, the race is starting soon!',
		blocks: renderRace({
			race
		})
	});
	race.set('messageTimestamp', slackMessage.ts);
	await race.save();
	log.info({
		msg: 'Race message was posted',
		ts: slackMessage.ts
	});
	if (typeof slackMessage.ts !== 'string') {
		throw new TypeError('Slack message timestamp is not a string');
	}

	// Wait for bets to be placed before beginning the race
	await wait(BETTING_TIME_MS);
	log.info({
		msg: 'Race betting window has closed'
	});
	race.set('phase', 'racing');
	await race.save();

	// Enter the race loop
	let winningHorses = [];
	let winningBets = [];
	while (race.get('phase') !== 'finished') {
		const horses = race.get('horses');

		winningHorses = horses.filter((horse) => horse.get('finishingPosition') === 1);
		const winningHorseIds = winningHorses.map((horse) => horse.get('_id'));
		winningBets = await Bet.find({
			horseId: { $in: winningHorseIds }
		});

		await slackClient.chat.update({
			channel: channelId,
			text: 'The race has started!',
			ts: slackMessage.ts,
			blocks: renderRace({
				race
			})
		});

		// Finish the race if all of the horses have finished
		if (horses.every((horse) => horse.hasFinished)) {
			race.set('phase', 'finished');
		}

		// Calculate the next finishing position
		const nextFinishingPosition = horses.reduce((position, horse) => {
			const finishingPosition = horse.get('finishingPosition');
			if (horse.get('hasFinished') && position <= finishingPosition) {
				return horse.finishingPosition + 1;
			}
			return position;
		}, 1);

		for (const horse of horses) {
			const hasFinished = horse.get('hasFinished');
			let distanceFromFinish = horse.get('distanceFromFinish');
			if (distanceFromFinish > 0) {
				distanceFromFinish -= randomItem(HORSE_MOVEMENT_VALUES);
				horse.set('distanceFromFinish', distanceFromFinish);
			}
			if (!hasFinished && distanceFromFinish <= 0) {
				horse.set('finishingPosition', nextFinishingPosition);
				horse.set('hasFinished', true);
			}
		}

		await wait(RACE_STEP_WAIT_TIME);
	}
	log.info({
		msg: 'Race has finished'
	});

	// One final update
	await slackClient.chat.update({
		channel: channelId,
		text: 'The race has ended!',
		ts: slackMessage.ts,
		blocks: renderRace({
			race,
			winningBets,
			winningHorses
		})
	});

	// Return a final save promise
	return race.save();
};

/**
 * Get the Slack blocks required to render a race.
 *
 * @param {object} options
 *     Rendering options.
 * @param {import('mongoose').Document} options.race
 *     The race to render.
 * @param {Array<import('mongoose').Document>} [options.winningBets]
 *     The bets on winning horses.
 * @param {Array<import('mongoose').Document>} [options.winningHorses]
 *     The horses who came in first.
 * @returns {Array<import('@slack/bolt').Block>}
 *     Returns an array of Slack blocks.
 */
function renderRace({ race, winningBets, winningHorses }) {
	const phase = race.get('phase');
	const userId = race.get('userId');
	let blocks = [];

	if (phase === 'betting') {
		blocks = renderRaceBettingPhase({ race });
	} else if (phase === 'racing') {
		blocks = renderRaceRacingPhase({ race });
	} else if (phase === 'finished') {
		blocks = renderRaceFinishedPhase({
			race,
			winningBets,
			winningHorses
		});
	}

	return [...blocks, divider(), markdownContext(`*Race organiser:* <@${userId}>`)];
}

/**
 * Get the Slack blocks required to render a race in the betting phase.
 *
 * @param {object} options
 *     Rendering options.
 * @param {import('mongoose').Document} options.race
 *     The race to render.
 * @returns {Array<import('@slack/bolt').Block>}
 *     Returns an array of Slack blocks.
 */
function renderRaceBettingPhase({ race }) {
	const horses = race.get('horses');
	return [
		markdownSection(
			`Please place your bets! You can bet on one horse and change the bet until the race commences (in ${BETTING_TIME_SECONDS} seconds)`
		),
		divider(),
		...horses.map((horse) =>
			renderHorse({
				horse,
				isInBettingPhase: true
			})
		)
	];
}

/**
 * Get the Slack blocks required to render a race in the racing phase.
 *
 * @param {object} options
 *     Rendering options.
 * @param {import('mongoose').Document} options.race
 *     The race to render.
 * @returns {Array<import('@slack/bolt').Block>}
 *     Returns an array of Slack blocks.
 */
function renderRaceRacingPhase({ race }) {
	const horses = race.get('horses');
	return [
		markdownSection(`The race is on!\nDon't forget to cheer on your horse!`),
		divider(),
		...horses.map((horse) => renderHorse({ horse }))
	];
}

/**
 * Get the Slack blocks required to render a race in the finished phase.
 *
 * @param {object} options
 *     Rendering options.
 * @param {import('mongoose').Document} options.race
 *     The race to render.
 * @param {Array<import('mongoose').Document>} [options.winningBets]
 *     The bets on winning horses.
 * @param {Array<import('mongoose').Document>} [options.winningHorses]
 *     The horses who came in first.
 * @returns {Array<import('@slack/bolt').Block>}
 *     Returns an array of Slack blocks.
 */
function renderRaceFinishedPhase({ race, winningBets = [], winningHorses = [] }) {
	const horses = race.get('horses');
	const winningHorseNames = winningHorses.map((horse) => horse.get('name'));
	const winningBetterNames = winningBets.length
		? winningBets.map((bet) => `<@${bet.get('slackUserId')}>`)
		: ['nobody'];
	return [
		markdownSection(
			`This race is over!\nCongratulations *_${winningHorseNames.join(', ')}_* :trophy:`
		),
		divider(),
		...horses.map((horse) => renderHorse({ horse })),
		divider(),
		markdownSection(
			`Well done ${winningBetterNames.join(', ')} for betting on the right horse.`
		)
	];
}

/**
 * Get the Slack block to render a horse.
 *
 * @param {object} options
 *     Rendering options.
 * @param {import('mongoose').Document} options.horse
 *     The horse to render.
 * @param {boolean} [options.isInBettingPhase = false]
 *     Whether we're in the betting phase of the race.
 * @returns {import('@slack/bolt').SectionBlock}
 *     Returns a section block representing the horse.
 */
function renderHorse({ horse, isInBettingPhase = false }) {
	const distanceFromFinish = horse.get('distanceFromFinish');
	const emoji = horse.get('emoji');
	const hasFinished = horse.get('hasFinished');
	const name = horse.get('name');

	let accessory;
	if (isInBettingPhase) {
		accessory = {
			type: 'button',
			text: {
				type: 'plain_text',
				text: 'Place Bet',
				emoji: true
			},
			action_id: 'bet',
			value: horse.id
		};
	}
	if (hasFinished) {
		let trophy;
		switch (horse.get('finishingPosition')) {
			case 1:
				trophy = 'first_place_medal';
				break;
			case 2:
				trophy = 'second_place_medal';
				break;
			case 3:
				trophy = 'third_place_medal';
				break;
			default:
				trophy = 'blank';
				break;
		}
		return markdownSection(`:${trophy}:${emoji} _${name}_`);
	}
	const spacing = Array(distanceFromFinish).fill(' ').join('');
	return markdownSection(`:checkered_flag:${spacing}${emoji} _${name}_`, accessory);
}
