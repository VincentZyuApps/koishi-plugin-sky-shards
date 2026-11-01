import assert from 'node:assert/strict'
import test from 'node:test'
import { buildShardCardMeta, resolveCoverUrl, resolveMapMusic, SHARD_MAP_COVERS } from '../src/card'
import { COVER_MODE } from '../src/config'
import { getShardStatus } from '../src/shard'

test('封面匹配模式：动态模式根据地图 ID 返回对应地图大图，无碎片或固定模式返回默认图', () => {
  // 云野地图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'prairie.butterfly', true), SHARD_MAP_COVERS.prairie)
  // 雨林地图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'forest.brook', true), SHARD_MAP_COVERS.forest)
  // 霞谷地图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'valley.rink', true), SHARD_MAP_COVERS.valley)
  // 暮土地图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'wasteland.temple', true), SHARD_MAP_COVERS.wasteland)
  // 禁阁地图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'vault.starlight', true), SHARD_MAP_COVERS.vault)

  // 无碎片时回退到默认图
  assert.equal(resolveCoverUrl(COVER_MODE.DYNAMIC, undefined, 'prairie.butterfly', false), SHARD_MAP_COVERS.default)
  // 固定模式即使有地图也返回默认图
  assert.equal(resolveCoverUrl(COVER_MODE.FIXED, undefined, 'prairie.butterfly', true), SHARD_MAP_COVERS.default)
})

test('组装卡片元数据：标题与描述在长度限制内，且正确携带排期与外链', () => {
  const date = { year: 2026, month: 8, day: 23 }
  const status = getShardStatus(date, 'netease_cn', new Date('2026-08-22T23:30:00.000Z'))
  const meta = buildShardCardMeta({
    date,
    server: 'netease_cn',
    label: '国服碎片',
    pageUrl: 'https://sky-shards-vincentzyu233-fork.pages.dev/?date=2026-08-23',
    status,
    coverMode: COVER_MODE.DYNAMIC,
  })

  assert.ok(meta.title.length <= 50, '标题长度应 <= 50')
  assert.ok(meta.description.length <= 200, '描述长度应 <= 200')
  assert.match(meta.title, /🔮 光遇国服碎片预报 \(08-23\)/)
  assert.match(meta.description, /📅 日期：2026-08-23/)
  assert.match(meta.description, /降落区域：云野 · 圣岛群岛/)
  assert.equal(meta.picUrl, SHARD_MAP_COVERS.prairie)
  assert.equal(meta.url, 'https://sky-shards-vincentzyu233-fork.pages.dev/?date=2026-08-23')
})

test('地图原声音乐匹配：根据星盘地图和红黑石类型匹配对应网易云 ID，无碎片或未知地图回退到默认主题曲', () => {
  // 红石匹配测试
  assert.equal(resolveMapMusic(undefined, 'prairie.butterfly', true, true).musicId, '1464399274')
  assert.equal(resolveMapMusic(undefined, 'forest.brook', true, true).musicId, '1464397575')
  assert.equal(resolveMapMusic(undefined, 'valley.rink', true, true).musicId, '1464399270')
  assert.equal(resolveMapMusic(undefined, 'wasteland.temple', true, true).musicId, '1464399264')
  assert.equal(resolveMapMusic(undefined, 'vault.starlight', true, true).musicId, '1859515946')

  // 黑石匹配测试
  assert.equal(resolveMapMusic(undefined, 'prairie.butterfly', true, false).musicId, '1464399266')
  assert.equal(resolveMapMusic(undefined, 'forest.brook', true, false).musicId, '1464399265')
  assert.equal(resolveMapMusic(undefined, 'valley.rink', true, false).musicId, '1464399272')
  assert.equal(resolveMapMusic(undefined, 'wasteland.temple', true, false).musicId, '1977950598')
  assert.equal(resolveMapMusic(undefined, 'vault.starlight', true, false).musicId, '1464399270')

  // 无碎片时回退到对应 shardType 的 default
  assert.equal(resolveMapMusic(undefined, 'prairie.butterfly', false, true).musicId, '1464399264')
  assert.equal(resolveMapMusic(undefined, 'prairie.butterfly', false, false).musicId, '1464399274')
  // 未知地图回退到对应 shardType 的 default
  assert.equal(resolveMapMusic(undefined, 'unknown.map', true, false).musicId, '1464399274')
})
