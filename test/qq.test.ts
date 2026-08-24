import assert from 'node:assert/strict'
import test from 'node:test'
import { sendQQMarkdown } from '../src/qq'

const keyboard = {
  rows: [{
    buttons: [{
      render_data: { label: '测试', style: 1 },
      action: { type: 2, permission: { type: 2 }, data: '国服碎片', enter: true },
    }],
  }],
}

test('crack 适配器通过 rawmarkdown 发送包装后的键盘内容', async () => {
  let sent: any
  const session = {
    bot: { config: { autoStreamText: false } },
    channelId: 'group-openid',
    isDirect: false,
    async send(message: unknown) {
      sent = message
      return []
    },
  }

  await sendQQMarkdown(session as never, '# Sky Shards', keyboard)

  assert.equal(sent.type, 'qq:rawmarkdown')
  assert.equal(sent.attrs.markdown.content, '# Sky Shards')
  assert.deepEqual(sent.attrs.keyboard.content, keyboard)
})

test('Satori QQ 适配器通过 internal API 发送标准 Markdown 键盘 payload', async () => {
  let channelId = ''
  let sent: any
  const session = {
    bot: {
      config: {},
      internal: {
        async sendMessage(channel: string, payload: unknown) {
          channelId = channel
          sent = payload
        },
      },
    },
    channelId: 'group-openid',
    isDirect: false,
    messageId: 'message-id',
    timestamp: Date.now(),
  }

  await sendQQMarkdown(session as never, '# Sky Shards', keyboard)

  assert.equal(channelId, 'group-openid')
  assert.equal(sent.msg_type, 2)
  assert.deepEqual(sent.markdown, { content: '# Sky Shards' })
  assert.deepEqual(sent.keyboard, { content: keyboard })
  assert.equal(sent.msg_id, 'message-id')
  assert.equal(sent.msg_seq, 1)
})
