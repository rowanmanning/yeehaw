'use strict';

const emojiRegExp = /:(([a-z0-9'+_-]{1,100})(::(skin-tone-\d))?):/g;

/**
 * Extract Slack emoji from text.
 *
 * @param {string} text
 *     The text to extract emoji from.
 * @returns {Array<string>}
 *     Returns the extracted emoji.
 */
module.exports = function extractEmojiFromText(text) {
	const emoji = [];
	let match;
	while ((match = emojiRegExp.exec(text)) !== null) {
		emoji.push(`:${match[2]}:${match[4] ? `:${match[4]}:` : ''}`);
	}
	return emoji;
};
