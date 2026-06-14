import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';

const blockkit = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  let result;

  await ack();
  try {

    if (payload.text.startsWith('edit')) {
      let regexResult = payload.text.match(/^edit\s+([\d+\.]+)\s?(.*)/s);
      let [, timestamp, message = ''] = regexResult || [];
      let json = JSON.parse(message);
      let blocks: any[] | undefined = Array.isArray(json) ? json : [json];
      if (typeof json !== 'object') {
        blocks = undefined;
        message = json;
      }

      result = await client.chat.update({
        channel: payload.channel_id,
        blocks,
        text: message,
        token: context.oauthUserToken,
        ts: timestamp
      });
      return;
    }

    let regexResult = payload.text.match(/^([\d+\.]+)?\s*(?:<@([\w]+)(?:\|[\w\-. ]+)?>)?\s?(.*)/s);
    let [, timestamp, userId, message = ''] = regexResult || [];
    console.log('/blockkit - timestamp:', timestamp, 'userId:', userId, 'message:', message, '(original:', payload.text, 'regexResult:', regexResult, ')');
    let json = JSON.parse(message);
    let blocks: any[] | undefined = Array.isArray(json) ? json : [json];
    if (typeof json !== 'object') {
      blocks = undefined;
      message = json;
    }

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
    console.error(error);
    if (result?.error === 'token_expired' || result?.error === 'invalid_auth') {
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
