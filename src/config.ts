import { Schema } from 'koishi'
import { defaultKeyboardJson } from './qq'

// ====================
// 📋 配置接口定义
// ====================

/** 🌐 截图浏览器代理使用模式 */
export const BROWSER_PROXY_MODE = {
  DISABLED: 'disabled',
  INHERIT: 'inherit',
  CONFIGURED: 'configured',
} as const

export type BrowserProxyMode = typeof BROWSER_PROXY_MODE[keyof typeof BROWSER_PROXY_MODE]

/** 🌗 Sky Shards 上游页面主题模式 */
export const LIGHT_MODE = {
  LIGHT: 'true',
  DARK: 'false',
  SYSTEM: 'system',
} as const

export type LightMode = typeof LIGHT_MODE[keyof typeof LIGHT_MODE]

/** 🖼️ Puppeteer 截图输出格式 */
export const SCREENSHOT_IMAGE_TYPES = {
  PNG: 'png',
  JPEG: 'jpeg',
  WEBP: 'webp',
} as const

export type ScreenshotImageType = typeof SCREENSHOT_IMAGE_TYPES[keyof typeof SCREENSHOT_IMAGE_TYPES]

/** 🎨 卡片封面展示模式 */
export const COVER_MODE = {
  DYNAMIC: 'dynamic',
  FIXED: 'fixed',
} as const

export type CoverMode = typeof COVER_MODE[keyof typeof COVER_MODE]

/** 🎴 OneBot 预报卡片发送协议类型 */
export const ONEBOT_CARD_PROTOCOL = {
  NETEASE: '163',
  QQ: 'qq',
  KUGOU: 'kugou',
  CUSTOM: 'custom',
} as const

export type OnebotCardProtocol = typeof ONEBOT_CARD_PROTOCOL[keyof typeof ONEBOT_CARD_PROTOCOL]

/** 🖼️ 光遇各大星盘地图与默认封面配置接口 */
export interface CardCoverUrls {
  prairie: string
  forest: string
  valley: string
  wasteland: string
  vault: string
  default: string
}

/** 🌐 默认星盘地图传送门（portal）高清封面直链 (基于 ghproxy 反代与 Pages OG) */
export const DEFAULT_CARD_COVER_URLS: CardCoverUrls = {
  prairie: 'https://ghproxy.net/https://raw.githubusercontent.com/VincentZyuApps/koishi-plugin-wydashen-guangyi-query/main/assets/image/portal/yunye.png',
  forest: 'https://ghproxy.net/https://raw.githubusercontent.com/VincentZyuApps/koishi-plugin-wydashen-guangyi-query/main/assets/image/portal/yulin.png',
  valley: 'https://ghproxy.net/https://raw.githubusercontent.com/VincentZyuApps/koishi-plugin-wydashen-guangyi-query/main/assets/image/portal/xiagu.png',
  wasteland: 'https://ghproxy.net/https://raw.githubusercontent.com/VincentZyuApps/koishi-plugin-wydashen-guangyi-query/main/assets/image/portal/mutu.png',
  vault: 'https://ghproxy.net/https://raw.githubusercontent.com/VincentZyuApps/koishi-plugin-wydashen-guangyi-query/main/assets/image/portal/jinge.png',
  default: 'https://sky-shards-vincentzyu233-fork.pages.dev/icons/og-image.png',
}

/** 🔮 碎片类型 (红石 / 黑石) */
export type ShardMusicType = 'red' | 'black'

/** 🗺️ 星盘地图类型 (云野 / 雨林 / 霞谷 / 暮土 / 禁阁 / 默认) */
export type RealmMapKey = 'prairie' | 'forest' | 'valley' | 'wasteland' | 'vault' | 'default'

/** 🎼 星盘地图与网易云音乐曲库配置项 */
export interface OnebotMapMusicEntry {
  map: RealmMapKey
  shardType: ShardMusicType
  name: string
  musicId: string
}

/** 🎵 默认星盘地图与碎石类型笛卡尔积曲库 (光遇官方原声带 · 作曲 Vincent Diamante / AURORA) */
export const DEFAULT_MAP_MUSIC_TABLE: OnebotMapMusicEntry[] = [
  { map: 'prairie', shardType: 'red', name: '云野 · 圣岛群岛 (红石)', musicId: '1464399274' },
  { map: 'prairie', shardType: 'black', name: '云野 · 蝴蝶平原 (黑石)', musicId: '1464399266' },
  { map: 'forest', shardType: 'red', name: '雨林 · 秘密花园 (红石)', musicId: '1464397575' },
  { map: 'forest', shardType: 'black', name: '雨林 · 静谧庭院 (黑石)', musicId: '1464399265' },
  { map: 'valley', shardType: 'red', name: '霞谷 · 隐士圆梦 (红石)', musicId: '1464399270' },
  { map: 'valley', shardType: 'black', name: '霞谷 · 滑冰竞技 (黑石)', musicId: '1464399272' },
  { map: 'wasteland', shardType: 'red', name: '暮土 · 远古冥龙 (红石)', musicId: '1464399264' },
  { map: 'wasteland', shardType: 'black', name: '暮土 · 荒原黑水 (黑石)', musicId: '1977950598' },
  { map: 'vault', shardType: 'red', name: '禁阁 · 星光沙漠 (红石)', musicId: '1859515946' },
  { map: 'vault', shardType: 'black', name: '禁阁 · 幽光浮台 (黑石)', musicId: '1464399270' },
  { map: 'default', shardType: 'red', name: '默认 · 伊甸之眼 (红石)', musicId: '1464399264' },
  { map: 'default', shardType: 'black', name: '默认 · 空中漫游 (黑石)', musicId: '1464399274' },
]

export interface Config {
  // ==================
  // 💬 消息发送配置字段
  // ==================
  enableQuote: boolean
  enableWaitingHint: boolean

  // ==================
  // 📌 指令配置字段
  // ==================
  cnCommandName: string
  cnCommandAliases: string[]
  globalCommandName: string
  globalCommandAliases: string[]

  // ==================
  // 🌐 Sky Shards 页面与截图配置字段
  // ==================
  url: string
  displayTimeZone: string
  lightMode: LightMode
  enableGlobalShardOverrides: boolean
  enableShardProgressTimeline: boolean
  screenshotDelayMs: number
  screenshotImageType: ScreenshotImageType
  screenshotQuality: number

  // ==================
  // 🌐 浏览器网络配置字段
  // ==================
  browserProxyMode: BrowserProxyMode
  browserProxyUrl: string

  // ==================
  // 🎴 预报卡片通用封面配置字段
  // ==================
  cardCoverUrls: CardCoverUrls

  // ==================
  // 🤖 QQ 官方 Bot 配置字段
  // ==================
  enableQQMarkdown: boolean
  qqMarkdownKeyboardJson: string
  addQqTuwen: boolean
  qqTuwenCoverMode: CoverMode

  // ==================
  // 💬 OneBotV11 的 qqbot 配置字段
  // ==================
  addOnebotCard: boolean
  onebotCardCoverMode: CoverMode
  onebotInfoCardProtocol: OnebotCardProtocol
  addOnebot163MusicCard: boolean
  onebotMapMusicTable: OnebotMapMusicEntry[]

  // ==================
  // 🐛 调试设置字段
  // ==================
  verboseConsoleLog: boolean
}

// ====================
// ⚙️ 配置 Schema 定义
// ====================

export const Config: Schema<Config> = Schema.intersect([
  // ==================
  // 💬 消息发送配置分组
  // ==================
  Schema.object({
    enableQuote: Schema.boolean()
      .default(true)
      .description('💬 bot 发送等待提示、截图结果和错误消息时，是否引用触发指令的消息。'),
    enableWaitingHint: Schema.boolean()
      .default(true)
      .description('⏳ 是否发送「正在获取并生成碎片信息，请稍候」等待提示；任务结束后会自动尝试撤回。'),
  }).description('💬 消息发送配置'),

  // ==================
  // 📌 指令配置分组
  // ==================
  Schema.object({
    cnCommandName: Schema.string()
      .default('国服碎片')
      .description('📌 查询国服碎片的指令名称，默认是 <code>国服碎片</code>。'),
    cnCommandAliases: Schema.array(Schema.string())
      .role('table')
      .default(['今日国服碎片', '国服今日碎片', '光遇国服碎片', 'sky-cn-shards'])
      .description('🏷️ 国服碎片指令别名表格，默认提供 4 个别名。留空项、重复项和与主指令同名的项会自动忽略。'),
    globalCommandName: Schema.string()
      .default('国际服碎片')
      .description('📌 查询国际服碎片的指令名称，默认是 <code>国际服碎片</code>。'),
    globalCommandAliases: Schema.array(Schema.string())
      .role('table')
      .default(['今日国际服碎片', '国际服今日碎片', '光遇国际服碎片', 'sky-global-shards'])
      .description('🏷️ 国际服碎片指令别名表格，默认提供 4 个别名。留空项、重复项和与主指令同名的项会自动忽略。'),
  }).description('📌 指令配置'),

  // ==================
  // 🌐 Sky Shards 页面与截图配置分组
  // ==================
  Schema.object({
    url: Schema.string()
      .default('https://sky-shards-vincentzyu233-fork.pages.dev/')
      .description('🌐 Sky Shards 站点根 URL，可填写 Cloudflare Pages、GitHub Pages 反代或本地 Vite 地址。'),
    displayTimeZone: Schema.string()
      .default('Asia/Shanghai')
      .description('🕒 截图中显示本地时间使用的 IANA 时区，例如 <code>Asia/Shanghai</code>。'),
    lightMode: Schema.union([
      Schema.const(LIGHT_MODE.LIGHT).description('☀️ 浅色模式（上游值 true）。'),
      Schema.const(LIGHT_MODE.DARK).description('🌙 深色模式（上游值 false）。'),
      Schema.const(LIGHT_MODE.SYSTEM).description('💻 跟随浏览器的系统配色偏好（上游默认）。'),
    ])
      .role('radio')
      .default(LIGHT_MODE.SYSTEM)
      .description('🌗 Sky Shards 页面与截图主题，直接对应上游 <code>lightMode</code> URL 参数。'),
    enableGlobalShardOverrides: Schema.boolean()
      .experimental()
      .default(false)
      .description('🧪 是否读取上游前端国际服临时覆写数据，以同步特殊日期的碎片排期。默认关闭；国服不会读取覆写。'),
    enableShardProgressTimeline: Schema.boolean()
      .default(true)
      .description('📊 是否在截图中显示 Sky Shards 的碎片时间轴和进度条；关闭后改为紧凑的三波时间摘要。'),
    screenshotDelayMs: Schema.number()
      .min(0)
      .max(10_000)
      .step(1)
      .default(666)
      .description('⏳ 截图前额外等待时间，单位毫秒。可用于等待网页动画和延迟加载内容完成。'),
    screenshotImageType: Schema.union([
      Schema.const(SCREENSHOT_IMAGE_TYPES.PNG).description('🖼️ PNG：无损格式，文件通常较大，不支持质量参数。'),
      Schema.const(SCREENSHOT_IMAGE_TYPES.JPEG).description('🌄 JPEG：适合网页截图，支持质量参数。'),
      Schema.const(SCREENSHOT_IMAGE_TYPES.WEBP).description('🌐 WebP：体积通常更小，支持质量参数。'),
    ])
      .role('radio')
      .default(SCREENSHOT_IMAGE_TYPES.PNG)
      .description('📤 Puppeteer 网页截图的输出图片格式。'),
    screenshotQuality: Schema.number()
      .role('slider')
      .min(0)
      .max(100)
      .step(1)
      .default(80)
      .description('🎚️ Puppeteer 截图质量，范围为 0-100；仅 JPEG 和 WebP 生效。'),
  }).description('🌐 Sky Shards 页面与截图配置'),

  // ==================
  // 🌐 浏览器网络配置分组
  // ==================
  Schema.object({
    browserProxyMode: Schema.union([
      Schema.const(BROWSER_PROXY_MODE.DISABLED).description('【🚫 不使用代理】截图浏览器直接访问网络，不读取 isolate/http 或下方配置。'),
      Schema.const(BROWSER_PROXY_MODE.INHERIT).description('【🧩 继承 isolate 代理】读取当前 isolate/http 的 <code>proxyAgent</code>。'),
      Schema.const(BROWSER_PROXY_MODE.CONFIGURED).description('【🔐 使用配置项代理】仅使用下方 browserProxyUrl，不继承 isolate/http。'),
    ])
      .role('radio')
      .default(BROWSER_PROXY_MODE.DISABLED)
      .description('🌐 截图浏览器代理模式。默认不使用代理；三种模式互斥。'),
    browserProxyUrl: Schema.string()
      .default('http://127.0.0.1:7890')
      .description('🔐 浏览器代理 URL。仅在代理模式选择「使用配置项代理」时生效。'),
  }).description('🌐 浏览器网络配置'),

  // ==================
  // 🎴 预报卡片通用封面配置分组
  // ==================
  Schema.object({
    cardCoverUrls: Schema.object({
      prairie: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.prairie).description('云野封面 URL'),
      forest: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.forest).description('雨林封面 URL'),
      valley: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.valley).description('霞谷封面 URL'),
      wasteland: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.wasteland).description('暮土封面 URL'),
      vault: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.vault).description('禁阁封面 URL'),
      default: Schema.string().role('link').default(DEFAULT_CARD_COVER_URLS.default).description('默认/无碎片封面 URL'),
    }).collapse().description('各大星盘地图动态匹配的高清封面直链（QQ 官方图文大卡片与 OneBot 预报卡片共用）。'),
  }).description('🎴 预报卡片通用封面配置'),

  // ==================
  // 🤖 QQ 官方 Bot 配置分组
  // ==================
  Schema.object({
    enableQQMarkdown: Schema.boolean()
      .default(true)
      .description('🤖 QQ 官方 Bot 平台在截图后额外发送 Markdown 摘要和快捷按钮。'),
    qqMarkdownKeyboardJson: Schema.string()
      .role('textarea', { rows: [8, 18] })
      .default(defaultKeyboardJson())
      .description('🔘 QQ Markdown 按钮 JSON，支持 <code>${commandName}</code>、<code>${cnCommandName}</code>、<code>${globalCommandName}</code> 与 <code>${pageUrl}</code> 变量。JSON 无效时回退默认按钮。'),
    addQqTuwen: Schema.boolean()
      .experimental()
      .default(true)
      .description('🧪 是否在 QQ 官方 Bot 平台发送「图文大卡片 (msg_type: 8)」，展示碎片预报封面与直达网页。'),
    qqTuwenCoverMode: Schema.union([
      Schema.const(COVER_MODE.DYNAMIC).description('🗺️ 动态匹配（默认）：根据碎片降落地图（云野/雨林/霞谷/暮土/禁阁）动态展示对应特色高清图。'),
      Schema.const(COVER_MODE.FIXED).description('🖼️ 固定封面：统一使用 Sky Shards 官方预设的高清 OG 封面图。'),
    ])
      .role('radio')
      .default(COVER_MODE.DYNAMIC)
      .description('🎨 QQ 图文大卡片封面展示模式。'),
  }).description('🤖 QQ 官方 Bot 配置'),

  // ==================
  // 💬 OneBotV11 的 qqbot 配置分组
  // ==================
  Schema.object({
    addOnebotCard: Schema.boolean()
      .experimental()
      .default(false)
      .description('🧪 是否在 OneBot 平台发送碎片预报富文本交互卡片。'),
    onebotInfoCardProtocol: Schema.union([
      Schema.const(ONEBOT_CARD_PROTOCOL.CUSTOM).description('自定义卡片 (custom)（推荐/默认，支持自定义标题与传送门封面）'),
      Schema.const(ONEBOT_CARD_PROTOCOL.NETEASE).description('网易云音乐 (163)'),
      Schema.const(ONEBOT_CARD_PROTOCOL.QQ).description('QQ 音乐 (qq)'),
      Schema.const(ONEBOT_CARD_PROTOCOL.KUGOU).description('酷狗音乐 (kugou)'),
    ])
      .role('radio')
      .default(ONEBOT_CARD_PROTOCOL.CUSTOM)
      .description('🎴 预报信息卡片发送所使用的协议底座。直接按所选协议发送，无重试与延迟。'),
    onebotCardCoverMode: Schema.union([
      Schema.const(COVER_MODE.DYNAMIC).description('🗺️ 动态匹配（默认）：根据碎片降落地图（云野/雨林/霞谷/暮土/禁阁）动态展示对应特色高清图。'),
      Schema.const(COVER_MODE.FIXED).description('🖼️ 固定封面：统一使用 Sky Shards 官方预设的高清 OG 封面图。'),
    ])
      .role('radio')
      .default(COVER_MODE.DYNAMIC)
      .description('🎨 OneBot 预报卡片封面展示模式。'),
    addOnebot163MusicCard: Schema.boolean()
      .experimental()
      .default(false)
      .description('🎵 是否在 OneBot 平台额外发送一张真正的光遇官方原声音乐卡片（支持在群聊内直接点击试听各星盘 BGM）。'),
    onebotMapMusicTable: Schema.array(Schema.object({
      map: Schema.union([
        Schema.const('prairie').description('云野'),
        Schema.const('forest').description('雨林'),
        Schema.const('valley').description('霞谷'),
        Schema.const('wasteland').description('暮土'),
        Schema.const('vault').description('禁阁'),
        Schema.const('default').description('默认'),
      ]).default('default').description('地图'),
      shardType: Schema.union([
        Schema.const('red').description('红石'),
        Schema.const('black').description('黑石'),
      ]).default('red').description('类型'),
      name: Schema.string().description('备注'),
      musicId: Schema.string().description('网易云ID'),
    }))
      .role('table')
      .default(DEFAULT_MAP_MUSIC_TABLE)
      .description('🎼 各大星盘地图与碎石类型（红/黑石）对应的网易云音乐曲库配置表格。'),
  }).description('💬 OneBotV11 的 qqbot 配置'),

  // ==================
  // 🐛 调试设置分组
  // ==================
  Schema.object({
    verboseConsoleLog: Schema.boolean()
      .default(false)
      .description('🐛 是否在控制台输出详细的参数解析、截图耗时、卡片 Payload 及封面直链 URL 等调试日志。<br><i>生产环境建议保持关闭，避免控制台刷屏。</i>'),
  }).description('🐛 调试设置 🔧'),
])
