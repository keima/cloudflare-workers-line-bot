import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { Client, webhook, messagingApi } from '@line/bot-sdk'

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

    // const client = new Client({
    //     channelAccessToken: c.env.LINE_CHANNEL_ACCESS_TOKEN,
    //     httpConfig: {
    //         adapter: fetchAdapter,
    //     }
    // })

    // const api = new messagingApi.MessagingApiClient({
    //     channelAccessToken: c.env.LINE_CHANNEL_ACCESS_TOKEN,
    // })

    for(const event of payload.events) {
        if(event.type === 'message') {
            const messageEvent = (event as webhook.MessageEvent)
            const message = messageEvent.message
            if(message.type === 'text') {
                if (messageEvent.replyToken != null) {
                    const text = (message as webhook.TextMessageContent).text

/*
curl -v -X POST https://api.line.me/v2/bot/message/reply \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {channel access token}' \
-d '{
    "replyToken":"*****",
    "messages":[
        {
            "type":"text",
            "text":"Hello, user"
        },
        {
            "type":"text",
            "text":"May I help you?"
        }
    ]
}'
*/
                    await fetch("https://api.line.me/v2/bot/message/reply", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${c.env.LINE_CHANNEL_ACCESS_TOKEN}`
                        },
                        body: JSON.stringify({
                            replyToken: messageEvent.replyToken,
                            messages: [
                                {
                                    type: 'text',
                                    text: `🦜 < ${text}`,
                                },
                            ]
                        }),
                    })

                    // await client.replyMessage(
                    //     messageEvent.replyToken,
                    //     [
                    //         {
                    //             type: 'text',
                    //             text: `🦜 < ${text}`,
                    //         },
                    //     ]
                    // )
                }
            }
        }
    }

    return c.json({
        message: 'ok'
    })
})

export default app
