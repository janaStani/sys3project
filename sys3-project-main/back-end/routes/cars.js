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
        const { make, model, year, type, fuelType, mileage } = req.body;

        if (!make || !model || !year || !type || !fuelType || mileage === undefined) {
            return res.status(400).json({ status: { success: false, msg: 'All fields required' } });
        }

        const result = await DB.addCar(req.session.user.id, make, model, year, type, mileage, fuelType);

        return res.status(201).json({
            id:     result.insertId,
            userId: req.session.user.id,
            make,
            model,
            year,
            style:  type,
            fuelType,
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

cars.post('/:id/complete-service', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const { serviceId, serviceName, category, mileageAt, date, costMin, costMax } = req.body;
        const result = await DB.addServiceLog(
            req.params.id, req.session.user.id,
            serviceId, serviceName, category, mileageAt, date, costMin, costMax
        );
        return res.status(201).json({ id: result.insertId, carId: req.params.id, serviceId, serviceName, category, mileageAt, date, costMin, costMax });
    } catch (err) {
        console.error('POST /cars/:id/complete-service error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

cars.get('/service-log', async (req, res) => {
    if (!requireLogin(req, res)) return;
    try {
        const result = await DB.getUserServiceLog(req.session.user.id);
        return res.status(200).json(Array.isArray(result) ? result : []);
    } catch (err) {
        console.error('GET /cars/service-log error:', err);
        return res.status(500).json([]);
    }
});

cars.delete('/:id/service-log/:logId', async (req, res) => {
    const result = await DB.deleteServiceLog(
        req.params.logId,
        req.session.user.id
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            status: {
                success: false,
                msg: "Service log not found"
            }
        });
    }

    return res.status(200).json({
        status: { success: true }
    });
});

module.exports = cars;