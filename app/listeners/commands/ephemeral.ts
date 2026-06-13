import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';

const ephemeral = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  let result;

  await ack();
  try {

    let regexResult = payload.text.match(/^([\d+\.]+)?\s*(?:<@([\w]+)(?:\|[\w\-. ]+)?>)\s?(.*)/s);
    let [, timestamp, userId, message = ''] = regexResult || [];

    if (!userId) {
        await respond(`No user specified. Usage: \`/ephemeral @user [message]\``);
        return;
    }
    result = await client.chat.postEphemeral({
        channel: payload.channel_id,
        text: message,
        token: context.oauthUserToken,
        user: userId,
        ...(timestamp ? { thread_ts: timestamp } : {})
    });
  } catch (error) {
    logger.error(error);
    if (result?.error === 'token_expired' || result?.error === 'invalid_auth') {
      clearUserAuth(payload.user_id);
      requestOauthMessage(client, payload.channel_id, payload.user_id);
      return;
    }

    client.chat.postEphemeral({
      channel: payload.channel_id,
      user: payload.user_id,
      text: 'Failed to parse message'
    });
  }
};

export { ephemeral };
