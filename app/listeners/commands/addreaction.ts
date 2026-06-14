import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

const addreaction = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  try {
    await ack();
    
    const [timestamp, ...reactions] = payload.text.split(/\s+/);
    
    const errors: { reaction: string; error: any }[] = [];
    for (const reaction of reactions) {
        const name = reaction.replace(/^:|:$/g, '');
        const result = await client.reactions.add({
            channel: payload.channel_id,
            timestamp,
            name,
            token: context.oauthUserToken
        });
        if (result.error) errors.push({ reaction: name, error: result.error });
    }
    if (errors.length > 0) client.chat.postEphemeral({
        channel: payload.channel_id,
        user: payload.user_id,
        text: `Failed to add one or more reactions:\n${errors.map(e => `:${e.reaction}: - ${e.error.error}`).join('\n')}`
    })
  } catch (error) {
    logger.error(error);
  }
};

export { addreaction };
