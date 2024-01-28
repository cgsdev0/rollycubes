export default {
  async fetch(request: Request) {
    //Do anything before
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader || upgradeHeader === 'websocket') {
      return await fetch(
        new Request('wss://beta.rollycubes.com/list', request)
      );
    }
    //Or with other requests
  },
};
