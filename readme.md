# koishi-plugin-sky-shards

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VincentZyuApps/koishi-plugin-sky-shards)

[![Sky Shards Source](https://img.shields.io/badge/Sky%20Shards%20Source-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/VincentZyu233/sky-shards)

查询《光·遇》国服与国际服碎片，并将 [Sky Shards](https://github.com/VincentZyu233/sky-shards) 的首屏摘要渲染为图片。

## 前置条件

- 安装并启用提供 `puppeteer` 服务的插件，例如 `koishi-plugin-puppeteer` 或 `@shangxueink/koishi-plugin-puppeteer-without-canvas`。
- Sky Shards 默认使用 Cloudflare Pages，也可以在 `url` 中填写反代地址或本地 `pnpm dev` 地址，例如 `http://127.0.0.1:5173/`。

## 使用方法

```text
国服碎片
国际服碎片 +1
国服碎片 20260824
```

日期参数留空时查询对应服务器时区的今天。它只接受严格的 `yyyymmdd`、`+N` 与 `-N`；偏移按对应服务器的自然日计算。

QQ 官方 Bot 会在截图与直达链接后，额外发送 Markdown 摘要和三行快捷按钮：左列为国际服的今日、明日、后日，右列为国服的对应日期。

## 代理与 isolate

`browserProxyMode` 是三态单选，默认 `disabled`（不使用代理）。选择 `inherit` 时会读取当前 Koishi 上下文的 `http.proxyAgent`，可与 `koishi-plugin-isolate` 一起使用；选择 `configured` 时仅使用 `browserProxyUrl`，默认地址为 `http://127.0.0.1:7890`，不会继承 isolate/http 代理。

将本插件和已禁用的同组插件放到启用的 `isolate` 分组内，并在该分组设置代理即可：

```yaml
group:proxy:
  isolate:example:
    proxyAgent: socks5://127.0.0.1:7890
  ~sky-shards:example: {}
```

截图时会为本次请求创建独立 Chromium BrowserContext，完成后立即关闭，不会改变其他 Puppeteer 插件的网络出口。

## 配置项

### 消息发送配置

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enableQuote` | `boolean` | `true` | bot 发送等待提示、截图结果和错误消息时，是否引用触发指令的消息 |
| `enableWaitingHint` | `boolean` | `true` | 是否显示“正在获取并生成碎片信息，请稍候”提示；任务结束后会自动尝试撤回 |

### 指令配置

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `cnCommandName` | `string` | `"国服碎片"` | 国服碎片主指令名称 |
| `cnCommandAliases` | `string[]` | `[“今日国服碎片”, “国服今日碎片”, “光遇国服碎片”, “sky-cn-shards”]` | 国服碎片别名表格；空白、重复和与主指令同名的项会忽略 |
| `globalCommandName` | `string` | `"国际服碎片"` | 国际服碎片主指令名称 |
| `globalCommandAliases` | `string[]` | `[“今日国际服碎片”, “国际服今日碎片”, “光遇国际服碎片”, “sky-global-shards”]` | 国际服碎片别名表格；空白、重复和与主指令同名的项会忽略 |

### Sky Shards 页面与截图配置

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `url` | `string` | `"https://sky-shards-vincentzyu233-fork.pages.dev/"` | Sky Shards 站点根 URL；支持 Cloudflare Pages、反代或本地 Vite 地址 |
| `displayTimeZone` | `string` | `"Asia/Shanghai"` | 截图中显示本地时间使用的 IANA 时区 |
| `enableGlobalShardOverrides` | `boolean` | `false` | 🧪 是否读取上游前端国际服临时覆写数据；国服不会读取覆写 |
| `enableShardProgressTimeline` | `boolean` | `true` | 是否显示 Sky Shards 的碎片时间轴和进度条；关闭后改为紧凑的三波时间摘要 |
| `screenshotDelayMs` | `number` | `666` | 截图前额外等待时间，单位毫秒；可用于等待网页动画和延迟加载内容完成 |

### 浏览器网络配置

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `browserProxyMode` | `"disabled" \| "inherit" \| "configured"` | `"disabled"` | 截图浏览器代理模式：`disabled` 不使用代理；`inherit` 继承当前 isolate/http 的 `proxyAgent`；`configured` 仅使用 `browserProxyUrl` |
| `browserProxyUrl` | `string` | `"http://127.0.0.1:7890"` | 配置项代理地址，仅 `browserProxyMode="configured"` 时生效 |

### QQ 官方 Bot 配置

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enableQQMarkdown` | `boolean` | `true` | QQ 官方 Bot 在截图后额外发送 Markdown 摘要和快捷按钮 |
| `qqMarkdownKeyboardJson` | `string` | 默认按钮 JSON | 自定义 QQ Markdown 按钮；支持 `${commandName}`、`${cnCommandName}`、`${globalCommandName}` 和 `${pageUrl}` 变量；JSON 无效时回退默认按钮 |
