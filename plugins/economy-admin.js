let handler = async (m, { conn, usedPrefix, command, args, mentionedJid }) => {
  // Verificar si es el dueño
  if (m.sender !== global.opts.owner) {
    return m.reply('❌ Este comando es solo para el dueño de Nagi Bot.')
  }
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Comando: .addcoins @usuario cantidad
  if (command === 'addcoins') {
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `💰 *AÑADIR COINS*\n\n` +
        `Uso: ${usedPrefix}addcoins @usuario <cantidad>\n` +
        `Ejemplo: ${usedPrefix}addcoins @usuario 1000`
      )
    }
    
    const targetJid = mentionedJid[0]
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    let targetUser = global.db.data.users[targetJid]
    if (!targetUser) {
      global.db.data.users[targetJid] = {}
      targetUser = global.db.data.users[targetJid]
    }
    
    if (!targetUser.economy) {
      targetUser.economy = {
        coins: 1000,
        bank: 0,
        bankLimit: 10000,
        lastDaily: 0,
        lastWork: 0,
        job: null,
        workLevel: 1,
        inventory: [],
        robberyCooldown: 0,
        inJail: false,
        jailTime: 0,
        robberySuccess: 0,
        robberyFails: 0,
        protected: false,
        protectionExpires: 0,
        transactions: [],
        dailyStreak: 0,
        totalEarned: 1000,
        totalSpent: 0
      }
    }
    
    targetUser.economy.coins += amount
    
    await m.reply(
      `✅ *COINS AÑADIDOS*\n\n` +
      `👤 Usuario: @${targetJid.split('@')[0]}\n` +
      `💰 Cantidad: ${formatNumber(amount)} coins\n` +
      `💳 Nuevo saldo: ${formatNumber(targetUser.economy.coins)} coins`
    )
    
    return
  }
  
  // Comando: .removecoins @usuario cantidad
  if (command === 'removecoins') {
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `💰 *REMOVER COINS*\n\n` +
        `Uso: ${usedPrefix}removecoins @usuario <cantidad>\n` +
        `Ejemplo: ${usedPrefix}removecoins @usuario 500`
      )
    }
    
    const targetJid = mentionedJid[0]
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    const targetUser = global.db.data.users[targetJid]
    
    if (!targetUser || !targetUser.economy) {
      return m.reply('❌ Este usuario no tiene cuenta económica.')
    }
    
    const actualAmount = Math.min(amount, targetUser.economy.coins)
    targetUser.economy.coins -= actualAmount
    
    await m.reply(
      `✅ *COINS REMOVIDOS*\n\n` +
      `👤 Usuario: @${targetJid.split('@')[0]}\n` +
      `💰 Cantidad: ${formatNumber(actualAmount)} coins\n` +
      `💳 Nuevo saldo: ${formatNumber(targetUser.economy.coins)} coins`
    )
    
    return
  }
  
  // Comando: .setbalance @usuario cantidad
  if (command === 'setbalance') {
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `💰 *ESTABLECER BALANCE*\n\n` +
        `Uso: ${usedPrefix}setbalance @usuario <cantidad>\n` +
        `Ejemplo: ${usedPrefix}setbalance @usuario 5000`
      )
    }
    
    const targetJid = mentionedJid[0]
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount < 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    let targetUser = global.db.data.users[targetJid]
    if (!targetUser) {
      global.db.data.users[targetJid] = {}
      targetUser = global.db.data.users[targetJid]
    }
    
    if (!targetUser.economy) {
      targetUser.economy = {
        nagi: 1000,
        bank: 50,
        bankLimit: 10000,
        lastDaily: 0,
        lastWork: 0,
        job: null,
        workLevel: 1,
        inventory: [],
        robberyCooldown: 0,
        inJail: false,
        jailTime: 60,
        robberySuccess: 0,
        robberyFails: 0,
        protected: false,
        protectionExpires: 0,
        transactions: [],
        dailyStreak: 0,
        totalEarned: 1000,
        totalSpent: 0
      }
    }
    
    targetUser.economy.coins = amount
    
    await m.reply(
      `✅ *BALANCE ESTABLECIDO*\n\n` +
      `👤 Usuario: @${targetJid.split('@')[0]}\n` +
      `💰 Nuevo balance: ${formatNumber(amount)} coins`
    )
    
    return
  }
  
  // Comando: .reseteco @usuario
  if (command === 'reseteco') {
    if (!mentionedJid || mentionedJid.length === 0) {
      return m.reply(
        `🔄 *RESETEAR ECONOMÍA*\n\n` +
        `Uso: ${usedPrefix}reseteco @usuario\n` +
        `Ejemplo: ${usedPrefix}reseteco @usuario`
      )
    }
    
    const targetJid = mentionedJid[0]
    const targetUser = global.db.data.users[targetJid]
    
    if (!targetUser) {
      return m.reply('❌ Este usuario no existe.')
    }
    
    // Resetear a valores iniciales
    targetUser.economy = {
      coins: 1000,
      bank: 0,
      bankLimit: 10000,
      lastDaily: 0,
      lastWork: 0,
      job: null,
      workLevel: 1,
      inventory: [],
      robberyCooldown: 0,
      inJail: false,
      jailTime: 0,
      robberySuccess: 0,
      robberyFails: 0,
      protected: false,
      protectionExpires: 0,
      transactions: [],
      dailyStreak: 0,
      totalEarned: 1000,
      totalSpent: 0
    }
    
    await m.reply(
      `✅ *ECONOMÍA RESETEADA*\n\n` +
      `👤 Usuario: @${targetJid.split('@')[0]}\n` +
      `🔄 Todos los datos económicos reiniciados.\n` +
      `💰 Saldo inicial: 1,000 coins`
    )
    
    return
  }
  
  // Comando: .ecoall cantidad
  if (command === 'ecoall') {
    if (!args[0]) {
      return m.reply(
        `💰 *DAR COINS A TODOS*\n\n` +
        `Uso: ${usedPrefix}ecoall <cantidad>\n` +
        `Ejemplo: ${usedPrefix}ecoall 500\n\n` +
        `⚠️ Dará la cantidad a TODOS los usuarios.`
      )
    }
    
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    if (amount > 100000) {
      return m.reply('❌ Cantidad muy alta. Máximo 100,000 por usuario.')
    }
    
    let usersAffected = 0
    
    Object.entries(global.db.data.users).forEach(([jid, userData]) => {
      if (userData.economy) {
        userData.economy.coins += amount
        usersAffected++
      }
    })
    
    await m.reply(
      `✅ *COINS REPARTIDOS*\n\n` +
      `💰 Cantidad por usuario: ${formatNumber(amount)} coins\n` +
      `👥 Usuarios afectados: ${usersAffected}\n` +
      `💰 Total repartido: ${formatNumber(amount * usersAffected)} coins`
    )
    
    return
  }
  
  // Comando: .liberar @usuario
  if (command === 'liberar') {
    if (!mentionedJid || mentionedJid.length === 0) {
      return m.reply(
        `🔓 *LIBERAR DE CÁRCEL*\n\n` +
        `Uso: ${usedPrefix}liberar @usuario\n` +
        `Ejemplo: ${usedPrefix}liberar @usuario`
      )
    }
    
    const targetJid = mentionedJid[0]
    const targetUser = global.db.data.users[targetJid]
    
    if (!targetUser || !targetUser.economy) {
      return m.reply('❌ Este usuario no tiene cuenta económica.')
    }
    
    if (!targetUser.economy.inJail) {
      return m.reply('❌ Este usuario no está en la cárcel.')
    }
    
    targetUser.economy.inJail = false
    targetUser.economy.jailTime = 0
    
    await m.reply(
      `✅ *USUARIO LIBERADO*\n\n` +
      `👤 Usuario: @${targetJid.split('@')[0]}\n` +
      `🔓 Ha sido liberado de la cárcel.\n` +
      `⚽ Se le ha perdonado la falta.`
    )
    
    return
  }
  
  // Si no reconoce el comando
  return m.reply(
    `👑 *COMANDOS ADMIN DE NAGI BOT*\n\n` +
    `💰 ${usedPrefix}addcoins @usuario <cantidad>\n` +
    `💰 ${usedPrefix}removecoins @usuario <cantidad>\n` +
    `💰 ${usedPrefix}setbalance @usuario <cantidad>\n` +
    `🔄 ${usedPrefix}reseteco @usuario\n` +
    `👥 ${usedPrefix}ecoall <cantidad>\n` +
    `🔓 ${usedPrefix}liberar @usuario\n\n` +
    `⚽ Solo el dueño puede usar estos comandos.`
  )
}

handler.help = ['addcoins', 'removecoins', 'setbalance', 'reseteco', 'ecoall', 'liberar']
handler.tags = ['owner']
handler.command = /^(addcoins|removecoins|setbalance|reseteco|ecoall|liberar)$/i
handler.group = true
handler.register = false // Solo dueño, no necesita registro

export default handler
