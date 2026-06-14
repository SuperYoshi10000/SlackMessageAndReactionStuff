import type { App } from '@slack/bolt';
import { blockkit } from './blockkit.js';
import { ephemeral } from './ephemeral.js';
import { oauth } from './oauth.js';
import { sendmessage } from './sendmessage.js';

const register = (app: App) => {
  app.command('/blockkit', blockkit);
  app.command('/blockkit-raw', blockkit); // Sends non-escaped, but handled the same way (allows channel pings and user mentions by ID)
  app.command('/ephemeral', ephemeral);
  app.command('/mk-mrs-bot-oauth', oauth);
  app.command('/sendmessage', sendmessage);
  app.command('/sendmessage-raw', sendmessage); // Sends non-escaped, but handled the same way (allows channel pings and user mentions by ID)

};

export default { register };
