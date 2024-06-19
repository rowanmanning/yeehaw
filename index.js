'use strict';

const yeehaw = require('./server');

// Load configurations from an `.env` file if present
require('dotenv').config();

// Create and start the app
const { start } = yeehaw({
	fathomSiteId: process.env.FATHOM_SITE_ID,
	mongoConnectionUri: process.env.MONGODB_URI,
	slackClientId: process.env.SLACK_CLIENT_ID,
	slackClientSecret: process.env.SLACK_CLIENT_SECRET,
	slackClientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
	slackStateSecret: process.env.SLACK_STATE_SECRET
});
start({
	port: process.env.PORT
}).catch((error) => {
	process.exitCode = 1;
	// biome-ignore lint/nursery/noConsole: pino logging might fail. This is an escape hatch
	console.error(error.stack);
});
