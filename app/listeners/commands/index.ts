import type { App } from '@slack/bolt';
import { blockkit } from './blockkit.js';

const register = (app: App) => {
  app.command('/blockkit', blockkit);
};

export default { register };
