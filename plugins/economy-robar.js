let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (args[0] || '')
  
  // Inicializar sistema de economía si no existe
  if (!user.economy) {
    user.economy = {
      waguri: 1000, // Saldo inicial
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      job: null,
      inventory: [],
      robberyCooldown: 0,
      inJail: false,
      jailTime: 0,
      robberySuccess: 0,
      robberyFails: 0,
      protected: false,
      protectionExpires: 0
    }
  }
  
  // Función para formatear números
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // COMANDO: .robar @usuario
  if (command === 'robar') {
    // Verificar si el usuario está en la cárcel
    if (user.economy.inJail) {
      const timeLeft = Math.ceil((user.economy.jailTime - Date.now()) / 60000)
      return m.reply(
        `🚨 *ESTÁS EN LA CÁRCEL*\n\n` +
        `🔒 No puedes robar mientras estés detenido.\n` +
        `⏰ Tiempo restante: ${timeLeft} minutos\n` +
        `💰 Usa *${usedPrefix}fianza <cantidad>* para pagar tu fianza`
      )
    }
    
    // Verificar si está protegido
    if (user.economy.protected && user.economy.protectionExpires > Date.now()) {
      const hoursLeft = Math.ceil((user.economy.protectionExpires - Date.now()) / 3600000)
      return m.reply(
        `🛡️ *PROTECCIÓN ACTIVA*\n\n` +
        `No puedes robar mientras tengas protección activa.\n` +
        `⏳ Protección expira en: ${hoursLeft} horas`
      )
    }
    
    // Verificar cooldown de robo (30 minutos)
    if (user.economy.robberyCooldown > Date.now()) {
      const minutesLeft = Math.ceil((user.economy.robberyCooldown - Date.now()) / 60000)
      return m.reply(
        `⏰ *ENFRIAMIENTO DE ROBO*\n\n` +
        `Debes esperar ${minutesLeft} minutos\n` +
        `antes de intentar otro robo.`
      )
    }
    
    // Verificar si se mencionó a alguien
    if (!target || !target.includes('@')) {
      return m.reply(
        `🎯 *USO CORRECTO:*\n\n` +
        `${usedPrefix}robar @usuario\n\n` +
        `📌 *Ejemplo:*\n` +
        `${usedPrefix}robar @amigo`
      )
    }
    
    // No puede robarse a sí mismo
    if (target === m.sender) {
      return m.reply('❌ No puedes robarte a ti mismo.')
    }
    
    const targetUser = global.db.data.users[target]
    
    // Verificar si el usuario objetivo existe
    if (!targetUser || !targetUser.economy) {
      return m.reply('❌ Usuario no encontrado en la base de datos.')
    }
    
    // Verificar si el objetivo está en la cárcel
    if (targetUser.economy.inJail) {
      return m.reply('❌ Este usuario está en la cárcel, no tiene nada que robar.')
    }
    
    // Verificar si el objetivo tiene protección
    if (targetUser.economy.protected && targetUser.economy.protectionExpires > Date.now()) {
      user.economy.robberyCooldown = Date.now() + (30 * 60 * 1000) // 30 minutos cooldown
      
      // El objetivo tiene alarma
      if (Math.random() < 0.3) { // 30% chance de que suene la alarma
        user.economy.inJail = true
        user.economy.jailTime = Date.now() + (60 * 60 * 1000) // 1 hora en cárcel
        
        // Notificar al objetivo
        try {
          await conn.sendMessage(target, {
            text: `🚨 *¡ALARMA ACTIVADA!*\n\n@${m.sender.split('@')[0]} intentó robarte pero activó tu alarma.\n🔒 Ha sido enviado a la cárcel por 1 hora.`,
            mentions: [m.sender]
          })
        } catch (e) {}
        
        return m.reply(
          `🚨 *¡ALARMA ACTIVADA!*\n\n` +
          `El usuario tenía protección activa.\n` +
          `🔒 Has sido enviado a la cárcel por 1 hora.\n` +
          `💰 Usa *${usedPrefix}fianza* para salir antes.`
        )
      }
      
      return m.reply(
        `🛡️ *ROBO FALLIDO*\n\n` +
        `El usuario tiene protección activa.\n` +
        `No pudiste robar nada.\n` +
        `⏰ Espera 30 minutos para intentar de nuevo.`
      )
    }
    
    // Verificar si el objetivo tiene suficiente dinero
    if (targetUser.economy.waguri < 100) {
      return m.reply('❌ Este usuario es demasiado pobre para robarle.')
    }
    
    // Calcular probabilidades de éxito
    const baseSuccessRate = 0.6 // 60% base
    const successRate = Math.min(0.9, baseSuccessRate + (user.economy.robberySuccess * 0.05))
    
    const isSuccess = Math.random() < successRate
    
    // Calcular cantidad a robar (10-30% del saldo del objetivo)
    const maxSteal = Math.floor(targetUser.economy.waguri * 0.3)
    const minSteal = Math.floor(targetUser.economy.waguri * 0.1)
    const stolenAmount = Math.floor(Math.random() * (maxSteal - minSteal + 1)) + minSteal
    
    user.economy.robberyCooldown = Date.now() + (30 * 60 * 1000) // 30 minutos cooldown
    
    if (isSuccess) {
      // ROBO EXITOSO
      user.economy.waguri += stolenAmount
      targetUser.economy.waguri -= stolenAmount
      user.economy.robberySuccess += 1
      
      // Posibilidad de que el objetivo te reporte (10%)
      if (Math.random() < 0.1) {
        user.economy.inJail = true
        user.economy.jailTime = Date.now() + (30 * 60 * 1000) // 30 minutos en cárcel
        
        // Notificar al objetivo
        try {
          await conn.sendMessage(target, {
            text: `🚔 *TE HAN ROBADO*\n\n@${m.sender.split('@')[0]} te robó ${formatNumber(stolenAmount)} Waguri Coins.\n🔒 Ha sido reportado y enviado a la cárcel.`,
            mentions: [m.sender]
          })
        } catch (e) {}
        
        return m.reply(
          `💰 *¡ROBO EXITOSO PERO...!*\n\n` +
          `Robaste: ${formatNumber(stolenAmount)} Waguri Coins\n` +
          `💳 Tu saldo: ${formatNumber(user.economy.waguri)}\n\n` +
          `🚔 *PERO TE REPORTARON*\n` +
          `🔒 Has sido enviado a la cárcel por 30 minutos.\n` +
          `💰 Usa *${usedPrefix}fianza* para salir antes.`
        )
      }
      
      // Notificar al objetivo (sin reportar)
      try {
        await conn.sendMessage(target, {
          text: `💸 *TE HAN ROBADO*\n\n@${m.sender.split('@')[0]} te robó ${formatNumber(stolenAmount)} Waguri Coins.\nTu nuevo saldo: ${formatNumber(targetUser.economy.waguri)}`,
          mentions: [m.sender]
        })
      } catch (e) {}
      
      return m.reply(
        `💰 *¡ROBO EXITOSO!*\n\n` +
        `Robaste: ${formatNumber(stolenAmount)} Waguri Coins\n` +
        `💳 Tu saldo: ${formatNumber(user.economy.waguri)}\n` +
        `🎯 Éxitos consecutivos: ${user.economy.robberySuccess}\n\n` +
        `⏰ Siguiente robo en 30 minutos.\n` +
        `⚠️ Cuidado: pueden reportarte.`
      )
      
    } else {
      // ROBO FALLIDO
      user.economy.robberyFails += 1
      
      // Multa por intento fallido (5% del saldo del ladrón, mínimo 50)
      const fine = Math.max(50, Math.floor(user.economy.waguri * 0.05))
      user.economy.waguri -= fine
      
      // Posibilidad de ir a la cárcel (40% si falla)
      if (Math.random() < 0.4) {
        user.economy.inJail = true
        user.economy.jailTime = Date.now() + (45 * 60 * 1000) // 45 minutos en cárcel
        
        return m.reply(
          `❌ *ROBO FALLIDO Y ATTRAPADO!*\n\n` +
          `Te atraparon en el acto.\n` +
          `💰 Multa: ${formatNumber(fine)} Waguri Coins\n` +
          `💳 Tu saldo: ${formatNumber(user.economy.waguri)}\n\n` +
          `🔒 Has sido enviado a la cárcel por 45 minutos.\n` +
          `💰 Usa *${usedPrefix}fianza* para salir antes.`
        )
      }
      
      return m.reply(
        `❌ *ROBO FALLIDO*\n\n` +
        `No pudiste completar el robo.\n` +
        `💰 Multa: ${formatNumber(fine)} Waguri Coins\n` +
        `💳 Tu saldo: ${formatNumber(user.economy.waguri)}\n` +
        `❌ Fallos consecutivos: ${user.economy.robberyFails}\n\n` +
        `⏰ Siguiente intento en 30 minutos.`
      )
    }
  }
  
  // COMANDO: .proteger
  if (command === 'proteger') {
    const protectionCost = 500
    const protectionHours = 24
    
    if (user.economy.protected && user.economy.protectionExpires > Date.now()) {
      const hoursLeft = Math.ceil((user.economy.protectionExpires - Date.now()) / 3600000)
      return m.reply(
        `🛡️ *YA TIENES PROTECCIÓN*\n\n` +
        `Protección activa por ${hoursLeft} horas más.\n` +
        `💰 La protección evita robos y hackeos.`
      )
    }
    
    if (user.economy.waguri < protectionCost) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Costo de protección: ${formatNumber(protectionCost)} Waguri Coins\n` +
        `Tu saldo: ${formatNumber(user.economy.waguri)}\n` +
        `⏳ Duración: 24 horas`
      )
    }
    
    user.economy.waguri -= protectionCost
    user.economy.protected = true
    user.economy.protectionExpires = Date.now() + (protectionHours * 60 * 60 * 1000)
    
    return m.reply(
      `🛡️ *PROTECCIÓN ACTIVADA*\n\n` +
      `Has comprado protección antirrobos.\n` +
      `💰 Costo: ${formatNumber(protectionCost)} Waguri Coins\n` +
      `⏳ Duración: 24 horas\n` +
      `🎯 Efecto: Los robos contra ti fallarán y pueden enviar al ladrón a la cárcel.\n\n` +
      `💳 Tu saldo: ${formatNumber(user.economy.waguri)}`
    )
  }
  
  // COMANDO: .caja_fuerte
  if (command === 'caja_fuerte' || command === 'caja') {
    const safeCost = 2000
    
    if (user.economy.inventory && user.economy.inventory.includes('caja_fuerte')) {
      return m.reply(
        `🔒 *YA TIENES CAJA FUERTE*\n\n` +
        `Tu caja fuerte está activa.\n` +
        `💰 Puedes almacenar hasta 10,000 Waguri Coins\n` +
        `🔐 Usa *${usedPrefix}depositar* para guardar dinero.`
      )
    }
    
    if (user.economy.waguri < safeCost) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Costo caja fuerte: ${formatNumber(safeCost)} Waguri Coins\n` +
        `Tu saldo: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    user.economy.waguri -= safeCost
    
    if (!user.economy.inventory) user.economy.inventory = []
    user.economy.inventory.push('caja_fuerte')
    user.economy.safeBalance = 0
    
    return m.reply(
      `🔒 *CAJA FUERTE COMPRADA*\n\n` +
      `Has comprado una caja fuerte segura.\n` +
      `💰 Costo: ${formatNumber(safeCost)} Waguri Coins\n` +
      `🎯 Capacidad: 10,000 Waguri Coins\n\n` +
      `📌 *Comandos disponibles:*\n` +
      `• ${usedPrefix}depositar <cantidad> - Guardar en caja fuerte\n` +
      `• ${usedPrefix}retirar <cantidad> - Retirar de caja fuerte\n` +
      `• ${usedPrefix}safebalance - Ver saldo en caja fuerte\n\n` +
      `💡 Los ladrones no pueden robar dinero de tu caja fuerte.`
    )
  }
  
  // COMANDO: .carcel
  if (command === 'carcel') {
    const users = global.db.data.users
    const jailedUsers = []
    
    for (const [jid, userData] of Object.entries(users)) {
      if (userData.economy && userData.economy.inJail) {
        const timeLeft = Math.ceil((userData.economy.jailTime - Date.now()) / 60000)
        if (timeLeft > 0) {
          const name = conn.getName(jid) || jid.split('@')[0]
          jailedUsers.push({
            jid,
            name,
            timeLeft
          })
        }
      }
    }
    
    if (jailedUsers.length === 0) {
      return m.reply(
        `🏛️ *CÁRCEL VACÍA*\n\n` +
        `No hay usuarios en la cárcel actualmente.\n` +
        `🚔 Todos los ciudadanos están libres.`
      )
    }
    
    let jailMessage = `🏛️ *USUARIOS EN LA CÁRCEL*\n\n`
    
    jailedUsers.forEach((user, index) => {
      jailMessage += `🔒 ${index + 1}. @${user.jid.split('@')[0]}\n`
      jailMessage += `   👤 ${user.name}\n`
      jailMessage += `   ⏰ Tiempo restante: ${user.timeLeft} minutos\n\n`
    })
    
    jailMessage += `💰 Para pagar fianza usa: ${usedPrefix}fianza <cantidad>`
    
    await conn.sendMessage(m.chat, {
      text: jailMessage,
      mentions: jailedUsers.map(u => u.jid)
    }, { quoted: m })
  }
  
  // COMANDO: .fianza <cantidad>
  if (command === 'fianza') {
    if (!user.economy.inJail) {
      return m.reply('❌ No estás en la cárcel.')
    }
    
    const timeLeft = Math.ceil((user.economy.jailTime - Date.now()) / 60000)
    const bailAmount = Math.min(1000, Math.max(100, Math.floor(timeLeft * 10)))
    
    if (!args[0]) {
      return m.reply(
        `💰 *PAGO DE FIANZA*\n\n` +
        `⏰ Tiempo en cárcel: ${timeLeft} minutos\n` +
        `💰 Fianza requerida: ${formatNumber(bailAmount)} Waguri Coins\n\n` +
        `📌 *Para pagar:*\n` +
        `${usedPrefix}fianza ${bailAmount}\n\n` +
        `⚠️ Si no pagas, espera ${timeLeft} minutos.`
      )
    }
    
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    if (amount < bailAmount) {
      return m.reply(
        `❌ *FIANZA INSUFICIENTE*\n\n` +
        `Fianza requerida: ${formatNumber(bailAmount)}\n` +
        `Ofreciste: ${formatNumber(amount)}\n` +
        `💰 Necesitas ${formatNumber(bailAmount - amount)} más.`
      )
    }
    
    if (user.economy.waguri < amount) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Necesitas: ${formatNumber(amount)} Waguri Coins\n` +
        `Tienes: ${formatNumber(user.economy.waguri)}`
      )
    }
    
    user.economy.waguri -= amount
    user.economy.inJail = false
    user.economy.jailTime = 0
    
    return m.reply(
      `✅ *¡LIBERADO!*\n\n` +
      `Has pagado tu fianza de ${formatNumber(amount)} Waguri Coins.\n` +
      `🔓 Estás libre de nuevo.\n\n` +
      `💳 Tu saldo: ${formatNumber(user.economy.waguri)}\n` +
      `⚠️ ¡No vuelvas a delinquir!`
    )
  }
  
  // COMANDO: .escapar
  if (command === 'escapar') {
    if (!user.economy.inJail) {
      return m.reply('❌ No estás en la cárcel.')
    }
    
    const escapeChance = 0.3 // 30% de éxito
    
    if (Math.random() < escapeChance) {
      // Escape exitoso
      user.economy.inJail = false
      user.economy.jailTime = 0
      
      // Posible recompensa por búsqueda
      if (Math.random() < 0.5) {
        user.economy.robberyCooldown = Date.now() + (120 * 60 * 1000) // 2 horas cooldown por ser buscado
        return m.reply(
          `🏃‍♂️ *¡ESCAPE EXITOSO!*\n\n` +
          `Lograste escapar de la cárcel.\n` +
          `⚠️ *PERO...*\n` +
          `🚔 La policía te está buscando.\n` +
          `⏰ No podrás robar por 2 horas.\n\n` +
          `🏃‍♂️ ¡Corre y escóndete!`
        )
      }
      
      return m.reply(
        `🏃‍♂️ *¡ESCAPE EXITOSO!*\n\n` +
        `Lograste escapar de la cárcel.\n` +
        `🎉 Nadie se dio cuenta.\n` +
        `🔓 Eres libre de nuevo.\n\n` +
        `⚠️ Sé más cuidadoso la próxima vez.`
      )
      
    } else {
      // Escape fallido
      const extraTime = 30 // 30 minutos extra
      user.economy.jailTime += (extraTime * 60 * 1000)
      
      const newTimeLeft = Math.ceil((user.economy.jailTime - Date.now()) / 60000)
      
      return m.reply(
        `❌ *ESCAPE FALLIDO*\n\n` +
        `Te atraparon intentando escapar.\n` +
        `⏰ Castigo: +30 minutos en cárcel\n` +
        `🔒 Nuevo tiempo total: ${newTimeLeft} minutos\n\n` +
        `💰 Considera pagar la fianza.`
      )
    }
  }
  
  // COMANDO: .roboarmado @usuario
  if (command === 'roboarmado') {
    // Similar a .robar pero con más riesgo/recompensa
    // Implementación similar pero con diferentes valores
    return m.reply('⚠️ Comando en desarrollo...')
  }
  
  // COMANDO: .hackear @usuario
  if (command === 'hackear') {
    // Sistema de hackeo de cuentas
    // Implementación similar pero con diferentes mecánicas
    return m.reply('⚠️ Comando en desarrollo...')
  }
}

handler.help = [
  'robar @usuario',
  'proteger',
  'caja_fuerte',
  'carcel',
  'fianza <cantidad>',
  'escapar',
  'roboarmado @usuario',
  'hackear @usuario'
]

handler.tags = ['economy', 'robbery']
handler.command = /^(robar|proteger|caja_fuerte|caja|carcel|fianza|escapar|roboarmado|hackear)$/i
handler.group = true
handler.register = true

export default handler