import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
    await m.react('👋');

    // Números de los creadores con nombres personalizados
    let creators = [
        { number: '51933000214', name: 'Creador 1' },
        { number: '240222646582', name: 'Creador 2' },
        { number: '573244642273', name: 'Creador 3' }
    ];

    // Crear contactos para cada creador
    let contacts = creators.map(creator => {
        let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${creator.name}
TEL;waid=${creator.number}:${PhoneNumber('+' + creator.number).getNumber('international')}
END:VCARD`.trim();
        return { vcard };
    });

    // Enviar todos los contactos juntos
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: `Contactos de Creadores`,
            contacts: contacts
        }
    }, { quoted: m });
}

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño'];

export default handler;