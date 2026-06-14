import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

const addreaction = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  try {
    await ack();
    
    const [timestamp, ...reactions] = payload.text.split(/\s+/);
    
    await Promise.all(reactions.map(reaction => client.reactions.add({
        channel: payload.channel_id,
        timestamp,
        name: reaction.replace(/^:|:$/g, '')
    }).catch(error => client.chat.postEphemeral({
        channel: payload.channel_id,
        user: payload.user_id,
        text: `Failed to add reaction :${reaction}:\n${error}`
    }))));
  } catch (error) {
    logger.error(error);
  }
};

export { addreaction };
