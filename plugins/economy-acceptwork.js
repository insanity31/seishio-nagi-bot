let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar economía si no existe
  if (!user.economy) {
    user.economy = {
      waguri: 1000,
      workLevel: 1,
      workXP: 0,
      job: null,
      lastWork: 0,
      totalEarned: 1000,
      workStreak: 0,
      lastWorkDay: 0
    }
  }
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Lista de trabajos disponibles
  const availableJobs = {
    'repartidor': {
      name: '🚚 Repartidor',
      description: 'Reparte paquetes por la ciudad',
      salary: 150,
      cooldown: 2, // horas
      level: 1,
      xpPerWork: 1
    },
    'cajero': {
      name: '💵 Cajero',
      description: 'Atención al cliente en tienda',
      salary: 200,
      cooldown: 3,
      level: 2,
      xpPerWork: 2
    },
    'constructor': {
      name: '👷 Constructor',
      description: 'Trabajo en construcción',
      salary: 300,
      cooldown: 4,
      level: 3,
      xpPerWork: 3
    },
    'cocinero': {
      name: '👨‍🍳 Cocinero',
      description: 'Prepara comida en restaurante',
      salary: 350,
      cooldown: 4,
      level: 4,
      xpPerWork: 4
    },
    'programador': {
      name: '💻 Programador',
      description: 'Desarrollo de software',
      salary: 500,
      cooldown: 6,
      level: 5,
      xpPerWork: 5
    },
    'doctor': {
      name: '👨‍⚕️ Doctor',
      description: 'Atención médica en hospital',
      salary: 800,
      cooldown: 8,
      level: 8,
      xpPerWork: 8
    },
    'abogado': {
      name: '⚖️ Abogado',
      description: 'Asesoría legal',
      salary: 1000,
      cooldown: 10,
      level: 10,
      xpPerWork: 10
    },
    'ceo': {
      name: '👔 CEO',
      description: 'Dirección de empresa',
      salary: 1500,
      cooldown: 12,
      level: 12,
      xpPerWork: 15
    },
    'inversor': {
      name: '📈 Inversor',
      description: 'Inversiones en bolsa',
      salary: 2000,
      cooldown: 24,
      level: 15,
      xpPerWork: 20
    }
  }
  
  // COMANDO: .aceptartrabajo <trabajo>
  if (command === 'aceptartrabajo') {
    if (!args[0]) {
      // Mostrar lista de trabajos disponibles
      let jobsList = `💼 *TRABAJOS DISPONIBLES*\n\n`
      jobsList += `👤 Tu nivel actual: ${user.economy.workLevel || 1}\n\n`
      
      Object.entries(availableJobs).forEach(([jobId, job]) => {
        const canAccept = (user.economy.workLevel || 1) >= job.level
        const status = canAccept ? '🟢' : '🔴'
        
        jobsList += `${status} *${job.name}*\n`
        jobsList += `   📝 ${job.description}\n`
        jobsList += `   💰 Salario: ${formatNumber(job.salary)} WC\n`
        jobsList += `   ⏰ Cooldown: ${job.cooldown}h | ⭐ Nivel: ${job.level}\n`
        
        if (canAccept) {
          if (user.economy.job === jobId) {
            jobsList += `   ✅ Ya tienes este trabajo\n`
          } else {
            jobsList += `   🔧 ${usedPrefix}aceptartrabajo ${jobId}\n`
          }
        } else {
          jobsList += `   🔒 Necesitas nivel ${job.level}\n`
        }
        
        jobsList += `\n`
      })
      
      if (user.economy.job) {
        const currentJob = availableJobs[user.economy.job]
        jobsList += `📌 *TRABAJO ACTUAL:* ${currentJob?.name || user.economy.job}\n`
        jobsList += `🔧 Para trabajar: ${usedPrefix}trabajar\n`
        jobsList += `🔄 Para cambiar: ${usedPrefix}renunciar primero\n`
      } else {
        jobsList += `📌 *EJEMPLO:* ${usedPrefix}aceptartrabajo repartidor\n`
        jobsList += `💡 Sube de nivel trabajando para desbloquear mejores trabajos.`
      }
      
      await m.reply(jobsList)
      return
    }
    
    // Aceptar trabajo específico
    const jobId = args[0].toLowerCase()
    const job = availableJobs[jobId]
    
    if (!job) {
      return m.reply(
        `❌ *TRABAJO NO ENCONTRADO*\n\n` +
        `Trabajos disponibles:\n` +
        Object.keys(availableJobs).map(id => `• ${id}`).join('\n') +
        `\n\n📌 Usa ${usedPrefix}aceptartrabajo para ver la lista completa.`
      )
    }
    
    // Verificar nivel
    if ((user.economy.workLevel || 1) < job.level) {
      return m.reply(
        `❌ *NIVEL INSUFICIENTE*\n\n` +
        `Necesitas nivel ${job.level}\n` +
        `Tu nivel actual: ${user.economy.workLevel || 1}\n\n` +
        `💡 Sube de nivel aceptando trabajos más simples primero.`
      )
    }
    
    // Verificar si ya tiene trabajo
    if (user.economy.job) {
      if (user.economy.job === jobId) {
        return m.reply(`✅ Ya tienes este trabajo: ${job.name}`)
      }
      
      return m.reply(
        `⚠️ *YA TIENES UN TRABAJO*\n\n` +
        `Trabajo actual: ${availableJobs[user.economy.job]?.name || user.economy.job}\n\n` +
        `Para cambiar de trabajo:\n` +
        `1. ${usedPrefix}renunciar\n` +
        `2. ${usedPrefix}aceptartrabajo ${jobId}`
      )
    }
    
    // Aceptar el trabajo
    user.economy.job = jobId
    
    await m.reply(
      `✅ *TRABAJO ACEPTADO*\n\n` +
      `💼 ${job.name}\n` +
      `📝 ${job.description}\n\n` +
      `💰 Salario por trabajo: ${formatNumber(job.salary)} WC\n` +
      `⏰ Cooldown: ${job.cooldown} horas\n` +
      `⭐ Nivel requerido: ${job.level}\n` +
      `📈 XP por trabajo: ${job.xpPerWork}\n\n` +
      `🔧 *Para trabajar:* ${usedPrefix}trabajar\n` +
      `📊 *Para ver progreso:* ${usedPrefix}miwork\n` +
      `💡 Trabaja regularmente para subir de nivel y desbloquear mejores trabajos.`
    )
    
    return
  }
  
  // COMANDO: .miwork (ver trabajo actual)
  if (command === 'miwork') {
    if (!user.economy.job) {
      return m.reply(
        `❌ *NO TIENES TRABAJO*\n\n` +
        `Usa ${usedPrefix}aceptartrabajo para conseguir un trabajo.\n` +
        `Usa ${usedPrefix}trabajos para ver las opciones disponibles.`
      )
    }
    
    const job = availableJobs[user.economy.job]
    
    if (!job) {
      return m.reply(
        `⚠️ *TRABAJO NO VÁLIDO*\n\n` +
        `Tu trabajo actual (${user.economy.job}) ya no existe.\n` +
        `Usa ${usedPrefix}renunciar y luego busca uno nuevo.`
      )
    }
    
    const now = Date.now()
    const lastWorkTime = user.economy.lastWork || 0
    const cooldownMs = job.cooldown * 60 * 60 * 1000
    const nextWorkTime = lastWorkTime + cooldownMs
    const canWork = now >= nextWorkTime
    
    let timeLeft = 0
    if (!canWork) {
      timeLeft = Math.ceil((nextWorkTime - now) / (60 * 1000)) // minutos
    }
    
    // Calcular progreso de nivel
    const xpNeeded = (user.economy.workLevel || 1) * 10
    const currentXP = user.economy.workXP || 0
    const xpPercent = Math.min(100, Math.round((currentXP / xpNeeded) * 100))
    
    // Barra de progreso
    const barLength = 10
    const filledBlocks = Math.floor((xpPercent / 100) * barLength)
    const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(barLength - filledBlocks)
    
    let workMessage = `💼 *MI TRABAJO*\n\n`
    workMessage += `👤 ${conn.getName(m.sender) || 'Usuario'}\n\n`
    
    workMessage += `🏢 *TRABAJO ACTUAL:*\n`
    workMessage += `${job.name}\n`
    workMessage += `📝 ${job.description}\n\n`
    
    workMessage += `💰 *INFORMACIÓN:*\n`
    workMessage += `• Salario: ${formatNumber(job.salary)} WC\n`
    workMessage += `• Cooldown: ${job.cooldown} horas\n`
    workMessage += `• Nivel requerido: ${job.level}\n`
    workMessage += `• XP por trabajo: ${job.xpPerWork}\n\n`
    
    workMessage += `📊 *PROGRESO:*\n`
    workMessage += `⭐ Nivel: ${user.economy.workLevel || 1}\n`
    workMessage += `📈 XP: ${currentXP}/${xpNeeded}\n`
    workMessage += `${progressBar} ${xpPercent}%\n\n`
    
    workMessage += `⏰ *ESTADO:*\n`
    if (canWork) {
      workMessage += `🟢 Listo para trabajar\n`
      workMessage += `🔧 Usa: ${usedPrefix}trabajar\n`
    } else {
      const hours = Math.floor(timeLeft / 60)
      const minutes = timeLeft % 60
      workMessage += `⏳ Espera: ${hours}h ${minutes}m\n`
      workMessage += `🕐 Podrás trabajar nuevamente\n`
    }
    
    workMessage += `\n💡 *CONSEJOS:*\n`
    if (user.economy.workLevel < 5) {
      workMessage += `• Sigue trabajando para subir de nivel\n`
      workMessage += `• Cada nivel desbloquea mejores trabajos\n`
    } else if (user.economy.workLevel < 10) {
      workMessage += `• ¡Vas por buen camino!\n`
      workMessage += `• Pronto podrás ser CEO\n`
    } else {
      workMessage += `• ¡Eres un experto!\n`
      workMessage += `• Considera ayudar a otros\n`
    }
    
    await m.reply(workMessage)
    return
  }
  
  // COMANDO: .renunciar
  if (command === 'renunciar') {
    if (!user.economy.job) {
      return m.reply('❌ No tienes trabajo actualmente.')
    }
    
    const currentJob = availableJobs[user.economy.job]
    const jobName = currentJob?.name || user.economy.job
    
    // Preguntar confirmación
    if (args[0]?.toLowerCase() !== 'confirmar') {
      return m.reply(
        `⚠️ *CONFIRMAR RENUNCIA*\n\n` +
        `Estás a punto de renunciar a tu trabajo:\n` +
        `💼 ${jobName}\n\n` +
        `⚠️ *ADVERTENCIA:*\n` +
        `• Perderás tu progreso en este trabajo\n` +
        `• Tendrás que empezar desde 0\n\n` +
        `✅ *Para confirmar:*\n` +
        `${usedPrefix}renunciar confirmar\n\n` +
        `❌ *Para cancelar:*\n` +
        `No hagas nada o escribe otro comando.`
      )
    }
    
    // Confirmar renuncia
    const oldJob = user.economy.job
    user.economy.job = null
    user.economy.workXP = 0
    // Nota: Mantenemos el nivel general
    
    await m.reply(
      `📝 *RENUNCIA ACEPTADA*\n\n` +
      `Has renunciado a tu trabajo:\n` +
      `💼 ${jobName}\n\n` +
      `🔄 Ahora puedes buscar un nuevo trabajo:\n` +
      `🔧 ${usedPrefix}aceptartrabajo\n\n` +
      `💡 Tu nivel general (${user.economy.workLevel || 1}) se mantiene.\n` +
      `¡Buena suerte en tu nueva búsqueda!`
    )
    
    return
  }
  
  // COMANDO: .trabajar
  if (command === 'trabajar') {
    if (!user.economy.job) {
      return m.reply(
        `❌ *NO TIENES TRABAJO*\n\n` +
        `Primero consigue un trabajo:\n` +
        `${usedPrefix}aceptartrabajo\n\n` +
        `O ver las opciones:\n` +
        `${usedPrefix}trabajos`
      )
    }
    
    const job = availableJobs[user.economy.job]
    
    if (!job) {
      return m.reply(
        `❌ *TRABAJO INVÁLIDO*\n\n` +
        `Tu trabajo actual ya no existe.\n` +
        `Usa ${usedPrefix}renunciar y busca uno nuevo.`
      )
    }
    
    const now = Date.now()
    const lastWorkTime = user.economy.lastWork || 0
    const cooldownMs = job.cooldown * 60 * 60 * 1000
    const nextWorkTime = lastWorkTime + cooldownMs
    
    // Verificar cooldown
    if (now < nextWorkTime) {
      const timeLeft = Math.ceil((nextWorkTime - now) / (60 * 1000)) // minutos
      const hours = Math.floor(timeLeft / 60)
      const minutes = timeLeft % 60
      
      return m.reply(
        `⏰ *EN COOLDOWN*\n\n` +
        `💼 ${job.name}\n` +
        `📝 ${job.description}\n\n` +
        `⏳ Tiempo restante: ${hours}h ${minutes}m\n` +
        `🕐 Podrás trabajar a las: ${new Date(nextWorkTime).toLocaleTimeString()}\n\n` +
        `💡 Usa ${usedPrefix}miwork para ver tu progreso.`
      )
    }
    
    // Calcular salario con bonificaciones
    let baseSalary = job.salary
    
    // Bonus por nivel (10% por nivel)
    const levelBonus = Math.floor(baseSalary * ((user.economy.workLevel || 1) * 0.1))
    
    // Bonus por racha de días consecutivos
    const today = new Date().toDateString()
    const lastWorkDay = user.economy.lastWorkDay ? new Date(user.economy.lastWorkDay).toDateString() : null
    const isConsecutive = lastWorkDay === new Date(now - 24 * 60 * 60 * 1000).toDateString()
    
    if (isConsecutive) {
      user.economy.workStreak = (user.economy.workStreak || 0) + 1
    } else {
      user.economy.workStreak = 1
    }
    
    const streakBonus = Math.floor(baseSalary * (Math.min(user.economy.workStreak, 7) * 0.05)) // Máximo 35% por 7 días
    
    // Bonus aleatorio (0-20%)
    const randomBonus = Math.floor(baseSalary * (Math.random() * 0.2))
    
    // Calcular total
    const totalSalary = baseSalary + levelBonus + streakBonus + randomBonus
    
    // Dar recompensa
    user.economy.waguri += totalSalary
    user.economy.lastWork = now
    user.economy.lastWorkDay = now
    user.economy.totalEarned = (user.economy.totalEarned || 0) + totalSalary
    
    // Añadir XP
    user.economy.workXP = (user.economy.workXP || 0) + job.xpPerWork
    
    // Verificar si sube de nivel
    const xpNeeded = (user.economy.workLevel || 1) * 10
    let levelUpMessage = ''
    
    if (user.economy.workXP >= xpNeeded) {
      user.economy.workLevel += 1
      user.economy.workXP = 0
      
      levelUpMessage = `\n🎉 *¡SUBISTE DE NIVEL!*\n` +
                      `⭐ Nuevo nivel: ${user.economy.workLevel}\n` +
                      `💼 Desbloqueas mejores trabajos\n`
    }
    
    // Registrar transacción
    if (!user.economy.transactions) user.economy.transactions = []
    user.economy.transactions.unshift({
      type: 'work',
      amount: totalSalary,
      description: `Trabajo: ${job.name}`,
      date: new Date().toISOString(),
      timestamp: now
    })
    
    let workCompleteMessage = `✅ *TRABAJO COMPLETADO*\n\n`
    workCompleteMessage += `💼 ${job.name}\n`
    workCompleteMessage += `📝 ${job.description}\n\n`
    
    workCompleteMessage += `💰 *DESGLOSE DE PAGO:*\n`
    workCompleteMessage += `• Salario base: ${formatNumber(baseSalary)} WC\n`
    workCompleteMessage += `• Bonus nivel ${user.economy.workLevel}: +${formatNumber(levelBonus)} WC\n`
    
    if (streakBonus > 0) {
      workCompleteMessage += `• Bonus racha ${user.economy.workStreak}d: +${formatNumber(streakBonus)} WC\n`
    }
    
    if (randomBonus > 0) {
      workCompleteMessage += `• Bonus suerte: +${formatNumber(randomBonus)} WC\n`
    }
    
    workCompleteMessage += `\n💰 *TOTAL: ${formatNumber(totalSalary)} WC*\n`
    workCompleteMessage += `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC\n\n`
    
    workCompleteMessage += `📊 *PROGRESO:*\n`
    workCompleteMessage += `⭐ Nivel: ${user.economy.workLevel || 1}\n`
    workCompleteMessage += `📈 XP: ${user.economy.workXP || 0}/${xpNeeded}\n`
    workCompleteMessage += `🔥 Racha de días: ${user.economy.workStreak || 1}\n`
    
    workCompleteMessage += levelUpMessage
    
    workCompleteMessage += `\n⏰ Próximo trabajo en ${job.cooldown} horas\n`
    workCompleteMessage += `💡 Mantén tu racha para mejores bonificaciones.`
    
    await m.reply(workCompleteMessage)
    return
  }
}

handler.help = [
  'aceptartrabajo [trabajo]',
  'miwork',
  'renunciar [confirmar]',
  'trabajar'
]

handler.tags = ['economy', 'work']
handler.command = /^(aceptartrabajo|miwork|renunciar|trabajar|work)$/i
handler.group = true
handler.register = true

export default handler