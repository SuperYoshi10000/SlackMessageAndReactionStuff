import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from '@slack/bolt';

const react_any_submit = async ({ ack, body, client, logger, view }: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  try {
    await ack();
    const [_, channel_id, message_ts] = view.callback_id.match(/react_any_submit\/(.+):(.+)/) || [];
    if (!channel_id || !message_ts) {
      return;
    }
    const { block } = view.state.values;
    
    const emojiName = block['emoji_name'].value;

    if (typeof emojiName !== 'string') {
      return;
    }
    
    await client.reactions.add({
      channel: channel_id,
      timestamp: message_ts,
      name: emojiName
    });
  } catch (error) {
    logger.error(error);
  }
};

export { react_any_submit };
