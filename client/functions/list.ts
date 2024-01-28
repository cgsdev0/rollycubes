export async function onRequest(request: Request) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader || upgradeHeader === 'websocket') {
    return await fetch('wss://beta.rollycubes.com/list', request);
  }
}
