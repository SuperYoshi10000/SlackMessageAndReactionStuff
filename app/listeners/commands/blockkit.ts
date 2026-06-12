import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';

const blockkit = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  let result;
  try {
    await ack();

    let text = payload.text.split('\n');
    let blocks = text.map(line => {
      return JSON.parse(line);
    });

    result = await client.chat.postMessage({
      channel: payload.channel_id,
      blocks,
      token: context.oauthUserToken
    });
  } catch (error) {
    logger.error(error);
    if (result?.error === 'token_expired') {
      clearUserAuth(payload.user_id);
      requestOauthMessage(client, payload.channel_id, payload.user_id);
      return;
    }

    client.chat.postEphemeral({
      channel: payload.channel_id,
      user: payload.user_id,
      text: 'Failed to parse block kit JSON or JSON was invalid'
    });
  }
};

export { blockkit };
