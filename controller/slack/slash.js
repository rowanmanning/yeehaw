'use strict';

const commands = require('../../lib/command');
const SlackWebApiClient = require('@slack/web-api').WebClient;

module.exports = function initRaceController(app) {
	const {router} = app;
	const {Bot} = app.models;

	const slashCommandMiddleware = [
		validateRequestBody,
		getSlackWebClient,
		routeSlashCommand
	];
	// Slash/race is here for legacy reasons
	router.post('/slash/race', slashCommandMiddleware);
	router.post('/slack/slash', slashCommandMiddleware);

	function validateRequestBody(request, response, next) {
		try {
			// TODO verify message is from Slack
			if (typeof request.body !== 'object' || Array.isArray(request.body) || request.body === null) {
				throw new Error('Slack slash command was malformed');
			}
			if (typeof request.body.channel_id !== 'string' || request.body.channel_id[0] !== 'C') {
				throw new Error('Races can only be run in public channels');
			}
			if (typeof request.body.text !== 'string') {
				throw new Error('Command contains no text');
			}
			next();
		} catch (error) {
			app.log.error(`Slash command verification failed: ${error.message}`);
			response.send(error.message);
		}
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
			app.log.error(`Slash command auth failed: ${error.message}`);
			response.send(error.message);
		}
	}

	async function routeSlashCommand(request, response) {
		const {slackWebClient} = request;
		try {
			const rawCommandString = request.body.text.trim().toLowerCase();
			const [command, ...commandArguments] = rawCommandString.split(' ');

			const commandOptions = {
				text: commandArguments.join(' ').trim(),
				channelId: request.body.channel_id,
				models: app.models,
				slackWebClient,
				teamId: request.body.team_id,
				userId: request.body.user_id
			};

			// Send an empty 200 response so Slack doesn't show a timeout error
			response.send('');

			// If we have a matching command, use it
			if (commands[command]) {
				app.log.info(`Running "race ${command}" slash command`);
				await commands[command](commandOptions);

			// Otherwise we use the start command
			} else {
				app.log.info(`Running "race start" slash command (as a default)`);
				commandOptions.text = rawCommandString;
				await commands.start(commandOptions);
			}
		} catch (error) {
			try {
				await slackWebClient.chat.postEphemeral({
					channel: request.body.channel_id,
					user: request.body.user_id,
					text: error.message,
					response_type: 'ephemeral' // eslint-disable-line camelcase
				});
			} catch (slackError) {
				app.log.error(`Error response could not be sent: ${slackError.message}`);
			}
		}
	}

};
