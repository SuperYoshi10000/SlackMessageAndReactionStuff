import type { App } from '@slack/bolt';
import { blockkit } from './blockkit.js';
import { ephemeral } from './ephemeral.js';
import { oauth } from './oauth.js';

const register = (app: App) => {
  app.command('/blockkit', blockkit);
  app.command('/ephemeral', ephemeral);
  app.command('/mk-mrs-bot-oauth', oauth);
};

export default { register };
