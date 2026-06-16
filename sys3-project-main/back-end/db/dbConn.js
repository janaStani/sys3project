const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host:               process.env.DB_HOST || '127.0.0.1',
    port:               process.env.DB_PORT || 3306,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASS,
    database:           process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('DB connection error:', err.message);
        return;
    }
    console.log('DB connection established');
    connection.release();
});

const query = (sql, params) =>
    new Promise((resolve, reject) =>
        pool.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const DB = {};

// Users — table: User, PK: userId
DB.AuthUser        = (username)                  => query('SELECT * FROM User WHERE username = ?', [username]);
DB.CheckUserExists = (username, email)           => query('SELECT * FROM User WHERE username = ? OR email = ?', [username, email]);
DB.AddUser         = (username, email, password) => query(
    'INSERT INTO User (username, email, password) VALUES (?, ?, ?)',
    [username, email, password]
);

// Cars — table: Car, PK: carId aliased to id so frontend always uses car.id
DB.getUserCars = (userId) => query(
    'SELECT carId AS id, userId, make, model, year, style, mileage, scheduled FROM Car WHERE userId = ?',
    [userId]
);

DB.addCar = (userId, make, model, year, type, mileage) => query(
    'INSERT INTO Car (userId, make, model, year, style, mileage) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, make, model, year, type, mileage]
);

DB.deleteCar = (carId, userId) => query(
    'DELETE FROM Car WHERE carId = ? AND userId = ?',
    [carId, userId]
);

DB.saveScheduled = (carId, userId, scheduled) => query(
    'UPDATE Car SET scheduled = ? WHERE carId = ? AND userId = ?',
    [scheduled, carId, userId]
);

// ServiceProvider — lat/lng not in schema so always returns all providers
DB.getProviders = () => query('SELECT * FROM ServiceProvider', []);

module.exports = DB;