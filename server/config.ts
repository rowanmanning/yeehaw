export const environment = process.env.NODE_ENV || 'development';
export const isProduction = environment === 'production';
export const logLevel = process.env.LOG_LEVEL || 'debug';
export const port = process.env.PORT ? Number(process.env.PORT) : 8080;
export const slackBotToken = process.env.SLACK_BOT_TOKEN;
export const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
