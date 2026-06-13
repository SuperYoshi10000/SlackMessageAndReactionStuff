import type { App } from '@slack/bolt';
import { react_any } from './react_any.js';
import { copy_special } from './copy_special.js';

const register = (app: App) => {
  app.shortcut('react_any', react_any);
  app.shortcut('copy_special', copy_special);
};

export default { register };
