export default async function handler(_req, res) {
  return res.status(410).json({
    error: 'GitHub login has been removed from this site.',
  });
}