import { App, type Logger } from '@slack/bolt';
import boltifyLogger from '@yeehaw/boltify-logger';
import createLogger from '@yeehaw/logger';
import mongoose from 'mongoose';
import * as config from './config.ts';

const logger = createLogger({ level: config.logLevel });
config.verify(logger);

await mongoose.connect(config.databaseUrl, { minPoolSize: 0 });

const app = new App({
	token: config.slackBotToken,
	signingSecret: config.slackSigningSecret,
	logger: boltifyLogger(logger.child({ context: '@slack/bolt' })) as Logger
});

await app.start(config.port);
logger.info('Application started');
