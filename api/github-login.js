export default function handler(_req, res) {
  return res.status(410).json({
    error: 'GitHub login has been removed from this site.',
    next: {
      productIssueUrl:
        'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=product-request.md',
      blogIssueUrl:
        'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md',
    },
  });
}