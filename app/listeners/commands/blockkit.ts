import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';

const blockkit = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  let result;

  await ack();
  try {

    let regexResult = payload.text.match(/((?:\d+\.\d+)?)\s*<@([\w]+)(?:\|[\w-. ]+)+>\s?(.*)/);
    let [, timestamp, userId, message = ''] = regexResult || [];
    console.debug(`Block:`, message);
    let json = JSON.parse(message);
    let blocks = Array.isArray(json) ? json : [json];

    if (userId) {
      result = await client.chat.postEphemeral({
        channel: payload.channel_id,
        blocks,
        text: message,
        token: context.oauthUserToken,
        user: userId,
        ...(timestamp ? { thread_ts: timestamp } : {})
      })
    } else {
      result = await client.chat.postMessage({
        channel: payload.channel_id,
        blocks,
        text: message,
        token: context.oauthUserToken,
        ...(timestamp ? { thread_ts: timestamp } : {})
      });
    }
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
