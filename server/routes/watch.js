const express = require('express');
const { fetchFromHiAnime } = require('../utils/fetchHiAnime');
const router = express.Router();

// Get watch data (episode info and sources)
router.get('/:id/data', async (req, res) => {
    try {
        const animeId = req.params.id;
        const episode = parseInt(req.query.ep) || 1;
        const language = req.query.lang || 'sub';
        
        // Fetch anime details
        const animeData = await fetchFromHiAnime(`/anime/${animeId}`);
        
        if (!animeData.success) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }
        
        // Find the specific episode
        const episodes = animeData.data?.episodes || [];
        const currentEp = episodes.find(e => 
            e.number === episode && 
            (e.language === language || !e.language)
        ) || episodes[0] || {};
        
        // Get episode sources
        const sources = await getEpisodeSources(animeId, episode, language);
        
        // Get next/previous episodes
        const epIndex = episodes.findIndex(e => e.id === currentEp.id);
        const nextEp = epIndex < episodes.length - 1 ? episodes[epIndex + 1] : null;
        const prevEp = epIndex > 0 ? episodes[epIndex - 1] : null;
        
        res.json({
            success: true,
            data: {
                anime: {
                    id: animeId,
                    title: animeData.data.title,
                    poster: animeData.data.poster,
                    type: animeData.data.type,
                    status: animeData.data.status
                },
                episode: {
                    ...currentEp,
                    sources: sources,
                    // Generate Megaplay embed URL
                    embedUrl: generateEmbedUrl(currentEp.id || `${animeId}-${episode}`, language)
                },
                navigation: {
                    current: episode,
                    next: nextEp ? {
                        number: nextEp.number,
                        id: nextEp.id
                    } : null,
                    previous: prevEp ? {
                        number: prevEp.number,
                        id: prevEp.id
                    } : null
                },
                episodes: episodes.slice(0, 50) // Limit episodes for performance
            }
        });
        
    } catch (error) {
        console.error('Watch data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch watch data'
        });
    }
});

// Continue watching API
router.post('/continue-watching', (req, res) => {
    try {
        const { animeId, episode, timestamp, title, poster } = req.body;
        
        if (!animeId) {
            return res.status(400).json({
                success: false,
                message: 'Missing animeId'
            });
        }
        
        // In a real app, you'd save to database
        // For now, just acknowledge receipt
        console.log('Continue watching saved:', { animeId, episode, timestamp });
        
        res.json({
            success: true,
            message: 'Progress saved',
            data: {
                animeId,
                episode,
                timestamp,
                resumeUrl: `/watch/${animeId}?ep=${episode}`
            }
        });
        
    } catch (error) {
        console.error('Save progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save progress'
        });
    }
});

// Helper functions
async function getEpisodeSources(animeId, episode, language) {
    try {
        // Try to fetch from watch endpoint
        const response = await fetchFromHiAnime(`/watch/${animeId}?ep=${episode}`);
        
        if (response.success && response.data) {
            return response.data.sources || [];
        }
        
        // Fallback to Megaplay only
        return [{
            type: 'embed',
            url: generateEmbedUrl(`${animeId}-${episode}`, language),
            quality: 'HD',
            isM3U8: false
        }];
        
    } catch (error) {
        console.error('Source fetch error:', error);
        return [{
            type: 'embed',
            url: generateEmbedUrl(`${animeId}-${episode}`, language),
            quality: 'HD',
            isM3U8: false
        }];
    }
}

function generateEmbedUrl(episodeId, language) {
    // Format: https://megaplay.buzz/stream/s-2/{episode-id}/{sub|dub}
    const cleanId = episodeId.replace(/[^a-zA-Z0-9-]/g, '');
    return `https://megaplay.buzz/stream/s-2/${cleanId}/${language}`;
}

module.exports = router;