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
        }],
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
