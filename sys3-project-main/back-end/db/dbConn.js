const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const DB_TYPE = (process.env.DB_TYPE || (process.env.DB_HOST ? 'mysql' : 'sqlite')).toLowerCase();

let query;
const DB = {};

if (DB_TYPE === 'sqlite') {
    const Database = require('better-sqlite3');
    const sqliteFile = path.resolve(process.env.DB_FILE || path.join(__dirname, '..', 'db', 'local.db'));
    fs.mkdirSync(path.dirname(sqliteFile), { recursive: true });

    const sqlite = new Database(sqliteFile);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS User (
            userId INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            zipcode TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Car (
            carId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            year INTEGER NOT NULL,
            model TEXT NOT NULL,
            style TEXT,
            mileage INTEGER DEFAULT 0,
            make TEXT NOT NULL,
            scheduled TEXT DEFAULT '{}',
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES User(userId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ServiceProvider (
            providerId INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL UNIQUE,
            priceRange TEXT,
            rating REAL,
            location TEXT
        );
    `);

    const insertProvider = sqlite.prepare(
        'INSERT OR IGNORE INTO ServiceProvider (provider, priceRange, rating, location) VALUES (?, ?, ?, ?)'
    );
    insertProvider.run('CarCare Local Garage', '€40–€120', 4.6, 'Local Service Center');

    query = (sql, params = []) => {
        const statement = sqlite.prepare(sql);
        const op = sql.trim().split(/\s+/)[0].toUpperCase();

        if (op === 'SELECT' || op === 'PRAGMA') {
            return statement.all(params);
        }

        const result = statement.run(params);
        return {
            ...result,
            insertId: result.lastInsertRowid,
            affectedRows: result.changes,
        };
    };
} else {
    const mysql = require('mysql2');
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

    query = (sql, params = []) =>
        new Promise((resolve, reject) =>
            pool.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
        );
}

// Users — table: User, PK: userId
DB.AuthUser        = (username)                  => query('SELECT * FROM User WHERE username = ?', [username]);
DB.CheckUserExists = (username, email)           => query('SELECT * FROM User WHERE username = ? OR email = ?', [username, email]);
DB.AddUser         = (username, email, password, name, surname, zipcode) => query(
    'INSERT INTO User (username, email, password, name, surname, zipcode) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, password, name, surname, zipcode]
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