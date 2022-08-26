'use strict';

/**
 * Wait for a number of milliseconds.
 *
 * @param {number} milliseconds
 *     The numer of milliseconds to wait.
 * @returns {Promise<void>}
 *     Returns a promise which resolves to nothing.
 */
module.exports = function wait(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
};
