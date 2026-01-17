// Initialize GSAP animations
document.addEventListener('DOMContentLoaded', () => {
    // Logo animation on every page load
    const logo = document.getElementById('logo');
    if (logo) {
        gsap.from(logo, {
            duration: 1,
            scale: 0.5,
            opacity: 0,
            rotation: 360,
            ease: "back.out(1.7)"
        });
    }

    // Page fade in
    gsap.from("body", {
        duration: 0.8,
        opacity: 0,
        ease: "power2.inOut"
    });

    // Animate navbar on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                gsap.to(navbar, {
                    duration: 0.3,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    ease: "power2.out"
                });
            } else {
                gsap.to(navbar, {
                    duration: 0.3,
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    ease: "power2.out"
                });
            }
        });
    }

    // Animate anime cards on scroll
    const animeCards = document.querySelectorAll('.anime-card');
    if (animeCards.length > 0) {
        gsap.utils.toArray(animeCards).forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                duration: 0.8,
                opacity: 0,
                y: 30,
                delay: index * 0.1,
                ease: "power2.out"
            });
        });
    }

    // Button hover effects with Anime.js
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            anime({
                targets: e.target,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        button.addEventListener('mouseleave', (e) => {
            anime({
                targets: e.target,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });

    // Card hover effects
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            anime({
                targets: e.target,
                translateY: -8,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', (e) => {
            anime({
                targets: e.target,
                translateY: 0,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
});

// Lazy load images with fade-in
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        // Add loading class
        img.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        
        // When image loads
        img.addEventListener('load', () => {
            img.classList.remove('opacity-0');
            img.classList.add('opacity-100');
        });
        
        // Error handling
        img.addEventListener('error', () => {
            img.src = '/assets/placeholder.jpg';
            img.classList.remove('opacity-0');
            img.classList.add('opacity-100');
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLazyLoading);