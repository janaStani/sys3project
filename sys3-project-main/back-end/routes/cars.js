const express = require('express');
const cars    = express.Router();
const DB      = require('../db/dbConn.js');
const providers = require('./providers.js'); // Import providers router


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

cars.put('/:id', async (req, res) => {
    console.log("PUT /cars/:id called with:", req.params.id, req.body);
    if (!requireLogin(req, res)) return;
    try {
        const { make, model, year, type, fuelType, mileage } = req.body;
        const carId = req.params.id;
        const userId = req.session.user.id;

        console.log("Updating car:", carId, "for user:", userId);
        console.log("Data:", { make, model, year, type, fuelType, mileage });

        if (!make || !model || !year || !type || !fuelType || mileage === undefined) {
            return res.status(400).json({ status: { success: false, msg: 'All fields required' } });
        }

        // Check if the car belongs to the user
        const cars = await DB.getUserCars(userId);
        console.log("User cars:", cars);
        const carExists = Array.isArray(cars) && cars.some(c => c.id == carId);
        
        if (!carExists) {
            console.log("Car not found for user");
            return res.status(404).json({ status: { success: false, msg: 'Car not found' } });
        }

        console.log("Calling DB.updateCar...");
        await DB.updateCar(carId, userId, make, model, year, type, mileage, fuelType);
        console.log("DB.updateCar completed");

        return res.status(200).json({
            id: parseInt(carId),
            userId: userId,
            make,
            model,
            year,
            style: type,
            fuelType,
            mileage,
        });
    } catch (err) {
        console.error('PUT /cars/:id error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error: ' + err.message } });
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
        const { serviceId, serviceName, category, mileageAt, date, costMin, costMax, mechanicName, mechanicId, pricePaid, notes } = req.body;
        
        let finalMechanicName = mechanicName || '';
        let finalMechanicId = mechanicId || null;
        
        // If no mechanicId but a mechanicName is provided, try to find or create it
        if (!finalMechanicId && finalMechanicName) {
            // Check if provider already exists
            const existing = await DB.getProviderByName(finalMechanicName);
            if (existing && existing.length > 0) {
                finalMechanicId = existing[0].providerId;
            } else {
                // Create new provider
                try {
                    const result = await DB.addProvider(finalMechanicName, '', '');
                    if (result && result.insertId) {
                        finalMechanicId = result.insertId;
                    }
                } catch (err) {
                    console.error('Failed to create new provider:', err);
                }
            }
        }
        
        const result = await DB.addServiceLog(
            req.params.id, req.session.user.id,
            serviceId, serviceName, category, mileageAt, date, costMin, costMax,
            finalMechanicName, pricePaid || null, notes || '', finalMechanicId
        );
        
        return res.status(201).json({ 
            logId: result.insertId, 
            id: result.insetId,
            carId: req.params.id, 
            serviceId, serviceName, category, mileageAt, date, costMin, costMax,
            mechanicName: finalMechanicName, 
            mechanicId: finalMechanicId,
            pricePaid, notes
        });
    } catch (err) {
        console.error('POST /cars/:id/complete-service error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error: ' + err.message } });
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
    if (!requireLogin(req, res)) return;
    try {
        const result = await DB.deleteServiceLog(req.params.logId, req.session.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: { success: false, msg: "Service log not found" } });
        }
        return res.status(200).json({ status: { success: true } });
    } catch (err) {
        console.error('DELETE /cars/:id/service-log error:', err);
        return res.status(500).json({ status: { success: false, msg: 'Server error' } });
    }
});

module.exports = cars;