import type { Logger } from '@yeehaw/logger';

export const databaseUrl = process.env.DATABASE_URL || '';
export const environment = process.env.NODE_ENV || 'development';
export const isProduction = environment === 'production';
export const logLevel = process.env.LOG_LEVEL || 'debug';
export const port = process.env.PORT ? Number(process.env.PORT) : 8080;
export const slackBotToken = process.env.SLACK_BOT_TOKEN || '';
export const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || '';

export function verify(logger: Logger) {
	// Exit if required configurations aren't present
	if (!databaseUrl) {
		logger.fatal('Database URL was not set');
		process.exit(1);
	}
	if (!slackBotToken) {
		logger.fatal('Slackbot Token was not set');
		process.exit(1);
	}
	if (!databaseUrl) {
		logger.fatal('Slack Signing Secret was not set');
		process.exit(1);
	}
}
