// TAIN Games - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
    // === Number Counter Animation ===
    const stats = [
        { id: 'stat-players', value: 50000, prefix: '', suffix: '+' },
        { id: 'stat-prizes', value: 2500000, prefix: '$', suffix: '' },
        { id: 'stat-matches', value: 1000000, prefix: '', suffix: '+' }
    ];

    const animateValue = (obj, start, end, duration, prefix, suffix) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            const currentVal = Math.floor(easeOutQuart * (end - start) + start);
            obj.innerHTML = `${prefix}${currentVal.toLocaleString()}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Trigger stats animation when in view
    const statsSection = document.querySelector('.hero-stats');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                stats.forEach(stat => {
                    const el = document.getElementById(stat.id);
                    if (el) animateValue(el, 0, stat.value, 2000, stat.prefix, stat.suffix);
                });
                animated = true;
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) observer.observe(statsSection);

    // === Scroll Reveal Animation ===
    const revealElements = document.querySelectorAll('.feature-card, .timeline-item, .token-stat');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s cubic-bezier(0.5, 0, 0, 1) ${index * 0.1}s`;
        revealObserver.observe(el);
    });

    // === Navbar Scroll Effect ===
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 5, 8, 0.95)';
            navbar.style.padding = '15px 0';
        } else {
            navbar.style.background = 'rgba(5, 5, 8, 0.8)';
            navbar.style.padding = '20px 0';
        }
    });

    // === Wallet Connect (Mock) ===
    const connectBtn = document.getElementById('connectWallet');
    connectBtn.addEventListener('click', async () => {
        const originalText = connectBtn.innerHTML;
        connectBtn.innerHTML = '<span>⏳ Connecting...</span>';

        // Simulate connection delay
        setTimeout(() => {
            connectBtn.innerHTML = '<span>✅ Connected</span>';
            connectBtn.style.borderColor = '#00f2ff';
            connectBtn.style.background = 'rgba(0, 242, 255, 0.1)';

            setTimeout(() => {
                connectBtn.innerHTML = '<span>0x71...39A2</span>';
            }, 1000);
        }, 1500);
    });
});
