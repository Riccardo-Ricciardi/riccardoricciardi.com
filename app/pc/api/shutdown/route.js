export async function POST(request) {
  const { pin } = await request.json();
  if (pin !== process.env.WOL_PIN) {
    return Response.json({ error: 'PIN non valido' }, { status: 401 });
  }
  try {
    const res = await fetch('http://home.riccardoricciardi.com:9090/shutdown', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    return Response.json({ success: true, message: 'Spegnimento avviato!' });
  } catch {
    return Response.json({ error: 'PC non raggiungibile' }, { status: 500 });
  }
}
