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
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = Math.floor(easeOutQuart * (end - start) + start);
            obj.innerHTML = `${prefix}${currentVal.toLocaleString()}${suffix}`;
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    };

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
    const revealElements = document.querySelectorAll('.feature-card, .timeline-item, .token-stat, .token-info-card');
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

    // === Wallet Connect ===
    const connectBtn = document.getElementById('connectWallet');
    const swapBtn = document.getElementById('swap-btn');
    let isConnected = false;

    const connectWallet = async () => {
        if (isConnected) return;

        const btnText = connectBtn.querySelector('span') || connectBtn;
        const originalText = btnText.innerText;
        btnText.innerText = '⏳ Connecting...';
        if (swapBtn) swapBtn.innerText = 'Connecting...';

        setTimeout(() => {
            isConnected = true;
            const shortAddress = '0x71...39A2';
            btnText.innerText = shortAddress;
            connectBtn.style.borderColor = '#00f2ff';
            connectBtn.style.background = 'rgba(0, 242, 255, 0.1)';

            if (swapBtn) {
                swapBtn.innerText = 'Swap';
                swapBtn.classList.remove('btn-connect-wallet');
            }

            // Update balances
            document.getElementById('pay-balance').innerText = '2.54';
            document.getElementById('receive-balance').innerText = '15,400.00';
        }, 1500);
    };

    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    if (swapBtn) swapBtn.addEventListener('click', () => {
        if (!isConnected) connectWallet();
        else alert('Swap feature coming soon! (Contract integration required)');
    });
});

// === Global Swap Functions ===
window.swapMode = 'buy';
window.tainPrice = 10000; // 1 BNB = 10,000 TAIN

window.setSwapMode = (mode) => {
    window.swapMode = mode;
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));

    // Update UI based on mode
    if (mode === 'buy') {
        tabs[0].classList.add('active');
        document.querySelector('#pay-token span').innerText = 'BNB';
        document.querySelector('#pay-token img').src = 'https://cryptologos.cc/logos/bnb-bnb-logo.png';
        document.querySelector('#receive-token span').innerText = 'TAIN';
        document.querySelector('#receive-token .tain-emoji').style.display = 'inline';
    } else {
        tabs[1].classList.add('active');
        document.querySelector('#pay-token span').innerText = 'TAIN';
        document.querySelector('#pay-token img').style.display = 'none'; // Hide BNB icon
        document.querySelector('#pay-token').innerHTML = '<span class="tain-emoji">🎱</span><span>TAIN</span>';

        document.querySelector('#receive-token span').innerText = 'BNB';
        document.querySelector('#receive-token').innerHTML = '<img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB"><span>BNB</span>';
    }

    // Reset inputs
    document.getElementById('pay-amount').value = '';
    document.getElementById('receive-amount').value = '';
};

window.calculateSwap = () => {
    const payAmount = parseFloat(document.getElementById('pay-amount').value);
    const receiveInput = document.getElementById('receive-amount');

    if (isNaN(payAmount)) {
        receiveInput.value = '';
        return;
    }

    if (window.swapMode === 'buy') {
        // Buy: BNB -> TAIN
        receiveInput.value = (payAmount * window.tainPrice).toFixed(2);
    } else {
        // Sell: TAIN -> BNB
        receiveInput.value = (payAmount / window.tainPrice).toFixed(6);
    }
};

window.copyAddress = () => {
    const address = document.getElementById('contract-address').innerText;
    navigator.clipboard.writeText(address).then(() => {
        const btn = document.querySelector('.btn-copy');
        btn.innerText = '✅';
        setTimeout(() => btn.innerText = '📋', 2000);
    });
};
