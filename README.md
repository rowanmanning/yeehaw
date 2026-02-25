# Yeehaw!

Stage exciting horse races from the comfort of any Slack channel, and bet on the result. Yeehaw!


## Running locally

Set up the basics:

  * Clone this repo
  * Run `npm install`

Create a Slack app:

  * You can [create an app via manifest](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests) using [our manifest](./slack-manifest.yml).
  * Install your new app on a Slack workspace (we recommend a dedicated testing workspace)
  * Create an `.env` file in the root of this repo with Slack [configurations](#configurations)

Start the server locally:

  * Run `npm run start:local`


## Configurations

The following environment variables configure the app:

  * **`LOG_LEVEL`:** the minimum level of log to output. Set to `fatal`, `error`, `warn`, `info`, or `debug` (default)
  * **`NODE_ENV`:** the mode to run the app in. Set to `production` or `development` (default)
  * **`PORT`:** the HTTP port to run on. Set to a port number (`8080` is default)
  * **`SLACK_BOT_TOKEN`:** the Slack app's bot token for testing local installations
  * **`SLACK_SIGNING_SECRET`:** the Slack app signing secret

Locally we configure via an `.env` file. The following is a useful template:

```sh
LOG_LEVEL=debug
NODE_ENV=development
PORT=8080
SLACK_BOT_TOKEN=XXXXXX
SLACK_SIGNING_SECRET=XXXXXX
```
