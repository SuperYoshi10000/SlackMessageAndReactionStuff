import type { App } from '@slack/bolt';
import { blockkit } from './blockkit.js';
import { ephemeral } from './ephemeral.js';

const register = (app: App) => {
  app.command('/blockkit', blockkit);
  app.command('/ephemeral', ephemeral);
};

export default { register };
