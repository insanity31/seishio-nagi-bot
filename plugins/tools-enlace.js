var handler = async (m, { conn, args }) => {
    let communityLink = 'https://chat.whatsapp.com/EFUkB3vLyAzAc4ZQzLabsp'
    let channelLink = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
    
    let message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                 `🔗 *ENLACES DE LA COMUNIDAD*\n\n` +
                 `📱 *Grupo de WhatsApp:*\n` +
                 `> \`Link:\` ${communityLink}\n\n` +
                 `📢 *Canal Oficial:*\n` +
                 `> \`Link:\` ${channelLink}\n\n` +
                 `*¡Únete a nuestras comunidades!* 🎉`
    
    await conn.sendMessage(m.chat, { text: message, quoted: m })
}

handler.help = ['links']
handler.tags = ['grupo']
handler.command = ['links', 'link', 'grupo', 'canal']
handler.group = true
handler.botAdmin = false

export default handler