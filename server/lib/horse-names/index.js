'use strict';

const adjectives = require('./words/adjectives');
const valentinesDayAdjectives = require('./words/adjectives-valentines-day');
const christmasAdjectives = require('./words/adjectives-christmas');
const nouns = require('./words/nouns');
const valentinesDayNouns = require('./words/nouns-valentines-day');
const christmasNouns = require('./words/nouns-christmas');
const randomItem = require('random-item');

/**
 * Generate a name for a horse.
 *
 * @returns {string}
 *     Returns the generated horse name.
 */
module.exports = function generateHorseName() {
	const date = new Date();

	if (isValentinesSeason(date)) {
		return `${randomItem(valentinesDayAdjectives)} ${randomItem(valentinesDayNouns)}`;
	}

	if (isChristmasSeason(date)) {
		return `${randomItem(christmasAdjectives)} ${randomItem(christmasNouns)}`;
	}

	return `${randomItem(adjectives)} ${randomItem(nouns)}`;
};

/**
 * Get whether a date is close to Valentines day.
 *
 * @param {Date} date
 *     The date to check.
 * @returns {boolean}
 *     Returns whether the date is around Valentines day.
 */
function isValentinesSeason(date) {
	const month = date.getUTCMonth();
	const day = date.getUTCDate();
	return (month === 1 && day >= 12 && day <= 16);
}

/**
 * Get whether a date is close to Christmas.
 *
 * @param {Date} date
 *     The date to check.
 * @returns {boolean}
 *     Returns whether the date is around Christmas.
 */
function isChristmasSeason(date) {
	return (date.getUTCMonth() === 11);
}
