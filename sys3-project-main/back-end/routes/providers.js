const express   = require('express');
const providers = express.Router();
const DB        = require('../db/dbConn.js');

providers.get('/', async (req, res) => {
    try {
        const result = await DB.getProviders();
        return res.status(200).json({ providers: Array.isArray(result) ? result : [] });
    } catch (err) {
        console.error('GET /providers error:', err);
        return res.status(500).json({ providers: [] });
    }
});

providers.post('/', async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ status: { success: false, msg: 'Provider name is required' } });
        }
        await DB.addProvider(name.trim(), address || '', phone || '');
        const rows = await DB.getProviderByName(name.trim());
        const p = rows[0];
        return res.status(201).json({ id: p.providerId, name: p.provider, address: p.location, phone: p.priceRange, userAdded: true });
    } catch (err) {
        console.error('POST /providers error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

module.exports = providers;