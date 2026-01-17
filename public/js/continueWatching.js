class ContinueWatching {
    constructor() {
        this.storageKey = 'continueWatching';
        this.maxItems = 10;
    }

    // Save watching progress
    saveProgress(animeData) {
        const {
            animeId,
            title,
            poster,
            episode,
            episodeId,
            language = 'sub',
            timestamp = Date.now(),
            time = 0
        } = animeData;

        if (!animeId) return false;

        const progress = {
            animeId,
            title: title || 'Unknown Anime',
            poster: poster || '/assets/placeholder.jpg',
            episode: parseInt(episode) || 1,
            episodeId: episodeId || `ep-${episode}`,
            language,
            timestamp,
            time: parseInt(time) || 0,
            lastUpdated: new Date().toISOString()
        };

        // Get existing data
        let allProgress = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        
        // Update or add
        allProgress[animeId] = progress;
        
        // Limit number of items
        const items = Object.values(allProgress);
        if (items.length > this.maxItems) {
            // Remove oldest
            const sorted = items.sort((a, b) => a.timestamp - b.timestamp);
            delete allProgress[sorted[0].animeId];
        }

        localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
        return true;
    }

    // Get all continue watching items
    getAll() {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return Object.values(data)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // Get specific anime progress
    getAnimeProgress(animeId) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return data[animeId] || null;
    }

    // Remove from continue watching
    remove(animeId) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        if (data[animeId]) {
            delete data[animeId];
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        }
        return false;
    }

    // Clear all progress
    clearAll() {
        localStorage.removeItem(this.storageKey);
        return true;
    }

    // Render continue watching to DOM
    renderToContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const items = this.getAll();
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-film text-4xl text-gray-600 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-400 mb-2">No Continue Watching</h3>
                    <p class="text-gray-500">Start watching some anime!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="relative group cursor-pointer" 
                 onclick="window.location='/watch/${item.animeId}?ep=${item.episode}'">
                <div class="relative overflow-hidden rounded-lg mb-3">
                    <img src="${item.poster}" 
                         alt="${item.title}"
                         loading="lazy"
                         class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                         onerror="this.src='/assets/placeholder.jpg'">
                    
                    <!-- Progress bar -->
                    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div class="h-full bg-purple-500" 
                             style="width: ${Math.min((item.time / (24 * 60)) * 100, 100)}%"></div>
                    </div>
                    
                    <!-- Play button overlay -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                            <i class="fas fa-play text-white"></i>
                        </div>
                    </div>
                    
                    <!-- Episode badge -->
                    <div class="absolute top-2 left-2">
                        <span class="px-2 py-1 text-xs font-bold bg-black/70 rounded">
                            EP ${item.episode}
                        </span>
                    </div>
                </div>
                
                <h4 class="text-white font-medium text-sm truncate">${item.title}</h4>
                <div class="flex items-center text-xs text-gray-400 mt-1">
                    <span class="mr-2">
                        <i class="fas fa-${item.language === 'sub' ? 'closed-captioning' : 'microphone'}"></i>
                    </span>
                    <span>Continue from ${this.formatTime(item.time)}</span>
                </div>
                
                <!-- Remove button -->
                <button class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onclick="event.stopPropagation(); continueWatching.remove('${item.animeId}'); this.closest('.relative').remove();">
                    <i class="fas fa-times text-white text-xs"></i>
                </button>
            </div>
        `).join('');
    }

    formatTime(seconds) {
        if (!seconds) return 'beginning';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

// Initialize globally
window.continueWatching = new ContinueWatching();

// Auto-load on homepage
if (document.getElementById('continueWatching')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.continueWatching.renderToContainer('continueWatching');
    });
}