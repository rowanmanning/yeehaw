'use strict';

// Const interactions = require('../../lib/interact');
const SlackWebApiClient = require('@slack/web-api').WebClient;

module.exports = function initSlackInteractController(app) {
	const {router} = app;
	const {Bot, Race} = app.models;

	router.post('/slack/interact', [
		sendAcknowledgmentResponse,
		validateRequestBody,
		parseJsonPayload,
		getSlackWebClient,
		routeInteraction
	]);

	function sendAcknowledgmentResponse(request, response, next) {
		response.send('OK');
		next();
	}

	function validateRequestBody(request, response, next) {
		try {
			// TODO verify message is from Slack
			if (typeof request.body !== 'object' || Array.isArray(request.body) || request.body === null) {
				throw new Error('Slack interaction was malformed');
			}
			if (typeof request.body.payload !== 'string') {
				throw new Error('Request body must have a payload');
			}
			next();
		} catch (error) {
			app.log.error(`Interaction verification failed: ${error.message}`);
		}
	}

	function parseJsonPayload(request, response, next) {
		request.body.payload = JSON.parse(request.body.payload);
		next();
	}

	async function getSlackWebClient(request, response, next) {
		try {
			const bot = await Bot.findOne({
				slackTeamId: request.body.team_id
			}).sort({
				createdAt: -1
			});
			if (!bot) {
				throw new Error('This Slack instance is not authorised');
			}
			request.slackWebClient = new SlackWebApiClient(bot.slackBotAccessToken);
			next();
		} catch (error) {
			app.log.error(`Interaction auth failed: ${error.message}`);
		}
	}

	async function routeInteraction(request) {
		const {slackWebClient} = request;
		try {
			// Const interactionType = request.body.payload.type;
			app.log.info('PAYLOAD', request.body.payload);

			// Temporary to keep bets working for now
			if (Array.isArray(request.body.payload.actions)) {
				for (const action of request.body.payload.actions) {
					if (action.action_id === 'bet') {
						await performBetAction(action, request.body.payload, slackWebClient);
					}
				}
			}

		} catch (error) {
			app.log.error(`Interaction failed: ${error.message}`);
		}
	}

	async function performBetAction(action, payload, slackWebClient) {
		const race = await Race.findOne({
			horses: {
				$elemMatch: {
					_id: action.value
				}
			}
		});
		if (!race) {
			throw new Error('Horse does not exist');
		}

		await race.placeBet({
			slackWebClient,
			horseId: action.value,
			raceId: race._id,
			slackChannelId: payload.channel.id,
			slackUserId: payload.user.id
		});
	}

};
