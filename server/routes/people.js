const express = require('express');
const { fetchFromHiAnime } = require('../utils/fetchHiAnime');
const router = express.Router();

// Get person details (voice actor, director, etc.)
router.get('/:id', async (req, res) => {
    try {
        const personId = req.params.id;
        
        // Fetch person data from API
        const data = await fetchFromHiAnime(`/people/${personId}`);
        
        if (!data.success) {
            return res.status(404).json({
                success: false,
                message: 'Person not found'
            });
        }
        
        // Format response
        const formattedData = {
            person: {
                id: data.data.id,
                name: data.data.name,
                nativeName: data.data.nativeName || '',
                image: data.data.image || '/assets/placeholder.jpg',
                description: data.data.description || 'No description available.',
                birthDate: data.data.birthDate,
                age: data.data.age,
                gender: data.data.gender,
                bloodType: data.data.bloodType,
                height: data.data.height,
                weight: data.data.weight,
                website: data.data.website,
                socialMedia: data.data.socialMedia || {}
            },
            roles: formatRoles(data.data.roles || []),
            statistics: calculateStatistics(data.data.roles || []),
            recentlyAdded: data.data.recentlyAdded || []
        };
        
        res.json({
            success: true,
            data: formattedData
        });
        
    } catch (error) {
        console.error('People route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch person data'
        });
    }
});

// Search people
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const { page = 1 } = req.query;
        
        // In a real implementation, you would search the API
        // For now, return sample data
        const sampleResults = [
            {
                id: 'mamoru-miyano',
                name: 'Mamoru Miyano',
                nativeName: '宮野 真守',
                image: '/assets/placeholder.jpg',
                description: 'Japanese voice actor and singer.',
                role: 'Voice Actor',
                animeCount: 45
            },
            {
                id: 'kana-hanazawa',
                name: 'Kana Hanazawa',
                nativeName: '花澤 香菜',
                image: '/assets/placeholder.jpg',
                description: 'Japanese voice actress and singer.',
                role: 'Voice Actress',
                animeCount: 38
            },
            {
                id: 'hiroshi-kamiya',
                name: 'Hiroshi Kamiya',
                nativeName: '神谷 浩史',
                image: '/assets/placeholder.jpg',
                description: 'Japanese voice actor.',
                role: 'Voice Actor',
                animeCount: 52
            }
        ];
        
        const filteredResults = sampleResults.filter(person =>
            person.name.toLowerCase().includes(query.toLowerCase()) ||
            person.nativeName.toLowerCase().includes(query.toLowerCase())
        );
        
        res.json({
            success: true,
            data: {
                results: filteredResults,
                query,
                page: parseInt(page),
                total: filteredResults.length,
                totalPages: 1
            }
        });
        
    } catch (error) {
        console.error('People search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search people'
        });
    }
});

// Get popular people
router.get('/popular/list', async (req, res) => {
    try {
        const popularPeople = [
            {
                id: 'mamoru-miyano',
                name: 'Mamoru Miyano',
                role: 'Voice Actor',
                image: '/assets/placeholder.jpg',
                popularRoles: ['Light Yagami (Death Note)', 'Okabe Rintarou (Steins;Gate)'],
                animeCount: 45,
                rank: 1
            },
            {
                id: 'kana-hanazawa',
                name: 'Kana Hanazawa',
                role: 'Voice Actress',
                image: '/assets/placeholder.jpg',
                popularRoles: ['Kanade Tachibana (Angel Beats!)', 'Nadeko Sengoku (Monogatari)'],
                animeCount: 38,
                rank: 2
            },
            {
                id: 'hayao-miyazaki',
                name: 'Hayao Miyazaki',
                role: 'Director',
                image: '/assets/placeholder.jpg',
                popularRoles: ['Spirited Away', 'My Neighbor Totoro', 'Princess Mononoke'],
                animeCount: 12,
                rank: 3
            },
            {
                id: 'makoto-shinkai',
                name: 'Makoto Shinkai',
                role: 'Director',
                image: '/assets/placeholder.jpg',
                popularRoles: ['Your Name', 'Weathering With You', '5 Centimeters Per Second'],
                animeCount: 8,
                rank: 4
            }
        ];
        
        res.json({
            success: true,
            data: {
                people: popularPeople,
                categories: {
                    voiceActors: popularPeople.filter(p => p.role.includes('Voice')),
                    directors: popularPeople.filter(p => p.role === 'Director'),
                    producers: []
                }
            }
        });
        
    } catch (error) {
        console.error('Popular people error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular people'
        });
    }
});

// Helper functions
function formatRoles(roles) {
    return roles.map(role => ({
        animeId: role.animeId,
        animeTitle: role.animeTitle,
        animeImage: role.animeImage,
        character: role.character,
        characterRole: role.characterRole || 'Supporting',
        episodeCount: role.episodeCount,
        language: role.language || 'Japanese',
        year: role.year
    }));
}

function calculateStatistics(roles) {
    const stats = {
        totalAnime: roles.length,
        totalEpisodes: roles.reduce((sum, role) => sum + (role.episodeCount || 0), 0),
        mainRoles: roles.filter(role => role.characterRole === 'Main').length,
        supportingRoles: roles.filter(role => role.characterRole === 'Supporting').length,
        byYear: {}
    };
    
    // Group by year
    roles.forEach(role => {
        if (role.year) {
            stats.byYear[role.year] = (stats.byYear[role.year] || 0) + 1;
        }
    });
    
    return stats;
}

module.exports = router;