import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
    await m.react('👋');

    // Números de los creadores con sus roles específicos
    let creators = [
        { 
            number: '240222646582', 
            name: '👑 Creador del Bot',
            description: 'Propietario y creador principal'
        },
        { 
            number: '51933000214', 
            name: '💻 Desarrollador Principal',
            description: 'Encargado del desarrollo técnico'
        },
        { 
            number: '573135180876', 
            name: '🎨 Desarrollador y Editor',
            description: 'Desarrollo y diseño del bot'
        }
    ];

    // Crear contactos para cada creador con mejor formato
    let contacts = creators.map(creator => {
        let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${creator.name}
ORG:${creator.description}
TEL;waid=${creator.number}:${PhoneNumber('+' + creator.number).getNumber('international')}
X-ABLabel:${creator.name.split(' ')[0]} del Bot
NOTE:${creator.description}
END:VCARD`.trim();
        return { vcard };
    });

   
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: `👥 Equipo de Desarrollo`,
            contacts: contacts
        }
    }, { quoted: m });
}

handler.help = ["owner", "creador", "dueño", "equipo", "desarrolladores"];
handler.tags = ["info", "main"];
handler.command = ['owner', 'creador', 'dueño', 'equipo', 'devs', 'desarrolladores'];

export default handler;