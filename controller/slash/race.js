'use strict';

const {post} = require('request-promise-native');
const SlackWebApiClient = require('@slack/web-api').WebClient;

module.exports = function initRaceController(app) {
	const {router} = app;
	const {Bot, Race} = app.models;

	router.post('/slash/race', [
		validateRequestBody,
		getBot,
		startRace,
		handleError
	]);

	function validateRequestBody(request, response, next) {
		try {
			// TODO verify message is from Slack
			if (typeof request.body !== 'object' || Array.isArray(request.body) || request.body === null) {
				throw new Error('Request body must be an object');
			}
			if (typeof request.body.channel_id !== 'string' || request.body.channel_id[0] !== 'C') {
				const error = new Error('Races can only be run in public channels');
				error.publicMessage = error.message;
				throw error;
			}
			next();
		} catch (error) {
			error.sendImmediate = true;
			next(error);
		}
	}

	async function getBot(request, response, next) {
		try {
			response.locals.bot = await Bot.findOne({
				slackTeamId: request.body.team_id
			}).sort({
				createdAt: -1
			});
			if (!response.locals.bot) {
				throw new Error('This Slack instance is not authorised');
			}
			next();
		} catch (error) {
			error.sendImmediate = true;
			next(error);
		}
	}

	async function startRace(request, response, next) {
		try {
			response.send('Your race will begin soon! Yeehaw! :face_with_cowboy_hat:');

			// Set up the race and save basic details
			const race = new Race({
				teamId: request.body.team_id,
				channelId: request.body.channel_id,
				userId: request.body.user_id
			});
			await race.save();

			// Run the race
			const bot = response.locals.bot;
			await race.runOnSlack(new SlackWebApiClient(bot.slackBotAccessToken));

		} catch (error) {
			next(error);
		}
	}

	async function handleError(error, request, response, next) {
		try {
			app.log.error(`Race error: ${error.message}`);
			const errorText = error.publicMessage || 'Your race could not be started. Yeehaw :pensive:';
			if (error.sendImmediate) {
				response.send(errorText);
			} else {
				await post({
					uri: request.body.response_url,
					json: true,
					body: {
						text: errorText,
						response_type: 'ephemeral'
					}
				});
			}
		} catch (error) {
			app.log.error(`Error response could not be sent: ${error.message}`);
		}
	}

};
