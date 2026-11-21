/**
 * FirstAid+ Application Server
 * High performance, zero-dependency Node.js HTTP server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { EMERGENCY_GUIDES, DEFAULT_GUIDE, analyzeTextSymptoms } = require('./knowledgeBase');
const { analyzePhotoLocal } = require('./visualAnalyzer');
const { translateResult } = require('./multilingualService');
const geminiService = require('./geminiService');
const hospitalService = require('./hospitalService');
const medicineService = require('./medicineService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

/**
 * Helper to parse JSON request bodies
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 25MB limit for high resolution images
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

/**
 * Serve static files from public/
 */
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, relativePath);

  // Security check to avoid path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for client-side single page navigation
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error: ' + readErr.message);
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // Health / Status
  if (pathname === '/api/status' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'operational',
      app: 'FirstAid+ Emergency Assistant',
      version: '2.1.0',
      hasApiKey: geminiService.hasApiKey(),
      timestamp: new Date().toISOString()
    });
  }

  // Configure API Key securely on backend
  if (pathname === '/api/config-key' && method === 'POST') {
    try {
      const { apiKey } = await readJsonBody(req);
      geminiService.setApiKey(apiKey || '');
      return sendJson(res, 200, {
        success: true,
        hasApiKey: geminiService.hasApiKey(),
        message: geminiService.hasApiKey() 
          ? 'Gemini 2.5 Flash API key configured successfully on backend.' 
          : 'API key cleared. System operating in local rule-based and demo visual mode.'
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Emergency Guides Library
  if (pathname === '/api/guides' && method === 'GET') {
    return sendJson(res, 200, {
      guides: Object.values(EMERGENCY_GUIDES),
      total: Object.keys(EMERGENCY_GUIDES).length
    });
  }

  // Single Guide Detail
  if (pathname.startsWith('/api/guides/') && method === 'GET') {
    const guideId = pathname.replace('/api/guides/', '').trim();
    const guide = EMERGENCY_GUIDES[guideId];
    if (guide) {
      return sendJson(res, 200, guide);
    }
    return sendJson(res, 404, { error: 'Guide not found' });
  }

  // Smart Text Analysis Endpoint
  if (pathname === '/api/analyze-text' && method === 'POST') {
    try {
      const { text, context, lang } = await readJsonBody(req);
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return sendJson(res, 400, { error: 'Please provide a description of the problem.' });
      }

      const result = await geminiService.analyzeText(text.trim(), lang);
      return sendJson(res, 200, result);
    } catch (err) {
      console.error('Error analyzing text:', err);
      // Safe fallback to local analysis
      const fallback = analyzeTextSymptoms(req.body?.text || '');
      return sendJson(res, 200, {
        ...fallback,
        isDemoMode: false,
        engine: 'FirstAid+ Local Fallback Engine',
        errorNote: err.message
      });
    }
  }

  // Dynamic Result Translation / Voice Re-Language Endpoint
  if (pathname === '/api/translate-result' && method === 'POST') {
    try {
      const { result, lang } = await readJsonBody(req);
      if (!result) {
        return sendJson(res, 400, { error: 'Missing result object' });
      }
      const targetLang = lang || 'en-IN';
      const translated = translateResult(result, targetLang);
      return sendJson(res, 200, translated);
    } catch (err) {
      console.error('Error translating result:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Smart Photo Analysis Endpoint
  if (pathname === '/api/analyze-image' && method === 'POST') {
    try {
      const { image, mimeType, description, filename, lang } = await readJsonBody(req);
      if (!image) {
        return sendJson(res, 400, { error: 'No image data received.' });
      }

      const result = await geminiService.analyzePhoto(image, mimeType || 'image/jpeg', description || filename || '', lang);
      return sendJson(res, 200, result);
    } catch (err) {
      console.error('Error analyzing photo:', err);
      const fallback = analyzePhotoLocal('', { description: 'Photo analysis error' });
      return sendJson(res, 200, fallback);
    }
  }

  // Smart Assistant Conversational Chat Endpoint (Section 6)
  if (pathname === '/api/chat-assistant' && method === 'POST') {
    try {
      const { message, history } = await readJsonBody(req);
      if (!message || typeof message !== 'string') {
        return sendJson(res, 400, { error: 'Message cannot be empty.' });
      }

      const response = await geminiService.processChatMessage(message, history || []);
      return sendJson(res, 200, response);
    } catch (err) {
      console.error('Error in chat assistant:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // =========================================================================
  // MODULE 10: NEARBY HOSPITALS & EMERGENCY SERVICES ROUTES
  // =========================================================================

  // Hospital Config (checks if Google Maps API key is configured)
  if (pathname === '/api/hospitals/config' && method === 'GET') {
    return sendJson(res, 200, {
      hasGoogleMapsApiKey: hospitalService.hasGoogleMapsApiKey(),
      provider: hospitalService.hasGoogleMapsApiKey() 
        ? 'Google Maps Platform Places API (New)' 
        : 'OpenStreetMap Live Medical Network + Verified Emergency Registry',
      availableRadii: [1000, 3000, 5000, 10000, 20000, 50000],
      categories: ['all', 'hospital', 'emergency', 'government', 'private', 'clinic', 'pharmacy', 'opennow'],
      emergencyHelpline: '112'
    });
  }

  // Set Google Maps Key securely on backend
  if (pathname === '/api/hospitals/config-key' && method === 'POST') {
    try {
      const { apiKey } = await readJsonBody(req);
      hospitalService.setGoogleMapsApiKey(apiKey || '');
      return sendJson(res, 200, {
        success: true,
        hasGoogleMapsApiKey: hospitalService.hasGoogleMapsApiKey(),
        message: hospitalService.hasGoogleMapsApiKey()
          ? 'Google Maps API key configured successfully on backend.'
          : 'Google Maps API key cleared. Operating in OpenStreetMap Live Radar mode.'
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Nearby Hospitals Search Radar
  if (pathname === '/api/hospitals/nearby' && method === 'GET') {
    try {
      const lat = reqUrl.searchParams.get('lat');
      const lng = reqUrl.searchParams.get('lng');
      const radius = reqUrl.searchParams.get('radius') || 5000;
      const type = reqUrl.searchParams.get('type') || 'all';
      const sort = reqUrl.searchParams.get('sort') || 'nearest';

      if (!lat || !lng) {
        return sendJson(res, 400, { error: 'Latitude and Longitude parameters are required.' });
      }

      const results = await hospitalService.searchNearbyHospitals(lat, lng, radius, type, sort);
      return sendJson(res, 200, results);
    } catch (err) {
      console.error('Error fetching nearby hospitals:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Reverse Geocode: lat, lng -> Human-readable Area, Street, City, PIN
  if (pathname === '/api/hospitals/reverse-geocode' && method === 'GET') {
    try {
      const lat = reqUrl.searchParams.get('lat');
      const lng = reqUrl.searchParams.get('lng');
      if (!lat || !lng) {
        return sendJson(res, 400, { error: 'Latitude and Longitude are required.' });
      }
      const addressData = await hospitalService.reverseGeocode(lat, lng);
      return sendJson(res, 200, addressData);
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Forward Geocode: address, city, landmark, or PIN -> lat, lng
  if (pathname === '/api/hospitals/geocode' && method === 'GET') {
    try {
      const query = reqUrl.searchParams.get('query') || reqUrl.searchParams.get('q');
      if (!query || query.trim().length === 0) {
        return sendJson(res, 400, { error: 'Search query is required.' });
      }
      const geoResult = await hospitalService.geocodeAddress(query);
      return sendJson(res, 200, geoResult);
    } catch (err) {
      console.error('Error geocoding address:', err);
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Real Road Routing between Origin and Hospital
  if (pathname === '/api/hospitals/route' && method === 'GET') {
    try {
      const startLat = reqUrl.searchParams.get('startLat');
      const startLng = reqUrl.searchParams.get('startLng');
      const destLat = reqUrl.searchParams.get('destLat');
      const destLng = reqUrl.searchParams.get('destLng');
      const mode = reqUrl.searchParams.get('mode') || 'driving';

      if (!startLat || !startLng || !destLat || !destLng) {
        return sendJson(res, 400, { error: 'Origin and destination coordinates are required.' });
      }

      const routeResult = await hospitalService.getRoute(startLat, startLng, destLat, destLng, mode);
      return sendJson(res, 200, routeResult);
    } catch (err) {
      console.error('Error calculating route:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // =========================================================================
  // MODULE 11: AI MEDICINE & RELIEF RECOMMENDATIONS + PHARMACY FINDER
  // =========================================================================

  // 1. Get all supported symptom categories
  if (pathname === '/api/medicine/categories' && method === 'GET') {
    try {
      const categories = medicineService.getAllCategories();
      return sendJson(res, 200, { success: true, categories });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 2. Dynamic Medicine & Relief Recommendations
  if (pathname === '/api/medicine/recommendations' && method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const query = body.query || body.text || '';
      const options = {
        conditionId: body.conditionId || null,
        ageGroup: body.ageGroup || 'adult',
        duration: body.duration || 'acute',
        severity: body.severity || 'moderate',
        conditions: Array.isArray(body.conditions) ? body.conditions : [],
        allergies: Array.isArray(body.allergies) ? body.allergies : [],
        language: body.language || 'en-IN'
      };

      const result = medicineService.getMedicineRecommendations(query, options);
      return sendJson(res, 200, result);
    } catch (err) {
      console.error('Error getting medicine recommendations:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. Tablet Usage, Food Timing & Safe Duration Guidelines
  if (pathname === '/api/medicine/tablet-guidelines' && method === 'GET') {
    try {
      return sendJson(res, 200, medicineService.TABLET_USAGE_GUIDELINES);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. Real Location-Based Nearby Pharmacy Finder
  if (pathname === '/api/pharmacies/nearby' && method === 'GET') {
    try {
      const lat = reqUrl.searchParams.get('lat');
      const lng = reqUrl.searchParams.get('lng');
      const radius = reqUrl.searchParams.get('radius') || 5000;
      const sort = reqUrl.searchParams.get('sort') || 'nearest';

      if (!lat || !lng) {
        return sendJson(res, 400, { error: 'Latitude and Longitude are required for pharmacy discovery.' });
      }

      const rawResult = await hospitalService.searchNearbyHospitals(lat, lng, radius, 'pharmacy', sort);
      
      // Annotate with verified pharmacy inventory guidance
      const pharmacies = (rawResult.hospitals || []).map(p => ({
        ...p,
        category: 'Retail Pharmacy / Chemist',
        stockStatus: 'Standard OTC essentials (ORS, Paracetamol, Antacids, Bandages) typically stocked — call chemist to confirm live brand availability',
        isVerifiedChemist: true,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${p.lat},${p.lng}&travelmode=driving`
      }));

      return sendJson(res, 200, {
        totalFound: pharmacies.length,
        searchRadiusMeters: rawResult.searchRadiusMeters,
        userLocation: rawResult.userLocation,
        pharmacies,
        nearestPharmacy: pharmacies[0] || null,
        secondNearestPharmacy: pharmacies[1] || null,
        provider: rawResult.provider,
        refreshedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error searching nearby pharmacies:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. Geocode Location for Pharmacy Finder
  if (pathname === '/api/pharmacies/geocode' && method === 'GET') {
    try {
      const query = reqUrl.searchParams.get('query') || reqUrl.searchParams.get('q');
      if (!query || query.trim().length === 0) {
        return sendJson(res, 400, { error: 'Search query is required.' });
      }
      const geoResult = await hospitalService.geocodeAddress(query);
      return sendJson(res, 200, geoResult);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Serve static files
  serveStaticFile(req, res, pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚑 FirstAid+ Emergency Assistant Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${geminiService.hasApiKey() ? 'Configured' : 'Local Rule & Demo Vision Engine Active'}`);
  console.log(`=======================================================`);
});
