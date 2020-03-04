'use strict';

const {get} = require('request-promise-native');

module.exports = function initAuthController(app) {
	const {router} = app;
	const {Bot} = app.models;
	const {baseUrl, slackClientId, slackClientSecret} = app.options;
	const slackOauthScopes = [
		'bot',
		'chat:write:bot',
		'commands'
	];

	router.get('/auth', (request, response) => {
		response.redirect(`https://slack.com/oauth/authorize?scope=${slackOauthScopes.join(',')}&client_id=${slackClientId}&redirect_uri=${baseUrl}/auth/redirect`);
	});

	router.get('/auth/success', (request, response) => {
		response.render('auth/success', {
			title: `${app.name} Success!`
		});
	});

	router.get('/auth/redirect', async (request, response, next) => {
		try {
			const responseBody = await get({
				uri: `https://slack.com/api/oauth.access?code=${request.query.code}&client_id=${slackClientId}&client_secret=${slackClientSecret}&redirect_uri=${baseUrl}/auth/redirect`,
				json: true
			});
			if (!responseBody.ok) {
				throw new Error(`There was an error authenticating with Slack: ${responseBody.error}`);
			}
			const bot = new Bot({
				slackAuthScope: responseBody.scope,
				slackBotAccessToken: responseBody.bot.bot_access_token,
				slackBotUserId: responseBody.bot.bot_user_id,
				slackTeamId: responseBody.team_id,
				slackUserAccessToken: responseBody.access_token,
				slackUserId: responseBody.user_id
			});
			await bot.save();
			response.redirect('/auth/success');
		} catch (error) {
			next(error);
		}

	});

};
