'use strict';

const App = require('@rowanmanning/app');
const dotenv = require('dotenv');

dotenv.config();

const app = new App({
	basePath: __dirname,
	databaseUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/yeehaw',
	name: 'Yeehaw',
	sessionSecret: process.env.SESSION_SECRET
});

app.start().catch(error => {
	app.log.error(error.stack);
	process.exitCode = 1;
});
