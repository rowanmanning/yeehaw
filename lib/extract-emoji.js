'use strict';

const emojiRegExp = /:(([a-z0-9'+_-]{1,100})(::(skin-tone-\d))?):/g;

module.exports = function extractEmojiOccurrencesFromString(string) {
	const emoji = [];
	let match;
	while ((match = emojiRegExp.exec(string)) !== null) {
		emoji.push(`:${match[2]}:${match[4] ? `:${match[4]}:` : ''}`);
	}
	return emoji;
};
