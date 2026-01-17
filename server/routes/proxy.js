const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// LRU Cache with 10 min TTL
const cache = new NodeCache({ 
  stdTTL: 600,
  maxKeys: 1000
});

const HI_ANIME_API = 'https://nicolas-maduro.nescoroco.lat/api/v1';

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);
  
  if (cached) {
    console.log(`Cache hit: ${key}`);
    return res.json(cached);
  }
  
  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };
  
  next();
};

// PROXY ALL API REQUESTS EXACTLY AS SPECIFIED
router.get('/*', cacheMiddleware, async (req, res) => {
  try {
    // Build the exact API URL
    const apiPath = req.params[0];
    const queryString = req._parsedUrl.search || '';
    const apiUrl = `${HI_ANIME_API}${apiPath}${queryString}`;
    
    console.log(`📡 Proxying to: ${apiUrl}`);
    
    // Make request to HiAnime API
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AniLab/1.0',
        'Accept': 'application/json',
        'Referer': 'https://hianime.to/'
      },
      timeout: 15000
    });
    
    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.set('ETag', `"${Date.now()}"`);
    
    // Return the exact API response
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ API Proxy Error:', {
      url: req.originalUrl,
      error: error.message,
      status: error.response?.status
    });
    
    // Return error response matching API format
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'API request failed',
      error: error.message
    });
  }
});

module.exports = router;