import { Session } from 'koishi'
import type { ShardCardMeta } from './card'
import { ONEBOT_CARD_PROTOCOL, OnebotCardProtocol } from './config'

export interface SendOnebotCardOptions {
  protocol?: OnebotCardProtocol
  musicId?: string
  logger?: any
  verbose?: boolean
}

/**
 * 📨 向 OneBot 平台发送碎片预报富文本交互卡片 (支持 163/qq/kugou/custom 协议)
 */
export async function sendOnebotCard(session: Session, meta: ShardCardMeta, options: SendOnebotCardOptions = {}): Promise<boolean> {
  const { protocol = ONEBOT_CARD_PROTOCOL.NETEASE, musicId, logger, verbose = false } = options
  const onebot = (session as any).onebot || (session as any).bot?.internal

  if (verbose) {
    logger?.info('🔍 [OneBot预报卡片] 检查环境: platform=%s session.onebot=%s bot.internal=%s guildId=%s channelId=%s userId=%s protocol=%s',
      session.platform,
      Boolean((session as any).onebot),
      Boolean((session as any).bot?.internal),
      session.guildId,
      session.channelId,
      session.userId,
      protocol)
  }

  if (!onebot || typeof onebot._request !== 'function') {
    if (verbose) {
      logger?.warn('⚠️ [OneBot预报卡片] 未找到可用的 OneBot _request 接口，跳过发送')
    }
    return false
  }

  let musicCard: any
  if (protocol === ONEBOT_CARD_PROTOCOL.CUSTOM) {
    musicCard = {
      type: 'music',
      data: {
        type: 'custom',
        url: meta.url,
        audio: meta.url,
        title: meta.title,
        image: meta.picUrl,
      },
    }
  } else {
    musicCard = {
      type: 'music',
      data: {
        type: protocol,
        id: Number(musicId) || musicId,
      },
    }
  }

  const groupId = session.guildId ? Number(session.guildId) || session.guildId : undefined
  const userId = (session.channelId || session.userId) ? Number(session.channelId || session.userId) || (session.channelId || session.userId) : undefined

  if (verbose) {
    logger?.info('🚀 [OneBot预报卡片] 准备发送: protocol=%s\n  ├─ 目标群: %s\n  ├─ 目标用户: %s\n  ├─ 封面大图直链: %s\n  └─ Payload: %j',
      protocol, groupId ?? '无', userId ?? '无', meta.picUrl, musicCard)
  }

  try {
    let res: any
    if (groupId) {
      res = await onebot._request('send_group_msg', { group_id: groupId, message: [musicCard] })
    } else if (userId) {
      res = await onebot._request('send_private_msg', { user_id: userId, message: [musicCard] })
    }

    const isSuccess = !res || (res.status !== 'failed' && (typeof res.retcode !== 'number' || res.retcode === 0))
    if (!isSuccess) {
      logger?.warn('❌ [OneBot预报卡片] 发送失败: %s (retcode: %s)', res?.message || res?.wording || '未知错误', res?.retcode)
      if (verbose) logger?.warn('❌ [OneBot预报卡片] 响应详情: %j', res)
      return false
    }

    if (verbose) logger?.info('✅ [OneBot预报卡片] 发送成功 (protocol=%s): %j', protocol, res)
    return true
  } catch (error: any) {
    logger?.warn('❌ [OneBot预报卡片] 发送异常: %s', error?.message || String(error))
    if (verbose) {
      logger?.warn('❌ [OneBot预报卡片] 异常详情: %j', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data || error?.response || error?.data,
      })
    }
    return false
  }
}

/**
 * 🎵 向 OneBot 平台发送纯净的光遇官方原声音乐听歌卡片
 */
export async function sendOnebot163MusicCard(session: Session, musicId: string, musicName: string, logger?: any, verbose = false): Promise<boolean> {
  const onebot = (session as any).onebot || (session as any).bot?.internal
  if (!onebot || typeof onebot._request !== 'function') return false

  const musicCard = {
    type: 'music',
    data: {
      type: '163',
      id: Number(musicId) || musicId,
    },
  }

  const groupId = session.guildId ? Number(session.guildId) || session.guildId : undefined
  const userId = (session.channelId || session.userId) ? Number(session.channelId || session.userId) || (session.channelId || session.userId) : undefined

  if (verbose) {
    logger?.info('🎵 [OneBot原声卡片] 准备发送听歌卡片: 歌曲=%s ID=%s 目标群=%s 目标用户=%s',
      musicName, musicId, groupId ?? '无', userId ?? '无')
  }

  try {
    let res: any
    if (groupId) {
      res = await onebot._request('send_group_msg', { group_id: groupId, message: [musicCard] })
    } else if (userId) {
      res = await onebot._request('send_private_msg', { user_id: userId, message: [musicCard] })
    }

    const isSuccess = !res || (res.status !== 'failed' && (typeof res.retcode !== 'number' || res.retcode === 0))
    if (!isSuccess) {
      logger?.warn('❌ [OneBot原声卡片] 发送失败: %s (retcode: %s)', res?.message || res?.wording || '未知错误', res?.retcode)
      return false
    }

    if (verbose) logger?.info('✅ [OneBot原声卡片] 发送成功: %j', res)
    return true
  } catch (error: any) {
    logger?.warn('❌ [OneBot原声卡片] 发送失败: %s', error?.message || String(error))
    return false
  }
}
