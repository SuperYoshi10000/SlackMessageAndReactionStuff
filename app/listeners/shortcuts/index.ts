import type { App } from '@slack/bolt';
import { react_any } from './react_any.js';

const register = (app: App) => {
  app.shortcut('react_any', react_any);
};

export default { register };
