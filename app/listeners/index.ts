import actions from './actions/index.js';
import commands from './commands/index.js';
import events from './events/index.js';
import messages from './messages/index.js';
import shortcuts from './shortcuts/index.js';
import views from './views/index.js';

import { authorizeUser } from '../db/db.js';
import { requireOauth } from './oauth.js';

import pg from 'pg';
import { App } from '@slack/bolt';

const registerListeners = (app: App) => {
  actions.register(app);
  commands.register(app);
  events.register(app);
  messages.register(app);
  shortcuts.register(app);
  views.register(app);

  app.use(requireOauth);
};

export default registerListeners;
