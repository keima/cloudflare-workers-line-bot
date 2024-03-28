import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { webhook, messagingApi } from '@line/bot-sdk'

const Layout: FC = ({ children }) => (
  <html>
    <body>{children}</body>
  </html>
);

type Bindings = {
    LINE_CHANNEL_ACCESS_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text("<Layout>Hello World</Layout>"))

app.post('/webhook', async (c) => {
  const payload = await c.req.json<webhook.CallbackRequest>()

  console.log("/webhook")
  console.log(`${JSON.stringify(payload)}`)

  const api = new messagingApi.MessagingApiClient({
      channelAccessToken: c.env.LINE_CHANNEL_ACCESS_TOKEN,
  })

  for(const event of payload.events) {
      if(event.type === 'message') {
          const messageEvent = (event as webhook.MessageEvent)
          const message = messageEvent.message
          if(message.type === 'text') {
              if (messageEvent.replyToken != null) {
                  const text = (message as webhook.TextMessageContent).text
                  await api.replyMessage({
                      replyToken: messageEvent.replyToken,
                          messages: [
                              {
                                  type: 'text',
                                  text: `🦜 < ${text}`,
                              },
                          ]
                  })
                  // TODO: error handling
              }
          }
      }
  }

  return c.json({
      message: 'ok'
  })
})

export default app
