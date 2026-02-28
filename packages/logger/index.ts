import { pino } from 'pino';

export type { Logger } from 'pino';

interface LoggerOptions {
	level: string;
}

type ErrorLike = Error & Record<string, unknown>;

function serializeError(error: ErrorLike): Record<string, unknown> {
	return {
		code: error.code || null,
		message: error.message,
		stack: error.stack,
		cause: error.cause instanceof Error ? serializeError(error.cause as ErrorLike) : null
	};
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
		serializers: {
			error(error: unknown) {
				if (error instanceof Error) {
					return serializeError(error as ErrorLike);
				}
				return error;
			}
		},
		timestamp: pino.stdTimeFunctions.isoTime
	});
}
