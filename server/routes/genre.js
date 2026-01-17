const express = require('express');
const { fetchFromHiAnime } = require('../utils/fetchHiAnime');
const router = express.Router();

// Get anime by genre
router.get('/:genre', async (req, res) => {
    try {
        const { genre } = req.params;
        const { page = 1, sort = 'popularity' } = req.query;
        
        // Fetch genre data from API
        const data = await fetchFromHiAnime(`/filter`, {
            params: {
                genres: genre,
                page,
                sort
            }
        });
        
        if (!data.success) {
            return res.status(404).json({
                success: false,
                message: `No anime found for genre: ${genre}`
            });
        }
        
        // Format response
        const formattedData = {
            genre: formatGenreName(genre),
            anime: data.data.results || [],
            pagination: {
                current: parseInt(page),
                total: data.data.totalPages || 1,
                hasNext: data.data.hasNextPage || false,
                hasPrev: page > 1
            },
            stats: {
                total: data.data.total || 0,
                averageRating: calculateAverageRating(data.data.results),
                topSubgenres: getTopSubgenres(data.data.results)
            }
        };
        
        res.json({
            success: true,
            data: formattedData
        });
        
    } catch (error) {
        console.error('Genre route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch genre data'
        });
    }
});

// Get popular genres
router.get('/', async (req, res) => {
    try {
        // Common anime genres with sample data
        const popularGenres = [
            { id: 'action', name: 'Action', count: 2456, icon: 'fa-fist-raised', color: 'red' },
            { id: 'adventure', name: 'Adventure', count: 1890, icon: 'fa-mountain', color: 'blue' },
            { id: 'comedy', name: 'Comedy', count: 3120, icon: 'fa-laugh', color: 'yellow' },
            { id: 'drama', name: 'Drama', count: 2780, icon: 'fa-theater-masks', color: 'pink' },
            { id: 'fantasy', name: 'Fantasy', count: 1950, icon: 'fa-dragon', color: 'purple' },
            { id: 'romance', name: 'Romance', count: 1670, icon: 'fa-heart', color: 'red' },
            { id: 'sci-fi', name: 'Sci-Fi', count: 890, icon: 'fa-robot', color: 'green' },
            { id: 'slice-of-life', name: 'Slice of Life', count: 1230, icon: 'fa-home', color: 'teal' },
            { id: 'sports', name: 'Sports', count: 450, icon: 'fa-football-ball', color: 'orange' },
            { id: 'supernatural', name: 'Supernatural', count: 1340, icon: 'fa-ghost', color: 'indigo' },
            { id: 'mystery', name: 'Mystery', count: 980, icon: 'fa-search', color: 'gray' },
            { id: 'horror', name: 'Horror', count: 670, icon: 'fa-skull', color: 'black' }
        ];
        
        res.json({
            success: true,
            data: {
                genres: popularGenres,
                totalGenres: popularGenres.length,
                mostPopular: popularGenres.sort((a, b) => b.count - a.count).slice(0, 5)
            }
        });
        
    } catch (error) {
        console.error('Genres list error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch genres list'
        });
    }
});

// Helper functions
function formatGenreName(genreId) {
    const genreMap = {
        'action': 'Action',
        'adventure': 'Adventure',
        'comedy': 'Comedy',
        'drama': 'Drama',
        'fantasy': 'Fantasy',
        'romance': 'Romance',
        'sci-fi': 'Sci-Fi',
        'slice-of-life': 'Slice of Life',
        'sports': 'Sports',
        'supernatural': 'Supernatural',
        'mystery': 'Mystery',
        'horror': 'Horror',
        'mecha': 'Mecha',
        'psychological': 'Psychological',
        'thriller': 'Thriller',
        'isekai': 'Isekai'
    };
    
    return genreMap[genreId] || genreId.charAt(0).toUpperCase() + genreId.slice(1);
}

function calculateAverageRating(animeList) {
    if (!animeList || animeList.length === 0) return 0;
    
    const total = animeList.reduce((sum, anime) => {
        return sum + (parseFloat(anime.rating) || 0);
    }, 0);
    
    return (total / animeList.length).toFixed(2);
}

function getTopSubgenres(animeList, limit = 5) {
    const subgenreCount = {};
    
    animeList.forEach(anime => {
        if (anime.genres) {
            anime.genres.forEach(genre => {
                subgenreCount[genre] = (subgenreCount[genre] || 0) + 1;
            });
        }
    });
    
    return Object.entries(subgenreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([genre, count]) => ({ genre, count }));
}

module.exports = router;