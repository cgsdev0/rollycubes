export const onRequest: PagesFunction<{}> = async (context) => {
  const request = context.request;
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader || upgradeHeader === 'websocket') {
    const url = new URL(request.url);
    console.log(
      'wss://beta.rollycubes.com' + url.pathname + (url.search || '')
    );
    return await fetch(
      'wss://beta.rollycubes.com' + url.pathname + (url.search || ''),
      request
    );
  }
};
