export async function onRequest(context: EventContext<unknown, string, unknown>) {
  const response = await context.next();
  const url = new URL(context.request.url);

  // Apply protection to the .pages.dev staging/dev URLs
  if (url.hostname.endsWith('pages.dev')) {
    // Add HTTP Header for extra protection against indexing
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');

    // Only inject meta tags into HTML responses
    if (modifiedResponse.headers.get('content-type')?.includes('text/html')) {
      return new HTMLRewriter()
        .on('head', {
          element(element) {
            element.append('<meta name="robots" content="noindex, nofollow" />', { html: true });
          }
        })
        .transform(modifiedResponse);
    }
    return modifiedResponse;
  }

  // For the production custom domain
  if (response.headers.get('content-type')?.includes('text/html')) {
    return new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append('<link rel="canonical" href="https://training.tftiseasy.com/" />\n<meta name="robots" content="index, follow" />', { html: true });
        }
      })
      .transform(response);
  }

  return response;
}
