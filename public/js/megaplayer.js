class MegaPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentEpisode = null;
        this.isSubbed = true;
    }

    // Load episode into iframe
    loadEpisode(episodeId, language = 'sub') {
        if (!episodeId) {
            this.showError('Episode not available');
            return;
        }

        this.isSubbed = language === 'sub';
        this.currentEpisode = episodeId;
        
        const embedUrl = `https://megaplay.buzz/stream/s-2/${episodeId}/${language}`;
        
        this.container.innerHTML = `
            <div class="relative w-full" style="padding-top: 56.25%">
                <iframe 
                    src="${embedUrl}"
                    class="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameborder="0"
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            </div>
            <div class="mt-4 flex justify-between items-center">
                <button id="toggleDub" class="button is-small ${this.isSubbed ? 'is-light' : 'is-primary'}">
                    <i class="fas fa-closed-captioning mr-2"></i>
                    ${this.isSubbed ? 'Switch to Dub' : 'Switch to Sub'}
                </button>
                <div class="text-sm text-gray-400">
                    Powered by Megaplay
                </div>
            </div>
        `;

        // Add toggle functionality
        document.getElementById('toggleDub').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Save to continue watching
        this.saveToHistory(episodeId);
    }

    toggleLanguage() {
        if (this.currentEpisode) {
            this.loadEpisode(
                this.currentEpisode, 
                this.isSubbed ? 'dub' : 'sub'
            );
        }
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="glass-card p-8 text-center rounded-lg">
                <i class="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
                <h3 class="text-xl font-bold text-white mb-2">Playback Error</h3>
                <p class="text-gray-300 mb-4">${message}</p>
                <button onclick="location.reload()" class="button is-primary">
                    <i class="fas fa-redo mr-2"></i>
                    Try Again
                </button>
            </div>
        `;
    }

    saveToHistory(episodeId) {
        // Get current anime info from page
        const animeId = document.getElementById('animeId')?.value;
        const animeTitle = document.getElementById('animeTitle')?.innerText;
        const poster = document.querySelector('.anime-poster')?.src;
        const episodeNum = document.querySelector('.current-episode')?.innerText;

        if (!animeId) return;

        const watchingData = {
            animeId,
            title: animeTitle || 'Unknown',
            poster: poster || '/assets/placeholder.jpg',
            episode: parseInt(episodeNum) || 1,
            episodeId,
            language: this.isSubbed ? 'sub' : 'dub',
            timestamp: Date.now(),
            progress: 0 // Would update with time tracking
        };

        // Save to localStorage
        let continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '{}');
        continueWatching[animeId] = watchingData;
        localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    }
}

// Initialize player globally
window.MegaPlayer = MegaPlayer;