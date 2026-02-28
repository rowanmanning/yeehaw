# Yeehaw!

Stage exciting horse races from the comfort of any Slack channel, and bet on the result. Yeehaw!


## Running locally

Set up the basics:

  * Clone this repo
  * Run `npm install`

Create a Slack app:

  * You can [create an app via manifest](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests) using [our manifest](./slack-manifest.yml).
  * You will need to change the hostnames to the public location of your app, use a tunnelling service if you're running locally ([Pinggy](https://pinggy.io/) recommended)
  * Install your new app on a Slack workspace (we recommend a dedicated testing workspace)
  * Create an `.env` file in the root of this repo with Slack [configurations](#configurations)

Start the server locally (requires [Docker Compose](https://docs.docker.com/compose/)):

  * Run `npm run start:local`

## Configurations

The following environment variables configure the app:

  * **`DATABASE_URL`:** a MongoDB database connection string
  * **`HOSTNAME`:** the hostname used in Slack redirect URLs
  * **`LOG_LEVEL`:** the minimum level of log to output. Set to `fatal`, `error`, `warn`, `info`, or `debug` (default)
  * **`NODE_ENV`:** the mode to run the app in. Set to `production` or `development` (default)
  * **`PORT`:** the HTTP port to run on. Set to a port number (`8080` is default)
  * **`SLACK_CLIENT_ID`:** the Slack app signing secret (found in your app credentials)
  * **`SLACK_CLIENT_SECRET`:** the Slack app signing secret (found in your app credentials)
  * **`SLACK_SIGNING_SECRET`:** the Slack app signing secret (found in your app credentials)
  * **`SLACK_STATE_SECRET`:** a generated secret used to generate and verify state parameters in auth requests

Locally we configure via an `.env` file. The following is a useful template:

```sh
HOSTNAME=yeehaw.example.com
LOG_LEVEL=debug
NODE_ENV=development
PORT=8080
SLACK_CLIENT_ID=XXXXXX
SLACK_CLIENT_SECRET=XXXXXX
SLACK_SIGNING_SECRET=XXXXXX
SLACK_STATE_SECRET=XXXXXX
```
