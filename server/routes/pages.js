const express = require('express');
const path = require('path');
const router = express.Router();

// List of all valid page routes
const validPages = [
    '/', '/home', '/top-airing', '/top-rated', '/most-popular',
    '/filter'  // All other pages will use filter.html
];

// Special pages that need unique handling
const specialPages = {
    '/anime/:id': 'anime.html',
    '/watch/:id': 'watch.html',
    '/character/:id': 'filter.html',  // Characters use filter page
    '/people/:id': 'filter.html',     // People use filter page
    '/genre/:genre': 'filter.html'    // Genres use filter page
};

// Serve main pages
router.get(validPages, async (req, res) => {
    try {
        const pageName = req.path === '/' ? 'index' : req.path.slice(1);
        const pagePath = path.join(__dirname, '../../public/pages', `${pageName}.html`);
        
        // Send HTML file
        res.sendFile(pagePath);
        
    } catch (error) {
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

// Dynamic routes - ALL use filter.html dynamically
router.get([
    '/most-favorite',
    '/completed',
    '/recently-added', 
    '/recently-updated',
    '/top-upcoming',
    '/subbed-anime',
    '/dubbed-anime',
    '/movie',
    '/tv',
    '/ova',
    '/ona',
    '/special',
    '/events'
], async (req, res) => {
    try {
        // All these pages use the same filter.html template
        const pagePath = path.join(__dirname, '../../public/pages/filter.html');
        res.sendFile(pagePath);
    } catch (error) {
        res.status(404).sendFile(
            path.join(__dirname, '../../public/pages/404.html')
        );
    }
});

// Special dynamic routes
Object.entries(specialPages).forEach(([route, page]) => {
    const routePattern = route.replace(/:\w+/g, '([^\/]+)');
    const regex = new RegExp(`^${routePattern}$`);
    
    router.get(regex, async (req, res) => {
        try {
            const pagePath = path.join(__dirname, '../../public/pages', page);
            res.sendFile(pagePath);
        } catch (error) {
            res.status(404).sendFile(
                path.join(__dirname, '../../public/pages/404.html')
            );
        }
    });
});

// Catch-all 404
router.get('*', (req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, '../../public/pages/404.html')
    );
});

module.exports = router;