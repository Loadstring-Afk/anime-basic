const express = require('express');
const { fetchFromHiAnime } = require('../utils/fetchHiAnime');
const router = express.Router();

// Advanced anime filtering
router.get('/', async (req, res) => {
    try {
        // Extract query parameters
        const {
            q = '', // Search query
            genres = '',
            types = '',
            status = '',
            rating = '',
            year = '',
            season = '',
            sort = 'popularity',
            order = 'desc',
            page = 1,
            limit = 24
        } = req.query;
        
        // Build filter object for API
        const filters = {};
        
        if (q) filters.q = q;
        if (genres) filters.genres = genres.split(',');
        if (types) filters.type = types.split(',');
        if (status) filters.status = status.split(',');
        if (rating) filters.rating = rating.split(',');
        if (year) filters.year = parseInt(year);
        if (season) filters.season = season;
        
        // Prepare API parameters
        const apiParams = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order
        };
        
        // Add filters to params
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key].length > 0) {
                apiParams[key] = Array.isArray(filters[key]) ? filters[key].join(',') : filters[key];
            }
        });
        
        // Fetch filtered data from API
        const data = await fetchFromHiAnime('/filter', { params: apiParams });
        
        if (!data.success) {
            return res.status(404).json({
                success: false,
                message: 'No results found'
            });
        }
        
        // Format response
        const formattedData = {
            results: data.data.results || [],
            pagination: {
                current: parseInt(page),
                total: data.data.totalPages || 1,
                totalItems: data.data.total || 0,
                hasNext: data.data.hasNextPage || false,
                hasPrev: page > 1,
                limit: parseInt(limit)
            },
            filters: {
                applied: filters,
                available: await getAvailableFilters(filters)
            },
            sortOptions: [
                { value: 'popularity', label: 'Most Popular' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'title', label: 'Title A-Z' },
                { value: 'release_date', label: 'Release Date' },
                { value: 'episodes', label: 'Episode Count' }
            ]
        };
        
        res.json({
            success: true,
            data: formattedData
        });
        
    } catch (error) {
        console.error('Filter route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to filter anime'
        });
    }
});

// Get available filter options
router.get('/options', async (req, res) => {
    try {
        const filterOptions = {
            genres: [
                { id: 'action', name: 'Action', count: 2456 },
                { id: 'adventure', name: 'Adventure', count: 1890 },
                { id: 'comedy', name: 'Comedy', count: 3120 },
                { id: 'drama', name: 'Drama', count: 2780 },
                { id: 'fantasy', name: 'Fantasy', count: 1950 },
                { id: 'romance', name: 'Romance', count: 1670 },
                { id: 'sci-fi', name: 'Sci-Fi', count: 890 },
                { id: 'slice-of-life', name: 'Slice of Life', count: 1230 },
                { id: 'sports', name: 'Sports', count: 450 },
                { id: 'supernatural', name: 'Supernatural', count: 1340 }
            ],
            types: [
                { id: 'tv', name: 'TV', count: 4560 },
                { id: 'movie', name: 'Movie', count: 890 },
                { id: 'ova', name: 'OVA', count: 1230 },
                { id: 'ona', name: 'ONA', count: 560 },
                { id: 'special', name: 'Special', count: 780 }
            ],
            status: [
                { id: 'airing', name: 'Currently Airing', count: 45 },
                { id: 'completed', name: 'Completed', count: 6890 },
                { id: 'upcoming', name: 'Upcoming', count: 120 }
            ],
            ratings: [
                { id: 'g', name: 'G - All Ages', count: 1230 },
                { id: 'pg', name: 'PG - Children', count: 2340 },
                { id: 'pg13', name: 'PG-13 - Teens 13+', count: 3450 },
                { id: 'r17', name: 'R - 17+', count: 1890 }
            ],
            years: generateYearRange(1980, 2024),
            seasons: [
                { id: 'winter', name: 'Winter' },
                { id: 'spring', name: 'Spring' },
                { id: 'summer', name: 'Summer' },
                { id: 'fall', name: 'Fall' }
            ]
        };
        
        res.json({
            success: true,
            data: filterOptions
        });
        
    } catch (error) {
        console.error('Filter options error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filter options'
        });
    }
});

// Helper functions
async function getAvailableFilters(currentFilters) {
    // This would normally fetch available options based on current filters
    // For now, return static data
    return {
        genres: await getFilteredGenres(currentFilters.genres),
        types: await getFilteredTypes(currentFilters.types),
        status: await getFilteredStatus(currentFilters.status)
    };
}

async function getFilteredGenres(selectedGenres = []) {
    // Simulate filtered genre list
    const allGenres = [
        { id: 'action', name: 'Action', count: 2456 },
        { id: 'adventure', name: 'Adventure', count: 1890 },
        { id: 'comedy', name: 'Comedy', count: 3120 }
    ];
    
    return allGenres.map(genre => ({
        ...genre,
        disabled: selectedGenres.length >= 3 && !selectedGenres.includes(genre.id)
    }));
}

async function getFilteredTypes(selectedTypes = []) {
    const allTypes = [
        { id: 'tv', name: 'TV', count: 4560 },
        { id: 'movie', name: 'Movie', count: 890 }
    ];
    
    return allTypes;
}

async function getFilteredStatus(selectedStatus = []) {
    const allStatus = [
        { id: 'airing', name: 'Currently Airing', count: 45 },
        { id: 'completed', name: 'Completed', count: 6890 }
    ];
    
    return allStatus;
}

function generateYearRange(start, end) {
    const years = [];
    for (let year = end; year >= start; year--) {
        years.push({ id: year.toString(), name: year.toString(), count: Math.floor(Math.random() * 100) + 50 });
    }
    return years;
}

module.exports = router;