import type { AllMiddlewareArgs, MessageShortcut, SlackShortcutMiddlewareArgs } from '@slack/bolt';

const copy_special = async ({
  ack,
  client,
  logger,
  shortcut,
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs) => {
  try {
    const { trigger_id } = shortcut;

    await ack();

    let { channel, message } = shortcut as MessageShortcut;

    await client.views.open({
      trigger_id,
      view: {
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "Copy Special",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Done",
          "emoji": true
        },
        "blocks": [
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "text",
                    "text": "Channel ID: "
                  },
                  {
                    "type": "text",
                    "text": channel.id,
                    "style": {
                      "code": true
                    }
                  },
                  {
                    "type": "text",
                    "text": "\nUser ID: "
                  },
                  {
                    "type": "text",
                    "text": message.user || '',
                    "style": {
                      "code": true
                    }
                  },
                  {
                    "type": "text",
                    "text": "\nTimestamp: "
                  },
                  {
                    "type": "text",
                    "text": message.ts,
                    "style": {
                      "code": true
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "rich_text",
            "elements": [
              {
                "type": "rich_text_preformatted",
                // @ts-ignore
					      "language": "Message",
                "elements": [
                  {
                    "type": "text",
                    "text": message.text || ''
                  }
                ]
              }
            ]
          }
        ]
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { copy_special };
