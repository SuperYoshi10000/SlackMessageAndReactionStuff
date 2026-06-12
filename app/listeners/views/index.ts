import type { App } from '@slack/bolt';
import { react_any_submit } from './react_any_submit.js';

const register = (app: App) => {
  app.view(/react_any_submit\/(.+):(.+)/, react_any_submit);
};

export default { register };
