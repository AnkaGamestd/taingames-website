/**
 * TAIN Games - Static Website Server
 * Simple Express server for Railway deployment
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint (before static files)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 TAIN Games Website running on port ${PORT}`);
    console.log(`📁 Serving from: ${__dirname}`);
});
