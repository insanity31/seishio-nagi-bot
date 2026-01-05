let handler = async (m, { conn }) => {
  const users = Object.entries(global.db.data.users)
    .filter(([_, userData]) => userData.cyberHunter)
    .map(([jid, userData]) => ({
      jid,
      ...userData.cyberHunter,
      credits: userData.credit || 0
    }))
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 10)
  
  let leaderboard = []
  leaderboard.push(`🏆 *TOP 10 CAZADORES* 🏆`)
  leaderboard.push(`📊 Actualizado: ${new Date().toLocaleDateString()}`)
  leaderboard.push(``)
  
  users.forEach((user, index) => {
    const rankEmoji = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
    const name = user.jid.split('@')[0]
    leaderboard.push(
      `${rankEmoji[index] || `${index + 1}.`} @${name}\n` +
      `   🏅 ${user.rank} | 💰 ${user.credits} ⚡\n` +
      `   ⚔️ Lvl ${user.level} | ✅ ${user.missionsCompleted} misiones`
    )
  })
  
  await conn.sendMessage(m.chat, {
    text: leaderboard.join('\n'),
    mentions: users.map(u => u.jid)
  }, { quoted: m })
}

handler.help = ['rank', 'leaderboard', 'ranking']
handler.tags = ['rpg']
handler.command = /^(top|ranking|leaderboard|mejores)$/i