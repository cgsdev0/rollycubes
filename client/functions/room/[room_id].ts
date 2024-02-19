export const onRequest: PagesFunction<{}> = async (context) => {
  const { request, env } = context;

  const res = await env.ASSETS.fetch(request);
  return new HTMLRewriter().on('meta', new MetaHandler()).transform(res);
};

class MetaHandler implements HTMLRewriterElementContentHandlers {
  element(element: Element): void | Promise<void> {
    if (element.getAttribute('name') === 'description') {
      element.setAttribute('content', 'Join my rolly cubes session!');
      return;
    }
  }
}
