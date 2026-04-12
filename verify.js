const http = require('http');
const https = require('https');

// ── CONFIGURATION ── (User: Replace with your actual LS API Key)
const LS_API_KEY = process.env.LS_API_KEY || 'your_lemon_squeezy_api_key_here';
const PORT = 3001;

/**
 * Verifies a license key with Lemon Squeezy API
 * @param {string} licenseKey
 */
function verifyLicense(licenseKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ license_key: licenseKey });
    const options = {
      hostname: 'api.lemonsqueezy.com',
      path: '/v1/licenses/validate',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LS_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', e => reject(e));
    req.write(data);
    req.end();
  });
}

// ── SIMPLE SERVER ──
http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.end(); return; }

  if (req.url === '/api/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { key } = JSON.parse(body);
        if (!key) throw new Error('No key provided');
        
        const result = await verifyLicense(key);
        // We only return the essential status to the client
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          valid: result.valid, 
          status: result.license_key?.status,
          user: result.meta?.customer_name 
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`Bimp.us License Proxy running on port ${PORT}`);
});
