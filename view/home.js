'use strict';

const {html} = require('@rowanmanning/app');
const layout = require('./layout/default');

module.exports = function homeView(context) {
	return layout(context, html`
		<h1>${context.title}</h1>
		<p>Under construction.</p>
	`);
};
