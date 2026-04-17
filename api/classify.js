const https = require('https');

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendJSON(res, statusCode, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(statusCode).json(body);
}

function errorResponse(res, statusCode, message) {
  sendJSON(res, statusCode, { status: 'error', message });
}

function fetchGenderize(name) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.genderize.io/?name=${encodeURIComponent(name)}`;
    const req = https.get(apiUrl, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON from Genderize API'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(4500, () => {
      req.destroy(new Error('Genderize API timeout'));
    });
  });
}

// ── Vercel Serverless Handler ─────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  const { name } = req.query;

  // Input validation
  if (name === undefined || name === '') {
    return errorResponse(res, 400, 'Missing or empty name parameter');
  }

  if (typeof name !== 'string') {
    return errorResponse(res, 422, 'Name must be a string');
  }

  // Call Genderize
  let apiData;
  try {
    apiData = await fetchGenderize(name);
  } catch (err) {
    return errorResponse(res, 502, 'Failed to reach Genderize API');
  }

  // Genderize edge cases
  if (!apiData.gender || !apiData.count || apiData.count === 0) {
    return errorResponse(res, 200, 'No prediction available for the provided name');
  }

  // Process response
  const probability  = apiData.probability;
  const sample_size  = apiData.count;
  const is_confident = probability >= 0.7 && sample_size >= 100;

  sendJSON(res, 200, {
    status: 'success',
    data: {
      name:         apiData.name,
      gender:       apiData.gender,
      probability,
      sample_size,
      is_confident,
      processed_at: new Date().toISOString(),
    },
  });
};
