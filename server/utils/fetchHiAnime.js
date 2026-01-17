const axios = require('axios');
const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
    stdTTL: 600, // 10 minutes
    checkperiod: 120,
    maxKeys: 1000
});

const HI_ANIME_API = 'https://nicolas-maduro.nescoroco.lat/api/v1';

async function fetchFromHiAnime(endpoint, options = {}) {
    const cacheKey = endpoint + JSON.stringify(options);
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        console.log(`Cache hit: ${endpoint}`);
        return cached;
    }
    
    try {
        console.log(`Fetching from API: ${endpoint}`);
        
        const response = await axios.get(`${HI_ANIME_API}${endpoint}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://hianime.to/',
                ...options.headers
            },
            params: options.params,
            timeout: 15000
        });
        
        const data = response.data;
        
        // Cache successful responses
        if (data.success !== false) {
            cache.set(cacheKey, data);
        }
        
        return data;
        
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error.message);
        
        // Return fallback data based on endpoint
        return getFallbackData(endpoint);
    }
}

function getFallbackData(endpoint) {
    // Provide fallback data when API fails
    if (endpoint.includes('/home')) {
        return {
            success: true,
            data: {
                spotlight: [{
                    title: "Attack on Titan",
                    alternativeTitle: "進撃の巨人",
                    id: "attack-on-titan",
                    poster: "/assets/placeholder.jpg",
                    rank: 1,
                    type: "TV",
                    quality: "HD",
                    duration: "24m",
                    aired: "2013-04-07",
                    synopsis: "Humanity fights for survival against giant humanoid creatures.",
                    episodes: { sub: 75, dub: 75, eps: 75 }
                }],
                trending: Array(6).fill(null).map((_, i) => ({
                    title: `Trending Anime ${i + 1}`,
                    id: `trending-${i + 1}`,
                    poster: "/assets/placeholder.jpg",
                    type: i % 3 === 0 ? "TV" : "Movie",
                    rating: 8.5 - (i * 0.1),
                    duration: "24m"
                })),
                recent: Array(12).fill(null).map((_, i) => ({
                    title: `Recently Added ${i + 1}`,
                    id: `recent-${i + 1}`,
                    poster: "/assets/placeholder.jpg",
                    episode: i + 1,
                    number: i + 1,
                    language: i % 2 === 0 ? 'sub' : 'dub'
                }))
            }
        };
    }
    
    // Generic fallback
    return {
        success: false,
        message: "API unavailable",
        data: {}
    };
}

// Clear cache endpoint (for development)
function clearCache() {
    cache.flushAll();
    console.log('Cache cleared');
}

module.exports = {
    fetchFromHiAnime,
    clearCache
};