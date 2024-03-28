import { Hono } from 'hono'
import { webhook, messagingApi } from '@line/bot-sdk'
import { Env } from './types'

const app = new Hono<Env>()

// webhook endpoint
app.post('/', async (c) => {
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
