import type { AllMiddlewareArgs, MessageShortcut, SlackShortcutMiddlewareArgs } from '@slack/bolt';

const react_any = async ({
  ack,
  client,
  logger,
  shortcut,
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs) => {
  try {
    const { trigger_id } = shortcut;
    const { channel, message } = shortcut as MessageShortcut;

    await ack();
    await client.views.open({
      trigger_id,
      view: {
        "type": "modal",
        "callback_id": `react_any_submit/${channel.id}:${message.ts}`,
        "title": {
            "type": "plain_text",
            "text": "React with Anything",
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Add Reaction",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "emoji_name"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Emoji Name",
                    "emoji": true
                },
                "optional": true,
                "block_id": "block"
            }
        ]
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { react_any };
