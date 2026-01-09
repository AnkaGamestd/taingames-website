/**
 * TAIN Games - Static Website Server
 * Simple Express server for Railway deployment
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Log startup info
console.log('Starting TAIN Games Website Server...');
console.log('Current directory:', __dirname);
console.log('PORT:', PORT);

// List files in directory for debugging
console.log('Files in directory:', fs.readdirSync(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        directory: __dirname,
        files: fs.readdirSync(__dirname)
    });
});

// Explicitly serve each static file type
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html', 'css', 'js', 'png', 'jpg', 'gif', 'svg']
}));

// Root route - serve index.html explicitly
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Serving index.html from:', indexPath);
    console.log('File exists:', fs.existsSync(indexPath));

    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found. Files: ' + fs.readdirSync(__dirname).join(', '));
    }
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

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server error: ' + err.message);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 TAIN Games Website running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Serving from: ${__dirname}`);
    console.log(`✅ Server started successfully!`);
});
