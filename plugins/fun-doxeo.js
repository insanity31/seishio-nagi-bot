// By DuarteXV 
import { performance } from 'perf_hooks'

var handler = async (m, { conn, text }) => {
    let who;
    let userName;

    if (m.isGroup) {
        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
            userName = await conn.getName(who);
        } else if (m.quoted) {
            who = m.quoted.sender;
            userName = await conn.getName(who);
        } else {
            who = m.chat;
        }
    } else {
        who = m.chat;
    }

    if (!who) return conn.reply(m.chat, `${emoji} Por favor, ingrese el tag de algún usuario o responda a un mensaje.`, m);

    if (!userName) {
        userName = text || 'Usuario desconocido';
    }

    let start = `🔍 *Iniciando escaneo...*`;
    let progress = `*${pickRandom(['10','15','20','25','30'])}%* - Buscando huellas digitales`;
    let progress2 = `*${pickRandom(['35','40','45','50','55'])}%* - Rastreando conexiones`;
    let progress3 = `*${pickRandom(['60','65','70','75','80'])}%* - Analizando metadatos`;
    let progress4 = `*${pickRandom(['85','88','92','95','97'])}%* - Compilando información`;
    let progress5 = `*100%* - Escaneo completado`;

    const { key } = await conn.sendMessage(m.chat, { text: `${start}` }, { quoted: m });
    await delay(1200);
    await conn.sendMessage(m.chat, { text: `${progress}`, edit: key });
    await delay(1200);
    await conn.sendMessage(m.chat, { text: `${progress2}`, edit: key });
    await delay(1200);
    await conn.sendMessage(m.chat, { text: `${progress3}`, edit: key });
    await delay(1200);
    await conn.sendMessage(m.chat, { text: `${progress4}`, edit: key });
    await delay(1200);
    await conn.sendMessage(m.chat, { text: `${progress5}`, edit: key });

    let old = performance.now();
    let neww = performance.now();
    let speed = `${(neww - old).toFixed(2)}`;
    
    // Generar IP aleatoria más realista
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // ISP realistas
    const isps = ['Claro', 'Movistar', 'Entel', 'Bitel', 'DirectTV', 'Telefónica', 'VTR', 'Tigo', 'Digitel'];
    const isp = pickRandom(isps);
    
    // Proveedores realistas
    const providers = ['Google', 'Cloudflare', 'OpenDNS', 'Quad9', 'CleanBrowsing'];
    const dns = pickRandom(providers);
    
    // Tipos de conexión realistas
    const connectionTypes = ['Fibra óptica', 'ADSL', 'Cable módem', '4G/LTE', 'WiFi', 'Satelital'];
    const connectionType = pickRandom(connectionTypes);

    let doxeo = `👤 *Información de red obtenida* 
═══════════════════════

📅 Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Hora: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}

📊 *Datos técnicos:*

• *Nombre:* ${userName}
• *IP Pública:* ${ip}
• *ISP:* ${isp}
• *Tipo de conexión:* ${connectionType}
• *DNS primario:* ${dns}
• *Gateway:* 192.168.${Math.floor(Math.random() * 255)}.1
• *Máscara de subred:* 255.255.255.0
• *Puertos abiertos:* ${pickRandom(['443 (HTTPS)', '80 (HTTP)', '22 (SSH)', '25 (SMTP)', '53 (DNS)'])}
• *Latencia aproximada:* ${Math.floor(Math.random() * 100) + 20}ms
• *Velocidad estimada:* ${Math.floor(Math.random() * 100) + 10} Mbps
• *Tiempo de escaneo:* ${speed}ms

⚠️ *Nota:* Esta información es simulada y generada aleatoriamente con fines de entretenimiento. No representa datos reales de ningún usuario.

📍 *Ubicación aproximada:* Ciudad principal del país del ISP
🛡️ *Estado del firewall:* ${pickRandom(['Activo', 'Moderado', 'Configuración básica'])}
📱 *Dispositivo detectado:* ${pickRandom(['Smartphone', 'PC Windows', 'Mac', 'Linux', 'Tablet'])}

═══════════════════════
🔐 *Recuerda:* Protege siempre tu información personal y utiliza conexiones seguras.*`;

    m.reply(doxeo, null, { mentions: conn.parseMention(doxeo) });
}

handler.help = ['doxear'];
handler.tags = ['fun'];
handler.command = ['doxear', 'doxxeo', 'doxeo'];
handler.register = true;
handler.group = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));