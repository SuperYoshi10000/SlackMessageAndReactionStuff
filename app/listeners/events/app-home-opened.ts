import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

const appHomeOpenedCallback = async ({
  client,
  event,
  logger,
  payload
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_home_opened'>) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') {
    return;
  }

  try {
    const authUrl = `${process.env.OAUTH_AUTHORIZE_URL}%2F${payload.user}`; // last param is redirect_uri so this will add it to that
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This bot lets you send a message using block kit, or react with any emoji."
            }
        },
          {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Please authorize this app (if you haven't already) before using its commands."
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Authorize",
                    "emoji": true
                },
                "value": "authorize",
                "url": authUrl,
                "action_id": "authorize",
                "style": "primary"
            }
        }, {
          "type": "markdown",
          "text": `# Message and Reaction Stuff
This is a slack bot that lets you send a message using block kit, send an ephemeral message, and react with anything, all as you.

## Block Kit
To send a message using block kit, use \`/blockkit [message]\`  
To send it as an ephemeral message to a specific user, use \`/blockkit @user [message]\`  
To send it in a thread, use \`/blockkit [thread_ts] [message]\`  

## Ephemeral Message
To send an ephemeral ("Only visible to you") message, use \`/ephemeral @user [message]\`  
To send it in a thread, use \`/ephemeral [thread_ts] @user [message]\`  

## Editing Message
Any normal message can be edited with \`/[command] edit [timestamp] [message]\`  
Ephemeral messages cannot be edited, and non-block kit messages cannot be replaced with block kit (but block kit messages can be replaced with other block kit).`
        }],
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
