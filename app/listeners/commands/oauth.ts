import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';

const oauth = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  await ack();
  clearUserAuth(payload.user_id);
  requestOauthMessage(client, payload.channel_id, payload.user_id);
};

export { oauth };
