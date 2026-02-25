import type { Logger } from '@slack/bolt';

interface GenericLogger {
	info(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	error(...args: unknown[]): void;
	debug(...args: unknown[]): void;
}

export default function boltifyLogger(logger: GenericLogger): Logger {
	return {
		debug: logger.debug.bind(logger),
		info: logger.info.bind(logger),
		error: logger.error.bind(logger),
		warn: logger.warn.bind(logger),
		setLevel: () => {},
		getLevel: () => 'debug',
		setName: () => {}
	} as Logger;
}
