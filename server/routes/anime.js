const express = require('express');
const { fetchFromHiAnime } = require('../utils/fetchHiAnime');
const router = express.Router();

// Get anime details
router.get('/:id/details', async (req, res) => {
    try {
        const animeId = req.params.id;
        const data = await fetchFromHiAnime(`/anime/${animeId}`);
        
        if (!data.success) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                ...data.data,
                // Format episodes for display
                episodes: formatEpisodes(data.data.episodes || []),
                // Format characters
                characters: data.data.characters?.slice(0, 10) || [],
                // Format recommendations
                recommendations: data.data.recommendations?.slice(0, 6) || []
            }
        });
        
    } catch (error) {
        console.error('Anime details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch anime details'
        });
    }
});

// Get anime episodes
router.get('/:id/episodes', async (req, res) => {
    try {
        const animeId = req.params.id;
        const data = await fetchFromHiAnime(`/anime/${animeId}`);
        
        const episodes = data.data?.episodes || [];
        
        // Group by season if available
        const groupedEpisodes = groupEpisodes(episodes);
        
        res.json({
            success: true,
            data: {
                animeId,
                title: data.data?.title || 'Unknown',
                episodes: groupedEpisodes,
                total: episodes.length,
                subCount: episodes.filter(e => e.language === 'sub').length,
                dubCount: episodes.filter(e => e.language === 'dub').length
            }
        });
        
    } catch (error) {
        console.error('Episodes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch episodes'
        });
    }
});

// Helper functions
function formatEpisodes(episodes) {
    return episodes.map(ep => ({
        id: ep.id,
        number: ep.number,
        title: ep.title || `Episode ${ep.number}`,
        language: ep.language || 'sub',
        thumbnail: ep.thumbnail || null,
        duration: ep.duration || '24m',
        isFiller: ep.isFiller || false
    }));
}

function groupEpisodes(episodes) {
    // Group by season number if available
    const seasons = {};
    
    episodes.forEach(ep => {
        const season = ep.season || 1;
        if (!seasons[season]) {
            seasons[season] = {
                season,
                episodes: []
            };
        }
        seasons[season].episodes.push(ep);
    });
    
    return Object.values(seasons);
}

module.exports = router;