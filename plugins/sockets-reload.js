// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Ritual de Renovación Espiritual - Código de la Casa Waguri
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺

import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`🌸 *Este ritual solo puede ser realizado por los guardianes del jardín.*`)

    const rawId = conn.user?.id || ''
    const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]
    const sessionPath = path.join(global.jadi, cleanId)
    if (!fs.existsSync(sessionPath)) return conn.reply(m.chat, '*👑 Este ritual solo está disponible para esencias secundarias.*', m, rcanal)
    await m.react('🕒')
    if (typeof global.reloadHandler !== 'function')
      throw new Error('No se encontró el hechizo de renovación espiritual')
    await global.reloadHandler(true)
    await m.react('✔️')
    conn.reply(m.chat, '🌺 *La esencia ha sido renovada con éxito.*\n\nEl flujo mágico se ha restablecido perfectamente.', m, rcanal)
  } catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `🍂 *El ritual de renovación ha fallado*\n\n${error.message || error}`, m, rcanal)
  }
}

handler.command = ['reload']
handler.help = ['reload']
handler.tags = ['socket']

export default handler

// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺
//   Que la energía fluya renovada y pura
// ༻✦༺ ༻✧༺ ༻✦༺ ༻⸙͎۪۫༺ ༻✦༺ ༻✧༺ ༻✦༺