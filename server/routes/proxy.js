const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// LRU Cache with 10 min TTL
const cache = new NodeCache({ 
  stdTTL: 600,
  maxKeys: 1000,
  useClones: false 
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

// Proxy all API requests
router.get('/*', cacheMiddleware, async (req, res) => {
  try {
    const apiUrl = `${HI_ANIME_API}${req.params[0]}${req._parsedUrl.search || ''}`;
    
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AniLab/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.set('ETag', `"${Date.now()}"`);
    
    res.json(response.data);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Return fallback data if API fails
    if (req.path.includes('/home')) {
      res.json({
        success: true,
        data: {
          spotlight: getFallbackSpotlight(),
          trending: getFallbackTrending(),
          recent: getFallbackRecent()
        }
      });
    } else {
      res.status(502).json({
        success: false,
        message: 'API temporarily unavailable',
        data: {}
      });
    }
  }
});

// Fallback data functions
function getFallbackSpotlight() {
  return [{
    title: "One Piece",
    alternativeTitle: "ワンピース",
    id: "one-piece",
    poster: "/assets/placeholder.jpg",
    rank: 1,
    type: "TV",
    quality: "HD",
    duration: "24m",
    aired: "1999-10-20",
    synopsis: "The legendary pirate adventure continues...",
    episodes: { sub: 1090, dub: 1080, eps: 1090 }
  }];
}

// ... more fallback functions

module.exports = router;