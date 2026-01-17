const express = require('express');
const path = require('path');
const router = express.Router();

// Serve HTML pages for all routes
const pages = [
    '/', '/home', '/top-airing', '/top-rated', '/most-popular',
    '/most-favorite', '/completed', '/recently-added', '/recently-updated',
    '/top-upcoming', '/subbed-anime', '/dubbed-anime', '/movie', '/tv',
    '/ova', '/ona', '/special', '/events', '/filter'
];

// Dynamic page routes
router.get(pages, async (req, res) => {
    try {
        const pageName = req.path === '/' ? 'index' : req.path.slice(1);
        const pagePath = path.join(__dirname, '../../public/pages', `${pageName}.html`);
        
        // Check if page exists
        const fs = require('fs').promises;
        await fs.access(pagePath);
        
        // Send HTML file with cache headers
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.sendFile(pagePath);
        
    } catch (error) {
        // Fallback to 404
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

// Genre page with parameter
router.get('/genre/:genre', async (req, res) => {
    try {
        const pagePath = path.join(__dirname, '../../public/pages/genre.html');
        res.sendFile(pagePath);
    } catch (error) {
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

// Anime detail page
router.get('/anime/:id', async (req, res) => {
    try {
        const pagePath = path.join(__dirname, '../../public/pages/anime.html');
        res.sendFile(pagePath);
    } catch (error) {
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

// Watch page
router.get('/watch/:id', async (req, res) => {
    try {
        const pagePath = path.join(__dirname, '../../public/pages/watch.html');
        res.sendFile(pagePath);
    } catch (error) {
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

module.exports = router;