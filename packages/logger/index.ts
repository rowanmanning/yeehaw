import { pino } from 'pino';

export type { Logger } from 'pino';

interface LoggerOptions {
	level: string;
}

export default function createLogger({ level }: LoggerOptions) {
	return pino({
		base: {},
		errorKey: 'error',
		formatters: {
			level(label) {
				return { level: label };
			}
		},
		level,
		messageKey: 'message',
		timestamp: pino.stdTimeFunctions.isoTime
	});
}
