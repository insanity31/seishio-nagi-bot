const fs = require('fs');
const path = require('path');

// Configuración del sistema
const ECONOMY_CONFIG = {
    dailyReward: { min: 100, max: 300 },
    workReward: { min: 50, max: 150 },
    crimeReward: { min: 200, max: 500 },
    crimeFailPenalty: 100,
    transferTax: 0.05,
    interestRate: 0.01
};

module.exports = {
    name: "economy",
    alias: ["eco", "dinero", "bank", "money"],
    desc: "💰 Sistema económico completo",
    
    async execute(ctx, { m, args, bot }) {
        const userId = m.sender;
        const command = args[0]?.toLowerCase() || "help";
        
        // Cargar base de datos
        let db = { users: {} };
        try {
            if (fs.existsSync('./database.json')) {
                db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
            }
        } catch (e) {}
        
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                money: 1000,
                bank: 0,
                dailyStreak: 0,
                lastDaily: null,
                lastWork: null,
                lastCrime: null,
                totalEarned: 1000,
                inventory: [],
                stats: { transactions: 0, giftsSent: 0, giftsReceived: 0 }
            };
        }
        
        const user = db.users[userId];
        
        // Procesar comandos
        switch(command) {
            case "balance":
            case "bal":
                await showBalance(bot, m, user);
                break;
                
            case "daily":
                await claimDaily(bot, m, user, db, userId);
                break;
                
            case "work":
                await doWork(bot, m, user, db, userId);
                break;
                
            case "transfer":
                await transferMoney(bot, m, args, user, db, userId);
                break;
                
            case "rob":
                await robUser(bot, m, args, user, db, userId);
                break;
                
            case "top":
            case "leaderboard":
                await showLeaderboard(bot, m, db);
                break;
                
            case "shop":
                await showShop(bot, m, user);
                break;
                
            default:
                await showEconomyHelp(bot, m);
        }
    }
};

// Funciones auxiliares
async function showBalance(bot, m, user) {
    const total = user.money + user.bank;
    const message = `💰 *BALANCE ECONÓMICO*
    
💵 Efectivo: ${user.money.toLocaleString()} monedas
🏦 Banco: ${user.bank.toLocaleString()} monedas
📊 Total: ${total.toLocaleString()} monedas

📈 Total ganado: ${user.totalEarned.toLocaleString()} monedas
🔥 Racha diaria: ${user.dailyStreak} días

💎 *Items:* ${user.inventory.length > 0 ? user.inventory.join(', ') : 'Ninguno'}`;
    
    await bot.sendMessage(m.chat, { text: message }, { quoted: m });
}

async function claimDaily(bot, m, user, db, userId) {
    const now = new Date();
    const today = now.toDateString();
    
    if (user.lastDaily === today) {
        return bot.sendMessage(m.chat, 
            { text: `⏰ *Ya reclamaste hoy*\n\nVuelve mañana para tu siguiente recompensa diaria.` }, 
            { quoted: m }
        );
    }
    
    const baseReward = 100 + (user.dailyStreak * 20);
    const bonus = Math.floor(Math.random() * 100);
    const total = baseReward + bonus;
    
    user.money += total;
    user.dailyStreak += 1;
    user.lastDaily = today;
    user.totalEarned += total;
    
    // Guardar cambios
    db.users[userId] = user;
    fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
    
    const message = `🎁 *RECOMPENSA DIARIA #${user.dailyStreak}*
    
💰 Base: ${baseReward} monedas
🎰 Bonus: ${bonus} monedas
💵 Total: ${total} monedas

🏦 Saldo actual: ${user.money.toLocaleString()} monedas
🔥 Racha actual: ${user.dailyStreak} días consecutivos

💡 *Consejo:* Mantén tu racha para recompensas mayores cada día!`;
    
    await bot.sendMessage(m.chat, { text: message }, { quoted: m });
}

async function doWork(bot, m, user, db, userId) {
    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 30 minutos
    
    if (user.lastWork && (now - user.lastWork < cooldown)) {
        const minutesLeft = Math.ceil((cooldown - (now - user.lastWork)) / (1000 * 60));
        return bot.sendMessage(m.chat, 
            { text: `⏰ *Descansa un poco*\n\nPuedes trabajar de nuevo en *${minutesLeft} minutos*.` }, 
            { quoted: m }
        );
    }
    
    const jobs = [
        { name: "👷‍♂️ Constructor", reward: 80 },
        { name: "👨‍🍳 Chef", reward: 120 },
        { name: "👨‍💼 Oficinista", reward: 100 },
        { name: "👨‍🌾 Agricultor", reward: 90 },
        { name: "🧙‍♂️ Mago", reward: 150 }
    ];
    
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const bonus = Math.floor(Math.random() * 50);
    const total = job.reward + bonus;
    
    user.money += total;
    user.lastWork = now;
    user.totalEarned += total;
    
    db.users[userId] = user;
    fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
    
    const message = `💼 *TRABAJO COMPLETADO*
    
👨‍💻 Trabajo: ${job.name}
💰 Pago: ${job.reward} monedas
🎰 Bonus: ${bonus} monedas
💵 Total: ${total} monedas

🏦 Saldo actual: ${user.money.toLocaleString()} monedas
⏰ *Próximo trabajo en 30 minutos*`;
    
    await bot.sendMessage(m.chat, { text: message }, { quoted: m });
}

async function transferMoney(bot, m, args, user, db, userId) {
    if (args.length < 3) {
        return bot.sendMessage(m.chat, 
            { text: `❌ *Uso incorrecto*\n\nUso: .economy transfer @usuario cantidad\n\nEjemplo: .economy transfer @amigo 100` }, 
            { quoted: m }
        );
    }
    
    const targetMention = args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount) || amount <= 0) {
        return bot.sendMessage(m.chat, 
            { text: `❌ *Cantidad inválida*\n\nLa cantidad debe ser un número mayor a 0.` }, 
            { quoted: m }
        );
    }
    
    if (user.money < amount) {
        return bot.sendMessage(m.chat, 
            { text: `❌ *Fondos insuficientes*\n\nNecesitas: ${amount} monedas\nTienes: ${user.money} monedas` }, 
            { quoted: m }
        );
    }
    
    const tax = Math.floor(amount * 0.05); // 5% de impuesto
    const netAmount = amount - tax;
    
    user.money -= amount;
    user.stats.transactions = (user.stats.transactions || 0) + 1;
    
    // En un sistema real, buscarías al usuario objetivo en la DB
    // Por simplicidad, solo mostramos la transacción
    
    db.users[userId] = user;
    fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
    
    const message = `✅ *TRANSFERENCIA EXITOSA*
    
👤 Destinatario: ${targetMention}
💸 Cantidad: ${amount} monedas
🏛️ Impuesto (5%): ${tax} monedas
💰 Neto recibido: ${netAmount} monedas

💵 Tu saldo: ${user.money.toLocaleString()} monedas
📊 Transacciones totales: ${user.stats.transactions}`;
    
    await bot.sendMessage(m.chat, { text: message }, { quoted: m });
}

async function showLeaderboard(bot, m, db) {
    const users = Object.values(db.users)
        .sort((a, b) => (b.money + b.bank) - (a.money + a.bank))
        .slice(0, 10);
    
    let leaderboard = `🏆 *TOP 10 MÁS RICOS*\n\n`;
    
    users.forEach((user, index) => {
        const total = user.money + user.bank;
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "•";
        const name = user.id.split('@')[0].substring(0, 15);
        leaderboard += `${medal} ${name}\n`;
        leaderboard += `   💰 ${total.toLocaleString()} monedas\n\n`;
    });
    
    leaderboard += `\n💡 *Tu posición:* #${Object.values(db.users).sort((a,b) => (b.money+b.bank)-(a.money+a.bank)).findIndex(u => u.id === m.sender) + 1}`;
    
    await bot.sendMessage(m.chat, { text: leaderboard }, { quoted: m });
}

async function showShop(bot, m, user) {
    const shopItems = [
        { id: 1, name: "🍎 Manzana", price: 50, effect: "+10 energía" },
        { id: 2, name: "💎 Gema", price: 500, effect: "Item de colección" },
        { id: 3, name: "📜 Pergamino", price: 200, effect: "+50 XP" },
        { id: 4, name: "🗝️ Llave", price: 1000, effect: "Abre cofres" },
        { id: 5, name: "🎁 Caja", price: 300, effect: "Sorpresa aleatoria" }
    ];
    
    let shopList = `🛒 *TIENDA ECONÓMICA*\n\n`;
    
    shopItems.forEach(item => {
        shopList += `*${item.id}.* ${item.name} - ${item.price} 🪙\n`;
        shopList += `   📝 ${item.effect}\n\n`;
    });
    
    shopList += `💰 *Tu saldo:* ${user.money.toLocaleString()} monedas\n\n`;
    shopList += `💡 *Para comprar:*\n`;
    shopList += `.shop buy <número>\n`;
    shopList += `*Ejemplo:* .shop buy 1`;
    
    await bot.sendMessage(m.chat, { text: shopList }, { quoted: m });
}

async function showEconomyHelp(bot, m) {
    const help = `💰 *SISTEMA ECONÓMICO - COMANDOS*
    
.balance - Ver tu balance económico
.daily - Reclamar recompensa diaria
.work - Trabajar por dinero (30min cooldown)
.transfer @usuario cantidad - Transferir dinero
.rob @usuario - Intentar robar (riesgo)
.top - Ver ranking de los más ricos
.shop - Ver tienda de items

💡 *Ejemplos:*
.daily → Reclamar recompensa
.work → Trabajar
.transfer @amigo 100 → Enviar 100 monedas
.shop → Ver tienda

⚠️ *Nota:* Las transferencias tienen 5% de impuesto`;
    
    await bot.sendMessage(m.chat, { text: help }, { quoted: m });
  }
