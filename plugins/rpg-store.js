let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  const CYBERWARE_STORE = [
    {
      id: 1,
      name: "🦿 Implante de Piernas",
      description: "+10 HP máximo, +5 velocidad de misión",
      price: 500,
      effect: { maxHp: 10, cooldownReduction: 0.1 },
      type: "implante"
    },
    {
      id: 2,
      name: "💪 Brazos Cibernéticos",
      description: "+15 ATK, +5% daño crítico",
      price: 750,
      effect: { attack: 15, criticalChance: 0.05 },
      type: "implante"
    },
    {
      id: 3,
      name: "👁️ Ojo Cibernético",
      description: "+10% probabilidad de evento especial",
      price: 600,
      effect: { specialEventChance: 0.1 },
      type: "sensor"
    },
    {
      id: 4,
      name: "🛡️ Escudo Nanotecnológico",
      description: "+20 DEF, +10 HP máximo",
      price: 900,
      effect: { defense: 20, maxHp: 10 },
      type: "defensa"
    },
    {
      id: 5,
      name: "⚡ Neuro-acelerador",
      description: "Reduce cooldown en 1 minuto",
      price: 1200,
      effect: { cooldownReduction: 60000 },
      type: "mejora"
    },
    {
      id: 6,
      name: "💾 Chip de Hacking",
      description: "+25% recompensas de datos",
      price: 800,
      effect: { dataRewardBoost: 0.25 },
      type: "software"
    }
  ]
  
  let storeMessage = []
  storeMessage.push(`🛒 *TIENDA CYBERWARE - MERCADO NEGRO* 🛒`)
  storeMessage.push(`💳 Tus créditos: *${user.credit || 0}* ⚡`)
  storeMessage.push(``)
  
  CYBERWARE_STORE.forEach(item => {
    storeMessage.push(`🆔 *${item.id}.* ${item.name}`)
    storeMessage.push(`📝 ${item.description}`)
    storeMessage.push(`💰 Precio: *${item.price}* créditos`)
    storeMessage.push(`🏷️ Tipo: ${item.type}`)
    storeMessage.push(`━━━━━━━━━━━━━━━━━━━━`)
  })
  
  storeMessage.push(``)
  storeMessage.push(`🔧 *CÓMO COMPRAR:*`)
  storeMessage.push(`Usa: ${usedPrefix}comprar <ID>`)
  storeMessage.push(`Ejemplo: ${usedPrefix}comprar 1`)
  
  await m.reply(storeMessage.join('\n'))
}

handler.help = ['tienda', 'store', 'cyberstore']
handler.tags = ['rpg']
handler.command = /^(tienda|store|cyberstore|mejoras)$/i
export default handler