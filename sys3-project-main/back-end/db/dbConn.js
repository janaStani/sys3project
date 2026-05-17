const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host:               '127.0.0.1',
    user:               process.env.DB_USER,
    password:           process.env.DB_PASS,
    database:           process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
});

// Verify the connection is working on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('DB connection error:', err.message);
        return;
    }
    console.log('DB connection established');
    connection.release();
});

// Promisified query helper — keeps all DB methods clean and consistent
const query = (sql, params) =>
    new Promise((resolve, reject) =>
        pool.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const DB = {};

// Users
DB.AuthUser       = (username)         => query('SELECT * FROM User1 WHERE username = ?', [username]);
DB.CheckUserExists = (username, email) => query('SELECT * FROM User1 WHERE username = ? OR email = ?', [username, email]);
DB.AddUser        = (username, email, password) => query(
    'INSERT INTO User1 (username, email, password) VALUES (?, ?, ?)',
    [username, email, password]
);

// Cars
DB.getUserCars   = (userId)                           => query('SELECT * FROM Car1 WHERE userId = ?', [userId]);
DB.addCar        = (userId, make, model, year, type, mileage) => query(
    'INSERT INTO Car1 (userId, make, model, year, style, mileage) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, make, model, year, type, mileage]
);
DB.deleteCar     = (carId, userId)                    => query('DELETE FROM Car1 WHERE carId = ? AND userId = ?', [carId, userId]);
DB.saveScheduled = (carId, userId, scheduled)         => query(
    'UPDATE Car1 SET scheduled = ? WHERE carId = ? AND userId = ?',
    [scheduled, carId, userId]
);

// Providers
DB.getProviders  = () => query('SELECT * FROM providers');

module.exports = DB;