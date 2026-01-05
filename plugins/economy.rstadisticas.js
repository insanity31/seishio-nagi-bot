let handler = async (m, { conn, usedPrefix }) => {
  const users = global.db.data.users
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Estadísticas globales
  let stats = {
    totalCoins: 0,
    totalUsers: 0,
    totalBank: 0,
    totalJobs: 0,
    richestUser: { jid: '', name: '', wealth: 0 },
    poorestUser: { jid: '', name: '', wealth: Infinity },
    averageWealth: 0,
    transactionsToday: 0
  }
  
  const today = new Date().toDateString()
  
  // Procesar todos los usuarios
  Object.entries(users).forEach(([jid, userData]) => {
    if (userData.economy) {
      const cash = userData.economy.waguri || 0
      const bank = userData.economy.bank || 0
      const wealth = cash + bank
      
      stats.totalCoins += wealth
      stats.totalBank += bank
      stats.totalUsers++
      
      if (userData.economy.job) {
        stats.totalJobs++
      }
      
      // Más rico
      if (wealth > stats.richestUser.wealth) {
        stats.richestUser = {
          jid,
          name: conn.getName(jid) || `@${jid.split('@')[0]}`,
          wealth
        }
      }
      
      // Más pobre (con economía activa)
      if (wealth < stats.poorestUser.wealth) {
        stats.poorestUser = {
          jid,
          name: conn.getName(jid) || `@${jid.split('@')[0]}`,
          wealth
        }
      }
      
      // Transacciones hoy
      const transactions = userData.economy.transactions || []
      const todayTransactions = transactions.filter(t => {
        const transDate = new Date(t.date).toDateString()
        return transDate === today
      })
      stats.transactionsToday += todayTransactions.length
    }
  })
  
  if (stats.totalUsers === 0) {
    return m.reply('📊 No hay datos económicos disponibles.')
  }
  
  stats.averageWealth = Math.floor(stats.totalCoins / stats.totalUsers)
  
  // Distribución de riqueza
  const allWealths = Object.values(users)
    .filter(u => u.economy)
    .map(u => (u.economy.waguri || 0) + (u.economy.bank || 0))
    .sort((a, b) => a - b)
  
  const medianWealth = allWealths.length > 0 
    ? allWealths[Math.floor(allWealths.length / 2)]
    : 0
  
  // Crear mensaje
  let statsMessage = `📊 *ESTADÍSTICAS ECONÓMICAS GLOBALES*\n\n`
  
  statsMessage += `💰 *RIQUEZA TOTAL:*\n`
  statsMessage += `• En circulación: ${formatNumber(stats.totalCoins)} WC\n`
  statsMessage += `• En bancos: ${formatNumber(stats.totalBank)} WC\n`
  statsMessage += `• Usuarios activos: ${stats.totalUsers}\n`
  statsMessage += `• Promedio por usuario: ${formatNumber(stats.averageWealth)} WC\n`
  statsMessage += `• Mediana: ${formatNumber(medianWealth)} WC\n\n`
  
  statsMessage += `👥 *DISTRIBUCIÓN:*\n`
  statsMessage += `• Usuarios con trabajo: ${stats.totalJobs}\n`
  statsMessage += `• Transacciones hoy: ${stats.transactionsToday}\n\n`
  
  statsMessage += `🏆 *EXTREMOS:*\n`
  statsMessage += `• Más rico: ${stats.richestUser.name}\n`
  statsMessage += `  💰 ${formatNumber(stats.richestUser.wealth)} WC\n`
  statsMessage += `• Más pobre: ${stats.poorestUser.name}\n`
  statsMessage += `  💰 ${formatNumber(stats.poorestUser.wealth)} WC\n\n`
  
  // Distribución porcentual
  if (allWealths.length >= 3) {
    const top10 = allWealths.slice(-Math.ceil(allWealths.length * 0.1)).reduce((a, b) => a + b, 0)
    const top10Percent = Math.round((top10 / stats.totalCoins) * 100)
    
    const bottom50 = allWealths.slice(0, Math.ceil(allWealths.length * 0.5)).reduce((a, b) => a + b, 0)
    const bottom50Percent = Math.round((bottom50 / stats.totalCoins) * 100)
    
    statsMessage += `📈 *DISTRIBUCIÓN DE RIQUEZA:*\n`
    statsMessage += `• Top 10% tiene: ${top10Percent}% del total\n`
    statsMessage += `• Bottom 50% tiene: ${bottom50Percent}% del total\n\n`
  }
  
  // Consejos económicos
  statsMessage += `💡 *CONSEJOS ECONÓMICOS:*\n`
  
  if (stats.averageWealth < 5000) {
    statsMessage += `• La economía está en crecimiento\n`
    statsMessage += `• Es buen momento para invertir\n`
  } else if (stats.averageWealth < 20000) {
    statsMessage += `• Economía estable\n`
    statsMessage += `• Considera diversificar\n`
  } else {
    statsMessage += `• Economía madura\n`
    statsMessage += `• Enfócate en ahorros\n`
  }
  
  statsMessage += `\n⏰ Actualizado: ${new Date().toLocaleTimeString()}`
  
  await m.reply(statsMessage)
}

handler.help = ['economia', 'estadisticas', 'stats', 'economystats']
handler.tags = ['economy']
handler.command = /^(econom[ií]a|estad[ií]sticas|stats|economystats)$/i
handler.group = true
handler.register = true

export default handler