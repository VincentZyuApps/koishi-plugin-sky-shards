import { Context } from 'koishi'
import { BrowserProxy } from './proxy'

interface BrowserContextLike {
  newPage(): Promise<PageLike>
  close(): Promise<void>
}

interface PageLike {
  setViewport(viewport: { width: number; height: number; deviceScaleFactor: number }): Promise<void>
  authenticate?(credentials: { username: string; password: string }): Promise<void>
  goto(url: string, options: { waitUntil: 'domcontentloaded'; timeout: number }): Promise<unknown>
  waitForSelector(selector: string, options: { timeout: number }): Promise<unknown>
  waitForNetworkIdle?(options: { idleTime: number; timeout: number }): Promise<unknown>
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>
  screenshot(options: { type: 'jpeg'; quality: number }): Promise<Buffer>
  close(): Promise<void>
}

interface BrowserLike {
  createBrowserContext(options?: { proxyServer?: string }): Promise<BrowserContextLike>
}

const viewport = { width: 1280, height: 720, deviceScaleFactor: 1 }
const navigationTimeout = 30_000

export async function renderShardScreenshot(ctx: Context, pageUrl: string, proxy?: BrowserProxy) {
  const browser = (ctx as any).puppeteer?.browser as BrowserLike | undefined
  if (!browser?.createBrowserContext) {
    throw new Error('Puppeteer 服务不支持独立浏览器上下文，请升级 koishi-plugin-puppeteer。')
  }

  const browserContext = await browser.createBrowserContext(proxy ? { proxyServer: proxy.server } : undefined)
  let page: PageLike | undefined
  try {
    page = await browserContext.newPage()
    await page.setViewport(viewport)
    if (proxy?.username && page.authenticate) {
      await page.authenticate({ username: proxy.username, password: proxy.password ?? '' })
    }
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: navigationTimeout })
    await page.waitForSelector('main', { timeout: navigationTimeout })
    await page.evaluate(async () => {
      await document.fonts?.ready
    })
    if (page.waitForNetworkIdle) {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 7_500 }).catch(() => undefined)
    }
    return await page.screenshot({ type: 'jpeg', quality: 85 })
  } finally {
    await page?.close().catch(() => undefined)
    await browserContext.close().catch(() => undefined)
  }
}
