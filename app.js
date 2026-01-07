/**
 * TAIN Games - Landing Page JavaScript
 * Wallet Connection & Token Swap Functionality
 */

// Configuration
const CONFIG = {
    // Replace with your actual token contract address
    TOKEN_CONTRACT: '0x0000000000000000000000000000000000000000',
    TOKEN_SYMBOL: 'TAIN',
    TOKEN_DECIMALS: 18,

    // BSC Network
    CHAIN_ID: '0x38', // 56 in hex
    CHAIN_NAME: 'BNB Smart Chain',
    RPC_URL: 'https://bsc-dataseed.binance.org/',
    BLOCK_EXPLORER: 'https://bscscan.com',

    // Swap rate (example: 1 BNB = 10000 TAIN)
    SWAP_RATE: 10000,

    // Presale/Router contract (replace with your actual contract)
    ROUTER_CONTRACT: '0x0000000000000000000000000000000000000000'
};

// State
let provider = null;
let signer = null;
let userAddress = null;
let isConnected = false;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletText = document.getElementById('walletText');
const swapBtn = document.getElementById('swapBtn');
const payAmountInput = document.getElementById('payAmount');
const receiveAmountInput = document.getElementById('receiveAmount');
const bnbBalanceEl = document.getElementById('bnbBalance');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkWalletConnection();
});

// Event Listeners
function initEventListeners() {
    // Connect wallet button
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    // Swap input
    if (payAmountInput) {
        payAmountInput.addEventListener('input', updateReceiveAmount);
    }

    // Swap button
    if (swapBtn) {
        swapBtn.addEventListener('click', executeSwap);
    }

    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

// Handle scroll
function handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
}

// Check if wallet is already connected
async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await handleAccountsChanged(accounts);
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

// Connect Wallet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Web3 wallet to connect!');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
            await handleAccountsChanged(accounts);

            // Switch to BSC network if not already
            await switchToBSC();
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        if (error.code === 4001) {
            alert('Connection rejected. Please approve the connection request.');
        }
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        isConnected = false;
        userAddress = null;
        updateUI();
        return;
    }

    userAddress = accounts[0];
    isConnected = true;

    // Initialize ethers provider
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    updateUI();
    await updateBalance();
}

// Handle chain changes
function handleChainChanged(chainId) {
    // Reload page on chain change
    window.location.reload();
}

// Switch to BSC Network
async function switchToBSC() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.CHAIN_ID }]
        });
    } catch (error) {
        // Chain not added, add it
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CONFIG.CHAIN_ID,
                        chainName: CONFIG.CHAIN_NAME,
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        },
                        rpcUrls: [CONFIG.RPC_URL],
                        blockExplorerUrls: [CONFIG.BLOCK_EXPLORER]
                    }]
                });
            } catch (addError) {
                console.error('Error adding BSC network:', addError);
            }
        }
    }
}

// Update UI based on connection status
function updateUI() {
    if (isConnected && userAddress) {
        const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        walletText.textContent = shortAddress;
        connectWalletBtn.classList.add('connected');
        swapBtn.disabled = false;
        swapBtn.textContent = 'Swap';
    } else {
        walletText.textContent = 'Connect Wallet';
        connectWalletBtn.classList.remove('connected');
        swapBtn.disabled = true;
        swapBtn.textContent = 'Connect Wallet First';
    }
}

// Update BNB balance
async function updateBalance() {
    if (!provider || !userAddress) return;

    try {
        const balance = await provider.getBalance(userAddress);
        const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);
        bnbBalanceEl.textContent = formattedBalance;
    } catch (error) {
        console.error('Error getting balance:', error);
    }
}

// Update receive amount based on input
function updateReceiveAmount() {
    const payAmount = parseFloat(payAmountInput.value) || 0;
    const receiveAmount = payAmount * CONFIG.SWAP_RATE;
    receiveAmountInput.value = receiveAmount > 0 ? receiveAmount.toLocaleString() : '';
}

// Execute Swap
async function executeSwap() {
    if (!isConnected || !signer) {
        alert('Please connect your wallet first!');
        return;
    }

    const payAmount = parseFloat(payAmountInput.value);

    if (!payAmount || payAmount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        swapBtn.disabled = true;
        swapBtn.textContent = 'Processing...';

        // Convert to Wei
        const amountInWei = ethers.parseEther(payAmount.toString());

        // Check if user has enough balance
        const balance = await provider.getBalance(userAddress);
        if (balance < amountInWei) {
            alert('Insufficient BNB balance');
            swapBtn.disabled = false;
            swapBtn.textContent = 'Swap';
            return;
        }

        // TODO: Replace with actual swap contract interaction
        // This is a placeholder - you'll need to implement the actual swap logic
        // based on your token contract (presale, DEX router, etc.)

        /*
        // Example: Presale contract buy function
        const presaleContract = new ethers.Contract(
            CONFIG.ROUTER_CONTRACT,
            ['function buyTokens() payable'],
            signer
        );
        
        const tx = await presaleContract.buyTokens({ value: amountInWei });
        await tx.wait();
        */

        // For now, show a message to use DEX
        alert(`To swap ${payAmount} BNB for ${payAmount * CONFIG.SWAP_RATE} TAIN, please use PancakeSwap.\n\nContract: ${CONFIG.TOKEN_CONTRACT}`);

        swapBtn.textContent = 'Swap';
        swapBtn.disabled = false;

    } catch (error) {
        console.error('Swap error:', error);
        alert('Transaction failed. Please try again.');
        swapBtn.textContent = 'Swap';
        swapBtn.disabled = false;
    }
}

// Copy contract address
function copyContract() {
    const contractAddress = CONFIG.TOKEN_CONTRACT;
    navigator.clipboard.writeText(contractAddress).then(() => {
        alert('Contract address copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Make copyContract available globally
window.copyContract = copyContract;

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .timeline-item, .step').forEach(el => {
    observer.observe(el);
});

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    .feature-card, .timeline-item, .step {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature-card.animate-in, .timeline-item.animate-in, .step.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .feature-card:nth-child(2) { transition-delay: 0.1s; }
    .feature-card:nth-child(3) { transition-delay: 0.2s; }
    .feature-card:nth-child(4) { transition-delay: 0.3s; }
    
    .timeline-item:nth-child(2) { transition-delay: 0.1s; }
    .timeline-item:nth-child(3) { transition-delay: 0.2s; }
    .timeline-item:nth-child(4) { transition-delay: 0.3s; }
    
    .step:nth-child(2) { transition-delay: 0.1s; }
    .step:nth-child(3) { transition-delay: 0.2s; }
    .step:nth-child(4) { transition-delay: 0.3s; }
`;
document.head.appendChild(style);
