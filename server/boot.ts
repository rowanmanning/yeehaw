import { App, type Logger } from '@slack/bolt';
import boltifyLogger from '@yeehaw/boltify-logger';
import createLogger from '@yeehaw/logger';
import * as config from './config.ts';

const logger = createLogger({ level: config.logLevel });

const app = new App({
	token: config.slackBotToken,
	signingSecret: config.slackSigningSecret,
	logger: boltifyLogger(logger.child({ context: '@slack/bolt' })) as Logger
});

await app.start(config.port);
logger.info('Application started');
