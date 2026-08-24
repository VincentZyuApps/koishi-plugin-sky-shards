import { Context } from 'koishi'
import { registerShardCommands } from './command'
import { Config } from './config'

export const name = 'sky-shards'
export const inject = ['puppeteer']

export { Config }
export { usage } from './usage'

export function apply(ctx: Context, config: Config) {
  registerShardCommands(ctx, config)
}
