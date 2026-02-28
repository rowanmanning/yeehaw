import { App, type Logger } from '@slack/bolt';
import boltifyLogger from '@yeehaw/boltify-logger';
import createLogger from '@yeehaw/logger';
import mongoose from 'mongoose';
import { addRaceCommand } from './commands/race.ts';
import * as config from './config.ts';
import createInstallationStore from './lib/installation-store.ts';

const logger = createLogger({ level: config.logLevel });
config.verify(logger);

await mongoose.connect(config.databaseUrl, { minPoolSize: 0 });

const redirectPath = '/slack/redirect';

const app = new App({
	clientId: config.slackClientId,
	clientSecret: config.slackClientSecret,
	installationStore: createInstallationStore(),
	installerOptions: {
		directInstall: true,
		redirectUriPath: redirectPath
	},
	logger: boltifyLogger(logger.child({ context: '@slack/bolt' })) as Logger,
	redirectUri: `https://${config.hostname}${redirectPath}`,
	scopes: [
		'app_mentions:read',
		'channels:join',
		'channels:read',
		'chat:write',
		'commands',
		'groups:read',
		'im:read',
		'mpim:history'
	],
	signingSecret: config.slackSigningSecret,
	stateSecret: config.slackStateSecret
});

addRaceCommand({ app, logger });

await app.start(config.port);
logger.info('Application started');
