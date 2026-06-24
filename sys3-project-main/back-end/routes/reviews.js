const express = require('express');
const reviews = express.Router();
const DB      = require('../db/dbConn.js');

function requireLogin(req, res) {
    if (!req.session.logged_in) {
        res.status(401).json({ status: { success:false, msg:'Not logged in' } });
        return false;
    }
    return true;
}

reviews.get('/', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const result = await DB.getReviews(req.session.user.id);
        return res.status(200).json(Array.isArray(result) ? result : []);
    } catch (err) {
        console.error('GET /reviews error:', err);
        return res.status(500).json([]);
    }
});

reviews.post('/', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const { providerId, mechanicName, mechanicAddress, rating, comment, jobType } = req.body;
        if (!mechanicName || !rating || !comment) {
            return res.status(400).json({ status: { success:false, msg:'Missing required fields' } });
        }

        // Resolve a real DB providerId for every review — OSM mechanics get a provider
        // row created on first review so their ratings accumulate over time.
        let dbProviderId = null;

        // If the caller already sent a valid small integer providerId, trust it.
        const sentId = Number(providerId);
        const isRealDbId = providerId && /^\d+$/.test(String(providerId)) && sentId < 2_000_000_000;

        if (isRealDbId) {
            dbProviderId = sentId;
        } else {
            // Look up or create a provider row by name so the rating is persisted.
            try {
                await DB.addProvider(mechanicName.trim(), mechanicAddress || '', '');
                const rows = await DB.getProviderByName(mechanicName.trim());
                if (rows && rows[0]) dbProviderId = rows[0].providerId;
            } catch (e) {
                console.error('Provider upsert failed (non-fatal):', e.message);
            }
        }

        const result = await DB.addReview(
            req.session.user.id, dbProviderId, mechanicName, rating, comment, jobType || ''
        );
        return res.status(201).json({
            id: result.insertId, providerId: dbProviderId, mechanicName, rating, comment, jobType
        });
    } catch (err) {
        console.error('POST /reviews error:', err);
        return res.status(500).json({ status: { success:false, msg:'Server error' } });
    }
});

reviews.put('/:id', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const { rating, comment, jobType } = req.body;
        await DB.updateReview(req.params.id, req.session.user.id, rating, comment, jobType || '');
        return res.status(200).json({ status: { success:true } });
    } catch (err) {
        console.error('PUT /reviews/:id error:', err);
        return res.status(500).json({ status: { success:false, msg:'Server error' } });
    }
});

reviews.delete('/:id', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        await DB.deleteReview(req.params.id, req.session.user.id);
        return res.status(200).json({ status: { success:true } });
    } catch (err) {
        console.error('DELETE /reviews/:id error:', err);
        return res.status(500).json({ status: { success:false, msg:'Server error' } });
    }
});

module.exports = reviews;