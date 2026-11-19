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
const geminiService = require('./geminiService');

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
      const { text, context } = await readJsonBody(req);
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return sendJson(res, 400, { error: 'Please provide a description of the problem.' });
      }

      const result = await geminiService.analyzeText(text.trim());
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

  // Smart Photo Analysis Endpoint
  if (pathname === '/api/analyze-image' && method === 'POST') {
    try {
      const { image, mimeType, description, filename } = await readJsonBody(req);
      if (!image) {
        return sendJson(res, 400, { error: 'No image data received.' });
      }

      const result = await geminiService.analyzePhoto(image, mimeType || 'image/jpeg', description || filename || '');
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
