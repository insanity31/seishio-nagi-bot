let handler = async (m, { conn, usedPrefix, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil de cazador')
  }
  
  const WORKSHOP_ITEMS = [
    {
      id: 1,
      name: "🔧 Reparación Rápida",
      description: "Restaura todo tu HP inmediatamente",
      price: 150,
      effect: "hp_restore"
    },
    {
      id: 2,
      name: "⚡ Mejora de Armas",
      description: "+5 ATK permanente",
      price: 300,
      effect: "attack_up"
    },
    {
      id: 3,
      name: "🛡️ Blindaje Reforzado",
      description: "+5 DEF permanente",
      price: 250,
      effect: "defense_up"
    },
    {
      id: 4,
      name: "❤️ Sistema de Vida",
      description: "+10 HP máximo",
      price: 400,
      effect: "maxhp_up"
    },
    {
      id: 5,
      name: "💾 Chip de Hacking",
      description: "+10% recompensas de hackeo",
      price: 500,
      effect: "hack_bonus"
    }
  ]
  
  // Mostrar tienda si no hay argumentos
  if (!args[0]) {
    let shopList = []
    shopList.push(`⚙️ *TALLER CYBER - MERCADO NEGRO* ⚙️`)
    shopList.push(`💳 Tus créditos: ${user.credit || 0} ⚡`)
    shopList.push(``)
    
    WORKSHOP_ITEMS.forEach(item => {
      shopList.push(`🆔 ${item.id}. ${item.name}`)
      shopList.push(`   📝 ${item.description}`)
      shopList.push(`   💰 ${item.price} créditos`)
      shopList.push(``)
    })
    
    shopList.push(`🔧 *COMPRAR:* ${usedPrefix}taller <ID>`)
    shopList.push(`📌 Ejemplo: ${usedPrefix}taller 1`)
    
    return m.reply(shopList.join('\n'))
  }
  
  // Procesar compra
  const itemId = parseInt(args[0])
  const selectedItem = WORKSHOP_ITEMS.find(item => item.id === itemId)
  
  if (!selectedItem) {
    return m.reply(`❌ ID inválido. Usa ${usedPrefix}taller para ver la lista`)
  }
  
  if ((user.credit || 0) < selectedItem.price) {
    return m.reply(`❌ Créditos insuficientes.\nNecesitas: ${selectedItem.price} ⚡\nTienes: ${user.credit || 0} ⚡`)
  }
  
  // Aplicar compra
  user.credit -= selectedItem.price
  
  // Aplicar efectos
  let effectMessage = ""
  switch (selectedItem.effect) {
    case "hp_restore":
      user.cyberHunter.hp = user.cyberHunter.maxHp
      effectMessage = "❤️ HP completamente restaurado"
      break
    case "attack_up":
      user.cyberHunter.attack += 5
      effectMessage = "⚔️ +5 ATK permanente"
      break
    case "defense_up":
      user.cyberHunter.defense += 5
      effectMessage = "🛡️ +5 DEF permanente"
      break
    case "maxhp_up":
      user.cyberHunter.maxHp += 10
      user.cyberHunter.hp += 10
      effectMessage = "❤️ +10 HP máximo"
      break
    case "hack_bonus":
      if (!user.cyberHunter.upgrades) user.cyberHunter.upgrades = []
      user.cyberHunter.upgrades.push("hack_bonus")
      effectMessage = "💾 +10% recompensas de hackeo"
      break
  }
  
  await m.reply(
    `✅ *COMPRA EXITOSA*\n\n` +
    `🛒 Item: ${selectedItem.name}\n` +
    `💰 Costo: ${selectedItem.price} créditos\n` +
    `✨ Efecto: ${effectMessage}\n` +
    `💳 Saldo: ${user.credit} ⚡\n\n` +
    `🔧 Mejora aplicada a tu sistema.`
  )
}

handler.help = ['taller', 'workshop', 'reparar']
handler.tags = ['rpg']
handler.command = /^(taller|workshop|reparar|mejorar)$/i
handler.group = true
handler.register = true

export default handler