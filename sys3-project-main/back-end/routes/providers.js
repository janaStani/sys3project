const express   = require('express');
const providers = express.Router();
const DB        = require('../db/dbConn.js');

// GET /providers — returns all service providers
providers.get('/', async (req, res) => {
    try {
        const result = await DB.getProviders();
        return res.status(200).json({ providers: Array.isArray(result) ? result : [] });
    } catch (err) {
        console.error('GET /providers error:', err);
        return res.status(500).json({ providers: [] });
    }
});

module.exports = providers;