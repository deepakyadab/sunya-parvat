/* Vercel serverless function: POST /api/enquiry */
const { handleEnquiry } = require('./_lib/enquiry');

module.exports = async (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const result = await handleEnquiry({ method: req.method, body, ip, origin: req.headers.origin });
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(result.status).send(JSON.stringify(result.body));
};
