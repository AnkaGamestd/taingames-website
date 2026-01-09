/**
 * TAIN Games - Static Website Server
 * Simple Express server for Railway deployment
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Force HTTPS in production
app.use((req, res, next) => {
    // Railway sets x-forwarded-proto header
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Log startup info
console.log('Starting TAIN Games Website Server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        https: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });
});

// Serve static files
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html', 'css', 'js', 'png', 'jpg', 'gif', 'svg']
}));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for SPA
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 TAIN Games Website running on port ${PORT}`);
    console.log(`🔒 HTTPS redirect: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DISABLED'}`);
});
