document.addEventListener('DOMContentLoaded', () => {
    // Enable animations only when JS is ready
    document.documentElement.classList.add('js-ready');

    /* ==============================
       NAVBAR — scroll & mobile
    ============================== */
    const navbar     = document.getElementById('navbar');
    const hamburger  = document.getElementById('hamburger');
    const navLinks   = document.getElementById('nav-links');
    const overlay    = document.getElementById('mobile-overlay');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        updateActiveLink();
    }, { passive: true });

    // Mobile toggle
    function toggleMenu(open) {
        hamburger.classList.toggle('open', open);
        navLinks.classList.toggle('open', open);
        overlay.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('open')));
    overlay.addEventListener('click', () => toggleMenu(false));
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    /* ==============================
       SMOOTH SCROLL + ACTIVE LINK
    ============================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            e.preventDefault();
            const el = document.querySelector(id);
            if (el) {
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 72;
                window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
            }
        });
    });

    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id], header[id]');
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    /* ==============================
       SCROLL ANIMATIONS
    ============================== */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-up').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.07}s`;
        observer.observe(el);
    });

    /* ==============================
       HERO BG PARALLAX
    ============================== */
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        setTimeout(() => heroBg.classList.add('loaded'), 100);
        window.addEventListener('scroll', () => {
            heroBg.style.transform = `scale(1) translateY(${window.scrollY * 0.25}px)`;
        }, { passive: true });
    }

    /* ==============================
       DESTINATION SLIDER
    ============================== */
    const track   = document.getElementById('slider-track');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsWrap = document.getElementById('slider-dots');

    if (track) {
        const slides = track.querySelectorAll('.slide-item');
        let current = 0;
        let autoplayTimer;

        // Build dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
            resetAutoplay();
        }

        prevBtn.addEventListener('click', () => goTo(current - 1));
        nextBtn.addEventListener('click', () => goTo(current + 1));

        // Touch swipe
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        });

        // Autoplay
        function startAutoplay() { autoplayTimer = setInterval(() => goTo(current + 1), 5000); }
        function resetAutoplay() { clearInterval(autoplayTimer); startAutoplay(); }
        startAutoplay();

        // Pause on hover
        track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
        track.parentElement.addEventListener('mouseleave', startAutoplay);
    }

    /* ==============================
       NEWSLETTER FORM
    ============================== */
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('newsletter-email');
            if (input.value) {
                input.value = '';
                input.placeholder = '✓ Subscribed!';
                setTimeout(() => { input.placeholder = 'your@email.com'; }, 3000);
            }
        });
});
