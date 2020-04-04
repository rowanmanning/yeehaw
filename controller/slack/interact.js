'use strict';

const interactions = require('../../lib/interact');
const SlackWebApiClient = require('@slack/web-api').WebClient;

module.exports = function initSlackInteractController(app) {
	const {router} = app;
	const {Bot} = app.models;

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
				slackTeamId: request.body.payload.team.id
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
			const interactionType = request.body.payload.type;

			const interactionOptions = {
				payload: request.body.payload,
				channelId: (request.payload.channel ? request.payload.channel.id : undefined),
				models: app.models,
				slackWebClient,
				teamId: (request.payload.team ? request.payload.team.id : undefined),
				userId: (request.payload.user ? request.payload.user.id : undefined)
			};

			// Block actions can contain multiple values, so we need
			// to loop over these
			if (interactionType === 'block_actions') {
				for (const blockAction of request.body.payload.actions) {
					const blockActionId = blockAction.action_id;
					if (interactions[blockActionId]) {
						app.log.info(`Running "${blockActionId}" block action interaction`);
						await interactions[blockActionId](Object.assign({}, interactionOptions, {blockAction}));
					} else {
						app.log.error(`Error: "${blockActionId}" block action interaction does not exist`);
						app.log.info('BLOCK ACTION PAYLOAD', request.body.payload);
					}
				}

			// Shortcut actions are singular
			} else if (interactionType === 'shortcut') {
				const shortcutActionId = request.body.payload.callback_id;
				if (interactions[shortcutActionId]) {
					app.log.info(`Running "${shortcutActionId}" shortcut interaction`);
					await interactions[shortcutActionId](interactionOptions);
				} else {
					app.log.error(`Error: "${shortcutActionId}" shortcut interaction does not exist`);
					app.log.info('SHORTCUT PAYLOAD', request.body.payload);
				}
			}

		} catch (error) {
			app.log.error(`Interaction failed: ${error.message}`);
		}
	}

};
