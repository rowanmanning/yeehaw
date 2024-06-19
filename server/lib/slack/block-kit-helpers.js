'use strict';

/**
 * Create a block kit divider.
 *
 * @returns {import('@slack/bolt').DividerBlock}
 *     Returns a new divider block.
 */
function divider() {
	return { type: 'divider' };
}

/**
 * Create a block kit context.
 *
 * @param {string} text
 *     The text to put in the context block.
 * @returns {import('@slack/bolt').ContextBlock}
 *     Returns a new context block.
 */
function markdownContext(text) {
	return {
		type: 'context',
		elements: [
			{
				type: 'mrkdwn',
				text
			}
		]
	};
}

/**
 * Create a block kit section.
 *
 * @param {string} text
 *     The text to put in the section block.
 * @param {any} [accessory]
 *     Any accessories to add to the block.
 * @returns {import('@slack/bolt').SectionBlock}
 *     Returns a new section block.
 */
function markdownSection(text, accessory) {
	return {
		type: 'section',
		text: {
			type: 'mrkdwn',
			text
		},
		accessory
	};
}

module.exports = {
	divider,
	markdownContext,
	markdownSection
};
