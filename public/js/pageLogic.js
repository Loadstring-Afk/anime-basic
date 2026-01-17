// Page-specific JavaScript logic for AniLab

// Page initialization
class PageManager {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }
  
  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/anime/')) return 'anime-detail';
    if (path.includes('/watch/')) return 'watch';
    if (path.includes('/genre/')) return 'genre';
    if (path.includes('/filter')) return 'filter';
    return path.replace('/', '') || 'home';
  }
  
  init() {
    // Load page-specific modules
    this.loadPageModule();
    
    // Initialize common components
    this.initCommonComponents();
    
    // Set up page transitions
    this.setupPageTransitions();
  }
  
  loadPageModule() {
    switch (this.currentPage) {
      case 'home':
        this.initHomePage();
        break;
      case 'anime-detail':
        this.initAnimeDetailPage();
        break;
      case 'watch':
        this.initWatchPage();
        break;
      case 'genre':
        this.initGenrePage();
        break;
      case 'filter':
        this.initFilterPage();
        break;
      default:
        this.initDefaultPage();
    }
  }
  
  initCommonComponents() {
    // Initialize search functionality
    this.initSearch();
    
    // Initialize dark mode toggle
    this.initDarkMode();
    
    // Initialize notifications
    this.initNotifications();
    
    // Initialize tooltips
    this.initTooltips();
  }
  
  // Search functionality
  initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      
      const query = e.target.value.trim();
      if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
      }
      
      searchTimeout = setTimeout(() => {
        this.performSearch(query, searchResults);
      }, 300);
    });
    
    // Close results on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }
  
  async performSearch(query, resultsContainer) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        this.renderSearchResults(data.data, resultsContainer);
        resultsContainer.classList.remove('hidden');
      } else {
        this.renderNoResults(resultsContainer);
        resultsContainer.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Search error:', error);
      this.renderSearchError(resultsContainer);
    }
  }
  
  renderSearchResults(results, container) {
    container.innerHTML = results.map(result => `
      <a href="/anime/${result.id}" class="search-result-item flex items-center p-3 hover:bg-gray-800">
        <img src="${result.poster || '/assets/placeholder.jpg'}" 
             alt="${result.title}"
             class="w-12 h-16 object-cover rounded mr-3">
        <div class="flex-1">
          <div class="font-medium text-white">${result.title}</div>
          <div class="text-sm text-gray-400">${result.type || 'TV'} • ${result.status || 'Unknown'}</div>
        </div>
      </a>
    `).join('');
  }
  
  // Dark mode toggle
  initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved theme or prefer-color-scheme
    const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
                      (!localStorage.getItem('darkMode') && 
                       window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', isDark);
      
      // Update icon
      const icon = darkModeToggle.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }
  
  // Notifications
  initNotifications() {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
      const container = document.createElement('div');
      container.className = 'notification-container fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
  }
  
  showNotification(message, type = 'info', duration = 5000) {
    const container = document.querySelector('.notification-container');
    const id = 'notification-' + Date.now();
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification glass p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 translate-x-full`;
    
    const icons = {
      success: 'fas fa-check-circle text-green-400',
      error: 'fas fa-exclamation-circle text-red-400',
      info: 'fas fa-info-circle text-blue-400',
      warning: 'fas fa-exclamation-triangle text-yellow-400'
    };
    
    notification.innerHTML = `
      <div class="flex items-start">
        <i class="${icons[type] || icons.info} text-xl mr-3 mt-0.5"></i>
        <div class="flex-1">
          <p class="text-white">${message}</p>
        </div>
        <button onclick="document.getElementById('${id}').remove()" class="ml-4 text-gray-400 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
    });
    
    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        if (document.getElementById(id)) {
          notification.classList.add('translate-x-full');
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
    
    return id;
  }
  
  // Tooltips
  initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        const tooltipText = element.getAttribute('data-tooltip');
        this.showTooltip(e.target, tooltipText);
      });
      
      element.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }
  
  showTooltip(element, text) {
    // Remove existing tooltip
    this.hideTooltip();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip glass px-3 py-2 rounded-lg text-sm absolute z-50 whitespace-nowrap';
    tooltip.textContent = text;
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 40}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    tooltip.id = 'current-tooltip';
    document.body.appendChild(tooltip);
    
    // Animate in
    setTimeout(() => {
      tooltip.classList.add('opacity-100');
    }, 10);
  }
  
  hideTooltip() {
    const tooltip = document.getElementById('current-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  // Page-specific initializations
  initHomePage() {
    console.log('Initializing home page');
    // Home page specific logic
  }
  
  initAnimeDetailPage() {
    console.log('Initializing anime detail page');
    // Anime detail page specific logic
  }
  
  initWatchPage() {
    console.log('Initializing watch page');
    // Watch page specific logic
  }
  
  initGenrePage() {
    console.log('Initializing genre page');
    // Genre page specific logic
  }
  
  initFilterPage() {
    console.log('Initializing filter page');
    // Filter page specific logic
  }
  
  initDefaultPage() {
    console.log('Initializing default page');
  }
  
  // Page transitions
  setupPageTransitions() {
    // Add loading state for page transitions
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        
        // Show loading overlay
        this.showLoading();
        
        // Navigate after a short delay for animation
        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      }
    });
  }
  
  showLoading() {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById('page-loading')) {
      const overlay = document.createElement('div');
      overlay.id = 'page-loading';
      overlay.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center';
      overlay.innerHTML = `
        <div class="text-center">
          <div class="loading-spinner w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-white">Loading...</p>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      document.getElementById('page-loading').classList.remove('hidden');
    }
  }
  
  hideLoading() {
    const overlay = document.getElementById('page-loading');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pageManager = new PageManager();
  
  // Hide loading overlay when page is fully loaded
  window.addEventListener('load', () => {
    window.pageManager.hideLoading();
  });
});

// Export utility functions
window.showNotification = (message, type, duration) => {
  if (window.pageManager) {
    return window.pageManager.showNotification(message, type, duration);
  }
  return null;
};

// Add to watchlist function
window.addToWatchlist = async (animeId) => {
  try {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    if (!watchlist.includes(animeId)) {
      watchlist.push(animeId);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      showNotification('Added to watchlist!', 'success');
      return true;
    } else {
      // Remove from watchlist
      const updated = watchlist.filter(id => id !== animeId);
      localStorage.setItem('watchlist', JSON.stringify(updated));
      showNotification('Removed from watchlist', 'info');
      return false;
    }
  } catch (error) {
    console.error('Watchlist error:', error);
    showNotification('Failed to update watchlist', 'error');
    return false;
  }
};

// Check if in watchlist
window.isInWatchlist = (animeId) => {
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
  return watchlist.includes(animeId);
};