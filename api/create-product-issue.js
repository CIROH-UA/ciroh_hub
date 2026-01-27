export default async function handler(_req, res) {
  return res.status(410).json({
    error: 'Server-side issue creation has been removed from this site.',
    next:
      'Create a request via https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=product-request.md',
  });
}