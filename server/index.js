const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const pageRoutes = require('./routes/pages');
const animeRoutes = require('./routes/anime');
const watchRoutes = require('./routes/watch');
const proxyRoutes = require('./routes/proxy');
const genreRoutes = require('./routes/genre');
const peopleRoutes = require('./routes/people');
const filterRoutes = require('./routes/filter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://cdn.noitatnemucod.net", "https://megaplay.buzz"],
      frameSrc: ["'self'", "https://megaplay.buzz"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// API Routes (PROXY TO HI-ANIME API)
app.use('/api', proxyRoutes);

// Application Routes
app.use('/', pageRoutes);
app.use('/anime', animeRoutes);
app.use('/watch', watchRoutes);
app.use('/genre', genreRoutes);
app.use('/people', peopleRoutes);
app.use('/filter', filterRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/pages/404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Using HiAnime API: https://nicolas-maduro.nescoroco.lat/api/v1`);
});