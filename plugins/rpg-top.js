let handler = async (m, { conn, usedPrefix }) => {
  // Obtener todos los usuarios con datos cyberHunter
  const usersData = global.db.data.users
  
  // Filtrar solo usuarios con cyberHunter y procesar datos
  const players = Object.entries(usersData)
    .map(([jid, userData]) => {
      if (!userData.cyberHunter) return null
      
      return {
        jid,
        name: userData.name || `Usuario_${jid.split('@')[0].substring(0, 8)}`,
        rank: userData.cyberHunter.rank,
        level: userData.cyberHunter.level,
        cyberware: userData.cyberHunter.cyberware,
        reputation: userData.cyberHunter.reputation,
        missionsCompleted: userData.cyberHunter.missionsCompleted,
        credits: userData.credit || 0,
        totalPower: calculatePower(userData.cyberHunter)
      }
    })
    .filter(Boolean) // Eliminar nulls
  
  if (players.length === 0) {
    return m.reply('❌ No hay jugadores registrados en el sistema Cyber Hunter.')
  }
  
  // Calcular el poder total de cada jugador
  function calculatePower(cyberData) {
    const basePower = cyberData.level * 100
    const statPower = (cyberData.attack * 2) + (cyberData.defense * 1.5) + (cyberData.maxHp * 0.5)
    const missionPower = cyberData.missionsCompleted * 10
    const reputationPower = cyberData.reputation * 5
    
    return Math.floor(basePower + statPower + missionPower + reputationPower)
  }
  
  // Rankings por diferentes categorías
  const rankOrder = {
    "Novato": 1,
    "Operativo": 2,
    "Experto": 3,
    "Élite": 4,
    "Legendario": 5,
    "Mítico": 6
  }
  
  // TOP por Nivel
  const topByLevel = [...players]
    .sort((a, b) => b.level - a.level || b.cyberware - a.cyberware)
    .slice(0, 5)
  
  // TOP por Rango
  const topByRank = [...players]
    .sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank] || b.level - a.level)
    .slice(0, 5)
  
  // TOP por Créditos
  const topByCredits = [...players]
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 5)
  
  // TOP por Reputación
  const topByReputation = [...players]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 5)
  
  // TOP por Poder Total
  const topByPower = [...players]
    .sort((a, b) => b.totalPower - a.totalPower)
    .slice(0, 5)
  
  // Crear mensaje
  let message = []
  message.push(`🏆 *NEURAL NET LEADERBOARD* 🏆`)
  message.push(`📊 Sistema de Clasificación Cyberpunk`)
  message.push(`⏰ Actualizado: ${new Date().toLocaleString()}`)
  message.push(``)
  
  // TOP 5 POR NIVEL
  message.push(`🔝 *TOP 5 - NIVEL MÁXIMO*`)
  message.push(`⚡ Los cazadores más experimentados`)
  topByLevel.forEach((player, index) => {
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"]
    message.push(
      `${medals[index]} @${player.jid.split('@')[0]}\n` +
      `   🏅 ${player.rank} | 📈 Nivel ${player.level}\n` +
      `   ⚙️ ${player.cyberware} Cyberware | ✅ ${player.missionsCompleted} misiones`
    )
  })
  message.push(``)
  
  // TOP 5 POR RANGO
  message.push(`👑 *TOP 5 - RANGO SUPERIOR*`)
  message.push(`🎖️ Los cazadores de mayor prestigio`)
  topByRank.forEach((player, index) => {
    const medals = ["👑", "🥈", "🥉", "4️⃣", "5️⃣"]
    message.push(
      `${medals[index]} @${player.jid.split('@')[0]}\n` +
      `   ${player.rank} | Nivel ${player.level}\n` +
      `   ⭐ ${player.reputation} reputación`
    )
  })
  message.push(``)
  
  // TOP 5 POR CRÉDITOS
  message.push(`💰 *TOP 5 - MILLONES DIGITALES*`)
  message.push(`💳 Los cazadores más ricos`)
  topByCredits.forEach((player, index) => {
    const moneyEmojis = ["🤑", "💰", "💎", "💵", "💸"]
    const creditsFormatted = player.credits.toLocaleString()
    message.push(
      `${moneyEmojis[index]} @${player.jid.split('@')[0]}\n` +
      `   ${creditsFormatted} ⚡ créditos\n` +
      `   ${player.rank} | Nivel ${player.level}`
    )
  })
  message.push(``)
  
  // TOP 5 POR PODER
  message.push(`⚡ *TOP 5 - PODER DE SISTEMA*`)
  message.push(`💪 Los cazadores más poderosos`)
  topByPower.forEach((player, index) => {
    const powerEmojis = ["⚡", "💥", "🔥", "🌟", "✨"]
    message.push(
      `${powerEmojis[index]} @${player.jid.split('@')[0]}\n` +
      `   ⚡ ${player.totalPower.toLocaleString()} poder\n` +
      `   ${player.rank} | Nivel ${player.level}`
    )
  })
  message.push(``)
  
  // ESTADÍSTICAS GLOBALES
  const totalPlayers = players.length
  const avgLevel = Math.round(players.reduce((sum, p) => sum + p.level, 0) / totalPlayers)
  const avgCredits = Math.round(players.reduce((sum, p) => sum + p.credits, 0) / totalPlayers)
  const totalMissions = players.reduce((sum, p) => sum + p.missionsCompleted, 0)
  
  message.push(`📈 *ESTADÍSTICAS DEL SISTEMA*`)
  message.push(`👥 Cazadores activos: ${totalPlayers}`)
  message.push(`📊 Nivel promedio: ${avgLevel}`)
  message.push(`💰 Créditos promedio: ${avgCredits.toLocaleString()} ⚡`)
  message.push(`🎯 Misiones totales: ${totalMissions.toLocaleString()}`)
  message.push(``)
  
  // MENSAJE DE MOTIVACIÓN
  const motivationalQuotes = [
    "El sistema observa... mejora tu puntuación",
    "La red neural registra cada movimiento",
    "Sube en el ranking para mejores contratos",
    "El poder digital define tu lugar en Neo-Tokyo"
  ]
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  message.push(`💭 *${randomQuote}*`)
  message.push(``)
  
  // INSTRUCCIONES
  message.push(`🔧 *¿CÓMO SUBIR EN EL RANKING?*`)
  message.push(`• Usa ${usedPrefix}cazar regularmente`)
  message.push(`• Completa misiones exitosamente`)
  message.push(`• Gasta créditos en mejoras`)
  message.push(`• Mantén una racha de victorias`)
  
  // Enviar mensaje con menciones
  const mentionedJids = [
    ...topByLevel,
    ...topByRank,
    ...topByCredits,
    ...topByPower
  ].map(p => p.jid)
  
  await conn.sendMessage(
    m.chat,
    {
      text: message.join('\n'),
      mentions: mentionedJids
    },
    { quoted: m }
  )
}

// Función auxiliar para calcular posición
function getRankBadge(rank) {
  const badges = {
    "Novato": "🟢",
    "Operativo": "🔵",
    "Experto": "🟣",
    "Élite": "🟠",
    "Legendario": "🔴",
    "Mítico": "💎"
  }
  return badges[rank] || "⚫"
}

handler.help = ['best', 'top', 'ranking', 'leaderboard', 'mejores']
handler.tags = ['rpg', 'cyberpunk']
handler.command = /^(best|top|ranking|leaderboard|mejores|clasificación)$/i
handler.group = true
handler.register = false

export default handler