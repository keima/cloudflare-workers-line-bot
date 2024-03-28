import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { Env } from './types';

import lineWebhook from './lineWebhook';

const app = new Hono<Env>()

app.get('/', (c) => c.text("cloudflare-workers-line-bot"))

app.route('/webhook', lineWebhook)

showRoutes(app)

export default app
