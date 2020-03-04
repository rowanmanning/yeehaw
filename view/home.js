'use strict';

const {html} = require('@rowanmanning/app');
const layout = require('./layout/default');
const SlackButton = require('./partial/slack-button');

module.exports = function homeView(context) {
	return layout(context, html`
		<h1>${context.title}</h1>
		<p>Stage exciting horse races from the comfort of any public Slack channel, and bet on the result. Yeehaw!</p>
		<${SlackButton}/>
	`);
};
