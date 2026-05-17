const express = require('express');
const cars    = express.Router();
const DB      = require('../db/dbConn.js');

// Reusable auth check — keeps route handlers focused on their actual logic
const requireLogin = (req, res) => {
    if (!req.session.logged_in) {
        res.status(401).json({ status: { success: false, msg: 'Not logged in' } });
        return false;
    }
    return true;
};

// GET /cars — fetch all cars belonging to the logged-in user
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

// POST /cars — add a new car for the logged-in user
cars.post('/', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const { make, model, year, type, mileage } = req.body;

        if (!make || !model || !year || !type || mileage === undefined) {
            return res.status(400).json({ status: { success: false, msg: 'All fields required' } });
        }

        const result = await DB.addCar(req.session.user.id, make, model, year, type, mileage);

        // Return the full car object so the frontend can add it to state immediately
        const newCar = {
            carId:  result.insertId,
            userId: req.session.user.id,
            make,
            model,
            year,
            style: type,
            mileage,
        };

        return res.status(201).json(newCar);
    } catch (err) {
        console.error('POST /cars error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

// DELETE /cars/:id — remove a car (ownership verified via userId in the query)
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

// POST /cars/:id/scheduled — save the scheduled service data for a car
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