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
        const { mechanicId, mechanicName, rating, comment, jobType } = req.body;
        if (!mechanicId || !mechanicName || !rating || !comment) {
            return res.status(400).json({ status: { success:false, msg:'Missing required fields' } });
        }
        const result = await DB.addReview(req.session.user.id, mechanicId, mechanicName, rating, comment, jobType || '');
        return res.status(201).json({ id: result.insertId, mechanicId, mechanicName, rating, comment, jobType });
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