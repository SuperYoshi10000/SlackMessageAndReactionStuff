# Message and Reaction Stuff
This is a slack bot that lets you send a message using block kit, send an ephemeral message, and react with anything, all as you.

## Block Kit
To send a message using block kit, use `/blockkit [message]`  
To send it as an ephemeral message to a specific user, use `/blockkit @user [message]`  
To send it in a thread, use `/blockkit [thread_ts] [message]`  

## Ephemeral Message
To send an ephemeral ("Only visible to you") message, use `/ephemeral @user [message]`  
To send it in a thread, use `/ephemeral [thread_ts] @user [message]`  

## Editing Message
Any normal message can be edited with `/[command] edit [timestamp] [message]`  
Ephemeral messages cannot be edited, and non-block kit messages cannot be replaced with block kit (but block kit messages can be replaced with other block kit).

## Running
To run the app locally, first add these environment variables:
```env
PORT=<port>
SLACK_CLIENT_ID=<cilent_id>
SLACK_CLIENT_SECRET=<client_secret>
SLACK_SIGNING_SECRET=<signing_secret>
SLACK_APP_TOKEN=xapp-<app_token>
SLACK_BOT_TOKEN=xoxb-<bot_token>
POSTGRES_USER=<username>
POSTGRES_PASSWORD=<password>
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=<database_name>
OAUTH_AUTHORIZE_URL=https://slack.com/oauth/v2/authorize?scope=<scopes>&user_scope=<user_scopes>&client_id=<client_id>&redirect_uri=<redirect_here_after_oauth> # include all scopes from manifest.json
OAUTH_REDIRECT_URI=<redirect_here_after_oauth>
```
and run `app.ts` (not `app-oauth.ts`)
```bash
npx tsx app.ts # Node
pnpx tsx app.ts # PNPM
```

You will need to create a Slack app using `manifest.json` and replacing the URLs
