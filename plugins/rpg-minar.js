let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    user.cyberHunter = {
      rank: "Novato",
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      cyberware: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0,
      lastMine: 0
    }
  }
  
  // Cooldown de 15 minutos
  const MINE_COOLDOWN = 15 * 60 * 1000
  const now = Date.now()
  
  if (!user.cyberHunter.lastMine) user.cyberHunter.lastMine = 0
  const timeLeft = user.cyberHunter.lastMine + MINE_COOLDOWN - now
  
  if (timeLeft > 0) {
    const minutes = Math.ceil(timeLeft / 60000)
    return m.reply(`⛏️ Sistema de minado recargando...\nEspera ${minutes} minutos.`)
  }
  
  user.cyberHunter.lastMine = now
  
  // Tipos de criptomonedas
  const cryptoTypes = [
    { name: "⚡ ElectroCoin", value: 50, chance: 0.5 },
    { name: "💎 NeuroGem", value: 100, chance: 0.3 },
    { name: "🔮 QuantumToken", value: 200, chance: 0.15 },
    { name: "🌟 StellarByte", value: 500, chance: 0.05 }
  ]
  
  let mineMessage = []
  mineMessage.push(`⛏️ *SISTEMA DE MINADO CRIPTO* ⛏️`)
  mineMessage.push(`🔧 RIG: HashMaster ${user.cyberHunter.level}.0`)
  mineMessage.push(`⚡ Energía disponible: ${user.cyberHunter.level * 10}MH/s`)
  mineMessage.push(``)
  
  // Simulación de minado
  mineMessage.push(`🔄 Iniciando secuencia de minado...`)
  mineMessage.push(`🔍 Buscando bloque...`)
  mineMessage.push(`⚡ Calculando hash...`)
  
  // Determinar recompensa
  const random = Math.random()
  let crypto = cryptoTypes[0]
  let minedAmount = 0
  
  for (const c of cryptoTypes) {
    if (random < c.chance) {
      crypto = c
      break
    }
  }
  
  // Cantidad minada (1-5 unidades)
  minedAmount = Math.floor(Math.random() * 5) + 1
  const totalValue = crypto.value * minedAmount
  
  // Bonus por nivel
  const levelBonus = Math.floor(totalValue * (user.cyberHunter.level * 0.05))
  const finalReward = totalValue + levelBonus
  
  user.credit = (user.credit || 0) + finalReward
  
  mineMessage.push(``)
  mineMessage.push(`✅ *MINADO EXITOSO*`)
  mineMessage.push(`💰 Cryptomoneda: ${crypto.name}`)
  mineMessage.push(`📦 Cantidad: ${minedAmount} unidades`)
  mineMessage.push(`🎯 Valor base: ${totalValue} créditos`)
  
  if (levelBonus > 0) {
    mineMessage.push(`✨ Bonus nivel ${user.cyberHunter.level}: +${levelBonus} créditos`)
  }
  
  mineMessage.push(`💰 Total: ${finalReward} créditos`)
  mineMessage.push(``)
  mineMessage.push(`💳 Saldo actual: ${user.credit} ⚡`)
  mineMessage.push(`⏳ Próximo minado en 15 minutos`)
  
  await m.reply(mineMessage.join('\n'))
}

handler.help = ['minar', 'mine', 'crypto']
handler.tags = ['rpg']
handler.command = /^(minar|mine|crypto|mineria)$/i
handler.group = true
handler.register = true

export default handler