import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, buildPageUrl, parseTargetDate } from '../src/page'
import { renderShardScreenshot } from '../src/render'

test('按服务器自然日解析偏移', () => {
  const now = new Date('2026-03-08T07:30:00.000Z')
  assert.deepEqual(parseTargetDate('+1', 'tgc_global', now), { year: 2026, month: 3, day: 8 })
  assert.deepEqual(parseTargetDate('+1', 'netease_cn', now), { year: 2026, month: 3, day: 9 })
})

test('解析严格八位日期并拒绝无效输入', () => {
  assert.deepEqual(parseTargetDate('20260228', 'netease_cn'), { year: 2026, month: 2, day: 28 })
  assert.throws(() => parseTargetDate('20260229', 'netease_cn'))
  assert.throws(() => parseTargetDate('+24h', 'netease_cn'))
})

test('跨年日期偏移', () => {
  assert.deepEqual(addDays({ year: 2026, month: 1, day: 1 }, -1), { year: 2025, month: 12, day: 31 })
})

test('生成包含服务器和时区的站点 URL', () => {
  const url = new URL(buildPageUrl('https://example.test/sky-shards/', { year: 2026, month: 8, day: 24 }, 'netease_cn', 'Asia/Shanghai'))
  assert.equal(url.pathname, '/sky-shards/zh/2026/08/24')
  assert.equal(url.searchParams.get('server'), 'netease_cn')
  assert.equal(url.searchParams.get('timezone'), 'Asia/Shanghai')
  assert.equal(url.searchParams.get('legTimeline'), '1')
  const compactUrl = new URL(buildPageUrl('https://example.test/', { year: 2026, month: 8, day: 24 }, 'netease_cn', 'Asia/Shanghai', false))
  assert.equal(compactUrl.searchParams.get('legTimeline'), '0')
  assert.throws(() => buildPageUrl('https://example.test/', { year: 2026, month: 8, day: 24 }, 'netease_cn', 'GMT+8'))
})

test('截图使用独立代理上下文并清理页面资源', async () => {
  const calls: string[] = []
  let screenshotOptions: { type: string; quality?: number } | undefined
  const page = {
    async setViewport() { calls.push('viewport') },
    async authenticate() { calls.push('authenticate') },
    async goto() { calls.push('goto') },
    async waitForSelector() { calls.push('selector') },
    async waitForNetworkIdle() { calls.push('idle') },
    async evaluate() { calls.push('evaluate') },
    async screenshot(options: { type: string; quality?: number }) { screenshotOptions = options; calls.push('screenshot'); return Buffer.from('webp') },
    async close() { calls.push('page-close') },
  }
  let proxyServer = ''
  const context = {
    async newPage() { return page },
    async close() { calls.push('context-close') },
  }
  const ctx = {
    puppeteer: {
      browser: {
        async createBrowserContext(options?: { proxyServer?: string }) {
          proxyServer = options?.proxyServer ?? ''
          return context
        },
      },
    },
  }

  const rendered = await renderShardScreenshot(ctx as never, 'https://example.test/', {
    server: 'socks5://127.0.0.1:7890', username: 'user', password: 'pass',
  }, 0, false, 'webp', 72)

  assert.equal(rendered.image.toString(), 'webp')
  assert.equal(rendered.imageType, 'webp')
  assert.deepEqual(screenshotOptions, { type: 'webp', quality: 72 })
  assert.equal(proxyServer, 'socks5://127.0.0.1:7890')
  assert.deepEqual(calls, ['viewport', 'authenticate', 'goto', 'selector', 'evaluate', 'idle', 'screenshot', 'page-close', 'context-close'])
})

test('PNG 截图不传质量参数', async () => {
  let screenshotOptions: { type: string; quality?: number } | undefined
  const page = {
    async setViewport() {}, async goto() {}, async waitForSelector() {}, async evaluate() {},
    async screenshot(options: { type: string; quality?: number }) { screenshotOptions = options; return Buffer.from('png') },
    async close() {},
  }
  const ctx = { puppeteer: { browser: { async createBrowserContext() { return { async newPage() { return page }, async close() {} } } } } }

  await renderShardScreenshot(ctx as never, 'https://example.test/', undefined, 0, false, 'png', 1)

  assert.deepEqual(screenshotOptions, { type: 'png' })
})
