const express = require('express');
const cars    = express.Router();
const DB      = require('../db/dbConn.js');

function requireLogin(req, res) {
    if (!req.session.logged_in) {
        res.status(401).json({ status: { success: false, msg: 'Not logged in' } });
        return false;
    }
    return true;
}

cars.get('/', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const result = await DB.getUserCars(req.session.user.id);
        return res.status(200).json(Array.isArray(result) ? result : []);
    } catch (err) {
        console.error('GET /cars error:', err);
        return res.status(500).json([]);
    }
});

cars.post('/', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const { make, model, year, type, mileage } = req.body;

        if (!make || !model || !year || !type || mileage === undefined) {
            return res.status(400).json({ status: { success: false, msg: 'All fields required' } });
        }

        const result = await DB.addCar(req.session.user.id, make, model, year, type, mileage);

        return res.status(201).json({
            id:     result.insertId,
            userId: req.session.user.id,
            make,
            model,
            year,
            style:  type,
            mileage,
        });
    } catch (err) {
        console.error('POST /cars error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

cars.delete('/:id', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        await DB.deleteCar(req.params.id, req.session.user.id);
        return res.status(200).json({ status: { success: true, msg: 'Car deleted' } });
    } catch (err) {
        console.error('DELETE /cars/:id error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

cars.post('/:id/scheduled', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        await DB.saveScheduled(req.params.id, req.session.user.id, JSON.stringify(req.body));
        return res.status(200).json({ status: { success: true } });
    } catch (err) {
        console.error('POST /cars/:id/scheduled error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

module.exports = cars;