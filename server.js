// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ledController = require('./led');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// serve index.html + static assets
app.use(express.static(__dirname));

// API routes
app.get('/api/led', ledController.getLedState);
app.post('/api/led', ledController.updateLedState);

// fallback for unknown routes
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
