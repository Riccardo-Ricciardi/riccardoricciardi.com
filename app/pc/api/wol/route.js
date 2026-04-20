import dgram from 'dgram';

function createMagicPacket(mac) {
  const macBuffer = Buffer.from(mac.replace(/[:\-]/g, ''), 'hex');
  const magicPacket = Buffer.alloc(102);
  for (let i = 0; i < 6; i++) magicPacket[i] = 0xff;
  for (let i = 1; i <= 16; i++) macBuffer.copy(magicPacket, i * 6);
  return magicPacket;
}

export async function POST(request) {
  const { pin } = await request.json();
  if (pin !== process.env.WOL_PIN) {
    return Response.json({ error: 'PIN non valido' }, { status: 401 });
  }
  const mac = process.env.PC_MAC;
  if (!mac) return Response.json({ error: 'MAC non configurato' }, { status: 500 });

  return new Promise((resolve) => {
    const client = dgram.createSocket('udp4');
    const packet = createMagicPacket(mac);
    client.bind(() => {
      client.setBroadcast(true);
      client.send(packet, 0, packet.length, 9, '255.255.255.255', (err) => {
        client.close();
        if (err) resolve(Response.json({ error: 'Errore invio pacchetto' }, { status: 500 }));
        else resolve(Response.json({ success: true, message: 'Magic Packet inviato! Il PC si accenderà a breve.' }));
      });
    });
  });
}
