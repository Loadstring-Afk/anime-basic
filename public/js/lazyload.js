// Enhanced lazy loading with IntersectionObserver
class LazyLoader {
  constructor(options = {}) {
    this.defaults = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.01,
      placeholder: '/assets/loader.gif',
      errorImage: '/assets/placeholder.jpg',
      fadeInDuration: 300,
      ...options
    };
    
    this.observer = null;
    this.images = new Map();
    this.init();
  }
  
  init() {
    // Create IntersectionObserver
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: this.defaults.root,
        rootMargin: this.defaults.rootMargin,
        threshold: this.defaults.threshold
      }
    );
    
    // Find all lazy images
    const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    lazyImages.forEach(img => {
      this.registerImage(img);
    });
    
    // Also handle background images
    const lazyBackgrounds = document.querySelectorAll('[data-bg]');
    lazyBackgrounds.forEach(el => {
      this.registerBackground(el);
    });
    
    console.log(`📸 LazyLoader initialized with ${lazyImages.length} images`);
  }
  
  registerImage(img) {
    const src = img.getAttribute('data-src') || img.src;
    const alt = img.alt || '';
    
    // Store original data
    this.images.set(img, {
      src,
      alt,
      loaded: false,
      error: false
    });
    
    // Set placeholder
    if (!img.src || img.src === src) {
      img.src = this.defaults.placeholder;
      img.classList.add('lazy-loading');
      
      // Add loading animation
      if (!img.closest('.lazy-container')) {
        const container = document.createElement('div');
        container.className = 'lazy-container relative';
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
      }
    }
    
    // Start observing
    this.observer.observe(img);
  }
  
  registerBackground(el) {
    const bgSrc = el.getAttribute('data-bg');
    
    this.images.set(el, {
      src: bgSrc,
      isBackground: true,
      loaded: false
    });
    
    // Set placeholder background
    el.classList.add('lazy-loading');
    
    this.observer.observe(el);
  }
  
  handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const data = this.images.get(element);
        
        if (data && !data.loaded) {
          this.loadElement(element, data);
        }
        
        // Stop observing after load starts
        observer.unobserve(element);
      }
    });
  }
  
  loadElement(element, data) {
    if (data.isBackground) {
      this.loadBackground(element, data.src);
    } else {
      this.loadImage(element, data.src);
    }
  }
  
  loadImage(img, src) {
    const imageData = this.images.get(img);
    
    // Create a new Image object to preload
    const tempImage = new Image();
    
    tempImage.onload = () => {
      // Success callback
      this.onImageLoad(img, src);
    };
    
    tempImage.onerror = () => {
      // Error callback
      this.onImageError(img);
    };
    
    // Start loading
    tempImage.src = src;
  }
  
  loadBackground(el, src) {
    const tempImage = new Image();
    
    tempImage.onload = () => {
      el.style.backgroundImage = `url(${src})`;
      el.classList.remove('lazy-loading');
      el.classList.add('lazy-loaded');
      
      const data = this.images.get(el);
      if (data) {
        data.loaded = true;
      }
      
      // Trigger fade-in animation
      this.animateFadeIn(el);
    };
    
    tempImage.onerror = () => {
      el.classList.remove('lazy-loading');
      el.classList.add('lazy-error');
    };
    
    tempImage.src = src;
  }
  
  onImageLoad(img, src) {
    // Swap image source
    img.src = src;
    
    // Update state
    const data = this.images.get(img);
    if (data) {
      data.loaded = true;
    }
    
    // Remove loading class
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
    
    // Trigger fade-in animation
    this.animateFadeIn(img);
    
    // Dispatch custom event
    img.dispatchEvent(new CustomEvent('lazyload:loaded', {
      bubbles: true,
      detail: { src }
    }));
  }
  
  onImageError(img) {
    // Use fallback image
    img.src = this.defaults.errorImage;
    
    // Update state
    const data = this.images.get(img);
    if (data) {
      data.loaded = true;
      data.error = true;
    }
    
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-error');
    
    // Still fade in
    this.animateFadeIn(img);
    
    // Dispatch error event
    img.dispatchEvent(new CustomEvent('lazyload:error', {
      bubbles: true
    }));
  }
  
  animateFadeIn(element) {
    // Set initial state
    element.style.opacity = '0';
    element.style.transition = `opacity ${this.defaults.fadeInDuration}ms ease-in`;
    
    // Trigger animation
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    
    // Clean up after animation
    setTimeout(() => {
      element.style.opacity = '';
      element.style.transition = '';
    }, this.defaults.fadeInDuration + 100);
  }
  
  // Manually trigger load for specific image
  loadImageNow(imgElement) {
    const data = this.images.get(imgElement);
    if (data && !data.loaded) {
      this.observer.unobserve(imgElement);
      this.loadImage(imgElement, data.src);
      return true;
    }
    return false;
  }
  
  // Load all images immediately
  loadAll() {
    this.images.forEach((data, element) => {
      if (!data.loaded) {
        this.observer.unobserve(element);
        if (data.isBackground) {
          this.loadBackground(element, data.src);
        } else {
          this.loadImage(element, data.src);
        }
      }
    });
  }
  
  // Add new images dynamically
  addImages(selector) {
    const newImages = document.querySelectorAll(selector);
    newImages.forEach(img => {
      if (!this.images.has(img)) {
        this.registerImage(img);
      }
    });
  }
  
  // Destroy and clean up
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}

// Initialize global lazy loader
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoader = new LazyLoader();
  
  // Add CSS for lazy loading states
  const style = document.createElement('style');
  style.textContent = `
    .lazy-loading {
      background: linear-gradient(90deg, #2a2a3a 25%, #3a3a4a 50%, #2a2a3a 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    .lazy-loaded {
      animation: fadeIn 0.5s ease-in;
    }
    
    .lazy-error {
      filter: grayscale(100%);
      opacity: 0.7;
    }
    
    .lazy-container {
      overflow: hidden;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}