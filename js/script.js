// Portfolio Website JS
// Handles contact form, skill bar animations, mobile nav, and about animation

document.addEventListener('DOMContentLoaded', function() {
    // Contact form submit handler
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Remove preventDefault to allow normal form submission
            // e.preventDefault();
            // If you want to redirect after submit, set the action and method attributes in HTML
        });
    }

    // Animate skill bars on load
    document.querySelectorAll('.bar-fill').forEach(function(bar) {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 300);
    });

    // Mobile nav menu toggle
    const menuIcon = document.getElementById('menuIcon');
    const nav = document.getElementById('mainNav');
    const closeNav = document.getElementById('closeNav');
    function toggleMenu(show) {
        if (show) {
            nav.classList.add('open');
            menuIcon.classList.add('hide');
        } else {
            nav.classList.remove('open');
            menuIcon.classList.remove('hide');
        }
    }
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function() {
            toggleMenu(true);
        });
        // Close nav when clicking a link (mobile UX)
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }
    // Close nav with close icon
    if (closeNav) {
        closeNav.addEventListener('click', function() {
            toggleMenu(false);
        });
    }

    // About section animation (science/tech effect)
    document.querySelectorAll('.about-animated').forEach((el, i) => {
        el.style.opacity = 0;
        setTimeout(() => {
            el.style.opacity = 1;
            el.classList.add('animate__fadeInUp');
        }, 400 + i * 200);
    });
});

// End of JS
