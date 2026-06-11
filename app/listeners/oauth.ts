import { AllMiddlewareArgs, AnyMiddlewareArgs, App, SlashCommand, StringIndexed } from "@slack/bolt";
import { authorizeUser } from "../db/db.js";

export async function requireOauth({ payload, client, context, next, ack }: AnyMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  let userId = (payload as SlashCommand).user_id || '';
  let channelId = (payload as SlashCommand).channel_id || '';
  if (!userId) {
    ack?.();
    return;
  }
  const token = await authorizeUser(client, userId);
  if (!token) {
    ack?.();
    requestOauthMessage(client, channelId, userId);
    return;
  }
  context.oauthUserToken = token;
  await next();
}

export async function requestOauthMessage(client: App['client'], channelId: string, userId: string) {
    client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        blocks: [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Please authorize this app before using its commands."
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Authorize",
                    "emoji": true
                },
                "value": "authorize",
                "url": process.env.OAUTH_AUTHORIZE_URL,
                "action_id": "authorize",
                "style": "primary"
            }
        }],
        text: `Please authorize this app before using its commands:\n${process.env.OAUTH_AUTHORIZE_URL}`
    });
}