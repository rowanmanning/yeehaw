'use strict';

module.exports = class PinoBoltLogger {

	constructor(pinoLogger) {
		this.pinoLogger = pinoLogger;
	}

	debug(...messages) {
		this.pinoLogger.debug(...messages);
	}

	info(...messages) {
		this.pinoLogger.info(...messages);
	}

	warn(...messages) {
		this.pinoLogger.warn(...messages);
	}

	error(...messages) {
		this.pinoLogger.error(...messages);
	}

	setLevel(level) {
		this.level = level;
	}

	getLevel() {
		return this.level || 'debug';
	}

	setName() {}

};
