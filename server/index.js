'use strict';

const { App: SlackApp } = require('@slack/bolt');
const initializeAppHomeOpenedEvent = require('./slack/events/app-home-opened');
const initializeBetAction = require('./slack/actions/bet');
const initializeBetModel = require('./model/bet');
const initializeRaceCommand = require('./slack/commands/race');
const initializeRaceModel = require('./model/race');
const initializeRaceShortcut = require('./slack/shortcuts/race');
const { Mongoose } = require('mongoose');
const { MongooseInstallationStore } = require('slack-bolt-mongoose');
const { default: pino } = require('pino');
const PinoBoltLogger = require('./lib/pino-bolt-logger');
const renderWebPage = require('./lib/render-web-page');

module.exports = function yeehaw({
	fathomSiteId,
	logger = pino(),
	mongoConnectionUri = 'mongodb://localhost:27017/yeehaw',
	slackClientId,
	slackClientSecret,
	slackClientSigningSecret,
	slackStateSecret
}) {
	// Create a MongoDB connection
	const mongoose = new Mongoose();

	// Create a Slack app
	const pinoBoltLogger = new PinoBoltLogger(logger);
	const app = new SlackApp({
		clientId: slackClientId,
		clientSecret: slackClientSecret,
		signingSecret: slackClientSigningSecret,
		stateSecret: slackStateSecret,
		scopes: [
			'channels:join',
			'channels:read',
			'chat:write',
			'commands',
			'groups:read',
			'im:read',
			'mpim:read'
		],
		installerOptions: {
			directInstall: true,
			redirectUriPath: '/slack/redirect'
		},
		installationStore: new MongooseInstallationStore({
			mongoose,
			mongooseModelName: 'installations',
			clientId: slackClientId,
			logger: pinoBoltLogger
		}),
		logger: pinoBoltLogger,
		customRoutes: [
			{
				path: '/',
				method: ['GET'],
				handler: (_request, response) => {
					response.setHeader('Content-Type', 'text/html; charset=utf-8');
					response.writeHead(200);
					response.end(renderWebPage({ fathomSiteId }));
				}
			}
		]
	});

	// Load app models
	initializeBetModel({ mongoose });
	initializeRaceModel({ mongoose });

	// Load app commands and events
	const initOptions = {
		app,
		logger,
		mongoose
	};
	initializeBetAction(initOptions);
	initializeRaceCommand(initOptions);
	initializeRaceShortcut(initOptions);
	initializeAppHomeOpenedEvent(initOptions);

	return {
		async start({ port = '8080' }) {
			await mongoose.connect(mongoConnectionUri);
			await app.start(port);
			logger.info('Application started');
		},
		async stop() {
			await app.stop();
			await mongoose.disconnect();
			logger.info('Application stopped');
		}
	};
};
