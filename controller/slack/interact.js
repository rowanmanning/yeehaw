'use strict';

const SlackWebApiClient = require('@slack/web-api').WebClient;

module.exports = function initSlackInteractController(app) {
	const {router} = app;
	const {Bot, Race} = app.models;

	router.post('/slack/interact', [
		validateRequestBody,
		getBot,
		performInteraction,
		handleError
	]);

	function validateRequestBody(request, response, next) {
		try {
			response.status(202);
			response.send('Accepted');
			// TODO verify message is from Slack
			if (typeof request.body !== 'object' || Array.isArray(request.body) || request.body === null) {
				throw new Error('Request body must be an object');
			}
			if (typeof request.body.payload !== 'string') {
				throw new Error('Request body must have a payload');
			}
			request.body.payload = JSON.parse(request.body.payload);
			next();
		} catch (error) {
			next(error);
		}
	}

	async function getBot(request, response, next) {
		try {
			response.locals.bot = await Bot.findOne({
				slackTeamId: request.body.payload.team.id
			}).sort({
				createdAt: -1
			});
			if (!response.locals.bot) {
				throw new Error('This Slack instance is not authorised');
			}
			next();
		} catch (error) {
			next(error);
		}
	}

	async function performInteraction(request, response, next) {
		try {
			for (const action of request.body.payload.actions) {
				switch (action.action_id) {
					case 'bet': await performBetAction(action, request.body.payload, response.locals.bot); break;
				}
			}
		} catch (error) {
			next(error);
		}
	}

	async function performBetAction(action, payload, bot) {
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
			slackWebClient: new SlackWebApiClient(bot.slackBotAccessToken),
			horseId: action.value,
			raceId: race._id,
			slackChannelId: payload.channel.id,
			slackUserId: payload.user.id
		});
	}

	async function handleError(error, request, response, next) {
		app.log.error(`Interaction error: ${error.message}`);
	}

};
