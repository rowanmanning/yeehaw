import type { Logger } from '@yeehaw/logger';

export const databaseUrl = process.env.DATABASE_URL || '';
export const environment = process.env.NODE_ENV || 'development';
export const isProduction = environment === 'production';
export const logLevel = process.env.LOG_LEVEL || 'debug';
export const port = process.env.PORT ? Number(process.env.PORT) : 8080;
export const hostname = process.env.HOSTNAME || `localhost:${port}`;
export const slackClientId = process.env.SLACK_CLIENT_ID || '';
export const slackClientSecret = process.env.SLACK_CLIENT_SECRET || '';
export const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || '';
export const slackStateSecret = process.env.SLACK_STATE_SECRET || '';

export function verify(logger: Logger) {
	// Exit if required configurations aren't present
	if (!databaseUrl) {
		logger.fatal('Database URL was not set');
		process.exit(1);
	}
	if (!slackClientId) {
		logger.fatal('Slack Client Id was not set');
		process.exit(1);
	}
	if (!slackClientSecret) {
		logger.fatal('Slack Client Secret was not set');
		process.exit(1);
	}
	if (!slackSigningSecret) {
		logger.fatal('Slack Signing Secret was not set');
		process.exit(1);
	}
	if (!slackStateSecret) {
		logger.fatal('Slack State Secret was not set');
		process.exit(1);
	}
}
