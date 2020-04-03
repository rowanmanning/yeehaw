
# Yeehaw

Stage exciting horse races from the comfort of any public Slack channel, and bet on the result. Yeehaw!<br/>
Install on Slack and use the `/race` command.

<img src="https://rowanmanning.github.io/yeehaw/demo.gif" alt="Demo of the Slack command in action, five horses racing across the screen" width="400"/>

<a href="https://yeehaw.rowanmanning.com/auth"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/></a>


## Table of Contents

  * [Requirements](#requirements)
  * [Setup](#setup)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

This application requires the following to run:

  * [Node.js](https://nodejs.org/) 12+
  * [MongoDB](https://www.mongodb.com/) 4+


## Setup

I'll write this section soon, promise!

### Local development

  1. Ensure that you have the [required](#requirements) versions of Node.js and MongoDB installed and ready to use

  2. Create an `.env` file to store local configurations in:

     ```sh
     make env
     ```

  3. Do some other things that Rowan hasn't documented yet :grimacing:

  4. Start the application:

     ```sh
     npm run start-dev
     ```

### Slack App Setup

A little work needs doing to set up the bot in Slack.

Your bot will need to expose a public URL for Slack auth & interactions to work.

Navigate to your [Slack Apps page](https://api.slack.com/apps).

1. Create a new app
2. Configure the app (`<BASE_URL>` is defined in your `.env`)

    * *Interactive Components*

        Set to `on`

        `Request URL` `<BASE_URL>/slack/interact`

    * *Slash Commands*

        `Command` = `/race`

        `Request URL` = `<BASE_URL>/slash/race`

    * OAuth & Permissions

        `Redirect URLs` = `<BASE_URL>/auth/redirect`

        `Scopes ` = ? (TODO)


## Contributing

To contribute to this application, clone this repo locally and commit your code on a separate branch. Please write unit tests for your code, and run the linter before opening a pull-request:

```sh
make test    # run all tests
make verify  # run all linters
```


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2020, Rowan Manning
