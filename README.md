
# Yeehaw

Stage exciting horse races from the comfort of any public Slack channel, and bet on the result. Yeehaw!

<a href="https://slack-yeehaw.herokuapp.com/auth"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/></a>

## Slack App Setup

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
