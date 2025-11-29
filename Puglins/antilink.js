const handler = async (m, { conn, usedPrefix, command, args, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  // Estado por defecto: activado si no existe
  let isAntiLink = chat && typeof chat.antienlace !== 'undefined' ? chat.antienlace : true

  // Comando para activar/desactivar antienlace (solo admins/owner)
  if (['antienlace', 'antilink'].includes(command)) {
    if (!(isAdmin || isOwner)) {
      return conn.reply(m.chat, '🤨 Solo los administradores pueden activar o desactivar el antienlace.', m, rcanal)
    }
    if (args[0] === 'on' || args[0] === 'enable') {
      if (isAntiLink) return conn.reply(m.chat, `💜 La función *${command}* ya estaba *activada*.`, m, rcanal)
      isAntiLink = true
    } else if (args[0] === 'off' || args[0] === 'disable') {
      if (!isAntiLink) return conn.reply(m.chat, `👑 La función *${command}* ya estaba *desactivada*.`, m, rcanal)
      isAntiLink = false
    } else {
      return conn.reply(
        m.chat,
        `👑 Los admins pueden activar o desactivar la función *${command}* utilizando:\n\n💜 *${command}* enable\n💜 *${command}* disable\n\n🛠 Estado actual » *${isEnable ? '✓ Activada' : '✗ Desactivada'}*`,
        m, rcanal
      )
    }
    chat.antienlace = isAntiLink
    return conn.reply(m.chat, `👑 La función *${command}* fue *${isAntiLink ? 'activada' : 'desactivada'}* para este grupo.`, m, rcanal)
  }
}

// Detectar enlaces y eliminar mensaje si antienlace está activado
export async function detectLink(conn, m) {
  const chat = global.db.data.chats[m.chat]
  const isAntiLink = chat && typeof chat.antienlace !== 'undefined' ? chat.antienlace : true

  // Si no está activado o es admin/owner, ignorar
  if (!isAntiLink) return
  if (m.isGroup && (m.isAdmin || m.isOwner)) return

  // Si el mensaje contiene un enlace
  if (linkRegex.test(m.text)) {
    // Responder primero
    await conn.sendMessage(m.chat, { text: '🤨 No envíes enlace si no quieres que te eliminé.' }, { quoted: m })
    // Borrar el mensaje original
    await conn.sendMessage(m.chat, {
      delete: m.key
    })
  }
}

handler.help = ['antienlace', 'antilink']
handler.tags = ['group']
handler.command = ['antienlace', 'antilink']
handler.group = true

export default handler