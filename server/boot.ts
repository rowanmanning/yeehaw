import { App, type Logger } from '@slack/bolt';
import boltifyLogger from '@yeehaw/boltify-logger';
import createLogger from '@yeehaw/logger';
import mongoose from 'mongoose';
import * as config from './config.ts';
import createInstallationStore from './lib/installation-store.ts';

const logger = createLogger({ level: config.logLevel });
config.verify(logger);

await mongoose.connect(config.databaseUrl, { minPoolSize: 0 });

const installPath = '/';
const redirectPath = '/redirect';

const app = new App({
	clientId: config.slackClientId,
	clientSecret: config.slackClientSecret,
	installationStore: createInstallationStore(),
	installerOptions: {
		installPath,
		redirectUriPath: redirectPath
	},
	logger: boltifyLogger(logger.child({ context: '@slack/bolt' })) as Logger,
	redirectUri: `https://${config.hostname}${redirectPath}`,
	scopes: ['channels:history', 'chat:write', 'commands'],
	signingSecret: config.slackSigningSecret,
	stateSecret: config.slackStateSecret
});

await app.start(config.port);
logger.info('Application started');
