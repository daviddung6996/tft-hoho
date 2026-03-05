export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Dev site: completely block crawling
  if (url.hostname.endsWith('pages.dev')) {
    return new Response('User-agent: *\nDisallow: /', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Prod site: allow all + reference to sitemap
  return new Response('User-agent: *\nDisallow:\nSitemap: https://training.tftiseasy.com/sitemap.xml', {
    headers: { 'Content-Type': 'text/plain' }
  });
}
