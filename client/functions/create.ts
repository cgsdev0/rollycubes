export const onRequest: PagesFunction<{}> = async (context) => {
  const request = context.request;
    const url = new URL(request.url);
    return await fetch(
      url.protocol + '//prod.rollycubes.com' + url.pathname + (url.search || ''),
      request
    );
};
