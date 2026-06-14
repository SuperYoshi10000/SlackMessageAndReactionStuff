import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { clearUserAuth } from '../../db/db.js';
import { requestOauthMessage, requireOauth } from '../oauth.js';
import type { Block, KnownBlock } from '@slack/web-api';

const sendmessage = async ({ ack, logger, respond, payload, client, context }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  let result;

  await ack();
  try {

    if (payload.text.startsWith('edit')) {
      let regexResult = payload.text.match(/^edit\s+([\d+\.]+)\s+(\w+|\.)\s+(.*)/s);
      let [, timestamp, type, message = ''] = regexResult || [];
      let content = parseMessage(type, message);
      let blocks = typeof content === 'string' ? undefined : Array.isArray(content) ? content : [content];

      result = await client.chat.update({
        channel: payload.channel_id,
        blocks,
        text: message,
        token: context.oauthUserToken,
        ts: timestamp
      });
      return;
    }

    let regexResult = payload.text.match(/^([\d+\.]+)?\s*(?:<@([\w]+)(?:\|[\w\-. ]+)?>)?\s*(\w+|\.)\s+(.*)/s);
    let [, timestamp, userId, type, message = ''] = regexResult || [];
    console.log('/sendmessage - timestamp:', timestamp, 'userId:', userId, 'message:', message, '(original:', payload.text, 'regexResult:', regexResult, ')');
    
    let content = parseMessage(type, message);
    let blocks = typeof content === 'string' ? undefined : Array.isArray(content) ? content : [content];

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

export { sendmessage };

function parseMessage(type: string, text: string): string | KnownBlock | (Block | KnownBlock)[] {
    switch (type.replace(/[^a-z\d\.]/gi, '').toLowerCase()) {
        case '.':
        case 'txt':
        case 'text':
        case 'plain':
        case 'plaintext':
            return text;
        case 'md':
        case 'mrkdwn':
        case 'markdown':
            return {
                type: 'markdown',
                text
            }
        case 'block':
        case 'blocks':
        case 'blockkit':
            return JSON.parse(text);
        case 'img':
        case 'image':
            let [imageUrl, imageAlt, imageTitle] = text.split('\n');
            return {
                type: 'image',
                image_url: imageUrl,
                alt_text: imageAlt || `Image ${imageUrl}`,
                title: {
                    type: 'plain_text',
                    text: imageTitle,
                    emoji: true
                },
            }
        case 'video':
            let [videoSource, videoAlt, videoTitle, videoDesc, videoAuthor, videoProvider] = text.split('\n');
            let [videoUrl, thumbnailUrl, titleUrl, providerUrl] = videoSource.split(' ');
            return {
                type: 'video',
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                alt_text: videoAlt || `Video ${videoUrl}`,
                title: {
                    type: 'plain_text',
                    text: videoTitle || videoAlt || `Video ${videoUrl}`,
                    emoji: true
                },
                title_url: titleUrl,
                description: typeof videoDesc === 'string' ? {
                    type: 'plain_text',
                    text: videoDesc,
                    emoji: true
                } : undefined,
                author_name: videoAuthor,
                provider_icon_url: providerUrl,
                provider_name: videoProvider
            }
        case 'link':
        case 'url':
            let [linkUrl, linkText] = text.split(' ', 2);
            return {
                type: 'rich_text',
                elements: [{
                    type: 'rich_text_section',
                    elements: [{
                        type: 'link',
                        url: linkUrl,
                        text: linkText || linkUrl
                    }]
                }]
            }
        case 'date':
        case 'time':
        case 'datetime':
            let [dateString, dateFallback, dateUrl] = text.split('\n');
            let [dateFormat, dateTimestamp] = dateString.split(' ', 2);
            return {
                type: 'rich_text',
                elements: [{
                    type: 'rich_text_section',
                    elements: [{
                        type: 'date',
                        timestamp: dateTimestamp ? parseInt(dateTimestamp) : Math.floor(Date.now() / 1000),
                        format: dateFormat,
                        fallback: dateFallback,
                        url: dateUrl
                    }]
                }]
            }
    }
    return text;
}