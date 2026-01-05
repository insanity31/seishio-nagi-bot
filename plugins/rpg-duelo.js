let handler = async (m, { conn, mentionedJid }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  if (user.cyberHunter.hp <= 0) {
    return m.reply('❤️ Tu HP está en 0. Usa /taller para repararte primero.')
  }
  
  // Verificar si mencionaron a alguien
  if (!mentionedJid || mentionedJid.length === 0) {
    return m.reply('📌 Debes mencionar a quien quieres desafiar\nEjemplo: /duelo @usuario')
  }
  
  const opponentJid = mentionedJid[0]
  const opponent = global.db.data.users[opponentJid]
  
  if (!opponent || !opponent.cyberHunter) {
    return m.reply('❌ El usuario mencionado no tiene perfil de cazador.')
  }
  
  if (opponent.cyberHunter.hp <= 0) {
    return m.reply('❌ El oponente está incapacitado (HP = 0)')
  }
  
  if (opponentJid === m.sender) {
    return m.reply('❌ No puedes duelar contra ti mismo.')
  }
  
  // Crear registro de duelo
  const duelId = `${m.sender}_${opponentJid}_${Date.now()}`
  
  let duelMessage = []
  duelMessage.push(`⚔️ *DESAFÍO DE DUELO CYBER* ⚔️`)
  duelMessage.push(`🎯 ${conn.getName(m.sender)} desafía a ${conn.getName(opponentJid)}`)
  duelMessage.push(``)
  duelMessage.push(`👤 *RETADOR:*`)
  duelMessage.push(`🏅 ${user.cyberHunter.rank} Nivel ${user.cyberHunter.level}`)
  duelMessage.push(`❤️ HP: ${user.cyberHunter.hp}/${user.cyberHunter.maxHp}`)
  duelMessage.push(`⚔️ ATK: ${user.cyberHunter.attack} | 🛡️ DEF: ${user.cyberHunter.defense}`)
  duelMessage.push(``)
  duelMessage.push(`👤 *OPONENTE:*`)
  duelMessage.push(`🏅 ${opponent.cyberHunter.rank} Nivel ${opponent.cyberHunter.level}`)
  duelMessage.push(`❤️ HP: ${opponent.cyberHunter.hp}/${opponent.cyberHunter.maxHp}`)
  duelMessage.push(`⚔️ ATK: ${opponent.cyberHunter.attack} | 🛡️ DEF: ${opponent.cyberHunter.defense}`)
  duelMessage.push(``)
  
  // Simular combate
  let playerHP = user.cyberHunter.hp
  let opponentHP = opponent.cyberHunter.hp
  let round = 1
  
  duelMessage.push(`🥊 *INICIA EL COMBATE* 🥊`)
  
  while (playerHP > 0 && opponentHP > 0 && round <= 6) {
    duelMessage.push(``)
    duelMessage.push(`🔸 *Ronda ${round}*`)
    
    // Turno del jugador
    let playerDamage = user.cyberHunter.attack + Math.floor(Math.random() * 15) - 5
    playerDamage = Math.max(1, playerDamage - opponent.cyberHunter.defense * 0.3)
    opponentHP -= playerDamage
    
    duelMessage.push(`🗡️ ${conn.getName(m.sender)} ataca: ${Math.floor(playerDamage)} daño`)
    duelMessage.push(`❤️ ${conn.getName(opponentJid)}: ${Math.max(0, opponentHP)} HP`)
    
    if (opponentHP <= 0) break
    
    // Turno del oponente
    let opponentDamage = opponent.cyberHunter.attack + Math.floor(Math.random() * 15) - 5
    opponentDamage = Math.max(1, opponentDamage - user.cyberHunter.defense * 0.3)
    playerHP -= opponentDamage
    
    duelMessage.push(`🗡️ ${conn.getName(opponentJid)} contraataca: ${Math.floor(opponentDamage)} daño`)
    duelMessage.push(`❤️ ${conn.getName(m.sender)}: ${Math.max(0, playerHP)} HP`)
    
    round++
  }
  
  duelMessage.push(``)
  
  // Determinar ganador
  if (playerHP > 0 && opponentHP <= 0) {
    // Jugador gana
    const reward = 100 + (user.cyberHunter.level * 10)
    user.credit = (user.credit || 0) + reward
    user.cyberHunter.reputation += 5
    user.cyberHunter.hp = playerHP
    
    opponent.cyberHunter.hp = 0
    
    duelMessage.push(`🎉 *VICTORIA DE ${conn.getName(m.sender).toUpperCase()}* 🎉`)
    duelMessage.push(`💰 Recompensa: ${reward} créditos`)
    duelMessage.push(`🌟 +5 reputación`)
    
  } else if (opponentHP > 0 && playerHP <= 0) {
    // Oponente gana
    const reward = 100 + (opponent.cyberHunter.level * 10)
    opponent.credit = (opponent.credit || 0) + reward
    opponent.cyberHunter.reputation += 5
    opponent.cyberHunter.hp = opponentHP
    
    user.cyberHunter.hp = 0
    
    duelMessage.push(`🎉 *VICTORIA DE ${conn.getName(opponentJid).toUpperCase()}* 🎉`)
    duelMessage.push(`💰 Recompensa: ${reward} créditos`)
    duelMessage.push(`🌟 +5 reputación`)
    
  } else {
    // Empate
    user.cyberHunter.hp = Math.max(1, playerHP)
    opponent.cyberHunter.hp = Math.max(1, opponentHP)
    
    duelMessage.push(`🤝 *EMPATE* 🤝`)
    duelMessage.push(`⚡ Ambos combatientes quedan exhaustos`)
  }
  
  duelMessage.push(``)
  duelMessage.push(`📊 *RESULTADO FINAL:*`)
  duelMessage.push(`${conn.getName(m.sender)}: ${user.cyberHunter.hp}/${user.cyberHunter.maxHp} HP`)
  duelMessage.push(`${conn.getName(opponentJid)}: ${opponent.cyberHunter.hp}/${opponent.cyberHunter.maxHp} HP`)
  
  await conn.sendMessage(m.chat, {
    text: duelMessage.join('\n'),
    mentions: [m.sender, opponentJid]
  }, { quoted: m })
}

handler.help = ['duelo', 'duel', 'pvp', 'challenge']
handler.tags = ['rpg']
handler.command = /^(duelo|duel|pvp|challenge|desaf[ií]o)$/i
handler.group = true
handler.register = true

export default handler