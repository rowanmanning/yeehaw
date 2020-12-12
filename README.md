
# Yeehaw

Stage exciting horse races from the comfort of any public Slack channel, and bet on the result. Yeehaw!<br/>
Install on Slack and use the `/race` command.

<img src="https://rowanmanning.github.io/yeehaw/demo.gif" alt="Demo of the Slack command in action, five horses racing across the screen" width="400"/>

<a href="https://yeehaw.rowanmanning.com/auth"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/></a>


## Table of Contents

  * [Requirements](#requirements)
  * [Running locally](#running-locally)
  * [Running on a server](#running-on-a-server)
  * [Config options](#config-options)
  * [Slack App setup](#slack-app-setup)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

This application requires the following to run:

  * [Node.js](https://nodejs.org/) 12+
  * [MongoDB](https://www.mongodb.com/) 4+
  * A [Slack App](https://api.slack.com/start/overview) configured as per [these instructions](#slack-app-setup)

To run the application locally, you'll also need:

  * Software to expose `localhost` to the public web. I recommend [ngrok](https://ngrok.com/)
  * Probably your own private Slack for testing in


## Running Locally

Get this application running on your local machine by following these steps. Warning: using a production Slack App for this may result in things stopping working. I find it best to have two Slack Apps – one for production and one for testing.

  1. Make sure you have set up everything listed in [Requirements](#requirements)

  2. Clone this repository, and `cd` into it:

        ```sh
        git clone https://github.com/rowanmanning/yeehaw.git && cd yeehaw
        ```

  3. Install the application dependencies:

        ```sh
        npm install
        ```

  4. Copy the sample `.env` file to make changes to the [configuration](#config-options). You'll need to do this if you want sessions to persist between restarts of the application and also to provide your Slack App details. The following command copies `sample.env` to `.env`:

        ```sh
        make env
        ```

  5. Start the application in production mode:

        ```sh
        make start
        ```

        Or development mode if you want code changes to auto-restart the application:

        ```sh
        make start-dev
        ```

  6. Visit [localhost:8080](http://localhost:8080/) in your browser, you should see the application running.

  7. Expose your application to the public web. With [ngrok](https://ngrok.com/) you'd run the following, replacing the port if you're using a different one:

        ```
        ngrok http 8080
        ```

        This will give you a public forwarding URL, something like `https://RANDOM_CHARACTERS.ngrok.io`. You'll need to do two things to finish this setup:

        1. Update your Slack App to allow your new ngrok URL as a redirect URL. Add it to the Redirect URLs in your Slack App's "OAuth & Permissions" section
        2. Update your Slack App slash commands to use use your ngrok URL
        3. Update your Slack App interactivity and shortcuts to use use your ngrok URL
        4. Change your `BASE_URL` in `.env` to the new public ngrok URL
        5. Restart your application locally

  8. Visit your new ngrok URL in-browser, you should see the Yeehaw home page. Click the "Add to Slack" button, and authenticate

  9. Now you should have access to the `/race` command in your test Slack! You can make changes to your local application and test that they work!


## Running on a server

Most instructions for running on a server are the same as [running locally](#running-locally). You just don't need to use ngrok or similar for the public URL. The simplest way to get set up on a server is with Heroku:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/rowanmanning/yeehaw/tree/master)


## Config options

This application is configured using environment variables, or an [`.env` file](https://github.com/motdotla/dotenv). The following options are available:

  - **`BASE_URL`**: A public URL where your app runs, with no trailing slash. Used for redirects during slack authentication.

  - **`MONGODB_URI`**: A MongoDB connection string, used to connect to the database. Defaults to `mongodb://localhost:27017/yeehaw`.

  - **`NODE_ENV`**: The environment to run the application in, one of `production`, `development`, `test`. Defaults to `development`.

  - **`PORT`**: The HTTP port to run the application on. If set to an empty string, a random port will be assigned. Defaults to `8080`.

  - **`SESSION_SECRET`**: A secret key for session hashing. If this is not set, a random key will be used on each restart of the application. This will cause sessions to drop off, and is very annoying in development.

  - **`SLACK_CLIENT_ID`**: A Slack App Client ID. See [Slack App setup](#slack-app-setup) for instructions on how to get this.

  - **`SLACK_CLIENT_SECRET`**: A Slack App Client ID. See [Slack App setup](#slack-app-setup) for instructions on how to get this.

  - **`SLACK_CLIENT_SIGNING_SECRET`**: A Slack App Signing Secret. A Slack App Client ID. See [Slack App setup](#slack-app-setup) for instructions on how to get this.

  - **`FATHOM_SITE_ID`**: A [Fathom](https://usefathom.com/) site ID, used for tracking web views. This respects Do Not Track, doesn't use cookies, and is optional (mostly used for the main public install).


## Slack App setup

Instructions on creating a Slack App for local development or hosting your own private version of Yeehaw:

  1. Create a [Slack App here](https://api.slack.com/apps). Choose a name and then select a Development Slack Workspace. This workspace will be used for testing your application, and I recommend having a dedicated one just for testing

  2. Once your app is created, scroll down and find the following information. You'll need these later in order to run Yeehaw locally or on a server: `Client ID`, `Client Secret`, `Signing Secret`

  3. Under "Add features and functionality", click "Slash Commands". Then click "Create New Command" and fill out the following:

      * **Command:** `/race`
      * **Request URL:** `https://your-public-url.com/slack/slash` (put a placeholder in here for now if you don't yet have a public URL or are only working locally)
      * **Short Description:** `Race some horses! Yeehaw!`
      * **Usage Hint:** `(start | leaderboard | stats) [up to five emoji]`
      * Check the box "Escape channels, users, and links sent to your app"

      Now save your slash command.

  4. Click "Interactivity & Shortcuts" in the sidebar, and turn it on. Set the Interactivity Endpoint to `https://your-public-url.com/slack/interact` (put a placeholder in here for now if you don't yet have a public URL or are only working locally). Click "Save Changes"

  5. Scroll down to "Shortcuts", and click "Create New Shortcut". Select "Global" and click "Next". Fill out the following:

      * **Name:** `Start a Race`
      * **Short Description:** `Race some horses! Yeehaw!`
      * **Callback ID:** `setupRace`

  6. Click on "OAuth & Permissions" in the sidebar. If you have a public URL, add a Redirect URL: `https://your-public-url.com/` and click "Save URLs"

  7. Under "Scopes", add the following OAuth scopes:

      * `chat:write`
      * `commands`

  8. Click on "Manage Distribution" in the sidebar. You'll need to make your Slack app public in order to finish setting up Yeehaw, don't worry though – it doesn't appear in the Slack Directory yet!

      Scroll down to "Remove Hard Coded Information" and check the box that says you've reviewed everything. Then click "Activate Public Distribution".

  9. You're done! You can now move on to [local installation](#running-locally) or [installing on a server](#running-on-a-server)


## Contributing

To contribute to this application, clone this repo locally and commit your code on a separate branch. Please write unit tests for your code, and run the linter before opening a pull-request:

```sh
make test    # run all tests
make verify  # run all linters
```


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2020, Rowan Manning
