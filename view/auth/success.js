'use strict';

const {html} = require('@rowanmanning/app');
const layout = require('../layout/default');

module.exports = function authSuccessView(context) {
	return layout(context, html`
		<h1>${context.title}</h1>
		<p>${context.app.name} was added to Slack.</p>
	`);
};
