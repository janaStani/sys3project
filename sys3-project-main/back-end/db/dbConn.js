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
            fuelType TEXT,
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

        CREATE TABLE IF NOT EXISTS ServiceLog (
            logId INTEGER PRIMARY KEY AUTOINCREMENT,
            carId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            serviceId TEXT NOT NULL,      -- e.g. "oil", "brakes"
            serviceName TEXT NOT NULL,    -- snapshot, in case definitions change later
            category TEXT,
            mileageAt INTEGER NOT NULL,   -- car's mileage when service was performed
            date TEXT NOT NULL,           -- ISO date string
            costMin INTEGER,
            costMax INTEGER,
            mechanicName TEXT,
            pricePaid INTEGER,
            mechanicId INTEGER,
            notes TEXT,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(carId) REFERENCES Car(carId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Review (
            reviewId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            providerId INTEGER,
            mechanicName TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            jobType TEXT,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES User(userId) ON DELETE CASCADE
        );

    `);

    // migrations

    const slCols = sqlite.prepare('PRAGMA table_info(ServiceLog)').all().map(c => c.name);
    if (!slCols.includes('mechanicName')) {
        sqlite.exec('ALTER TABLE ServiceLog ADD COLUMN mechanicName TEXT');
        console.log('Added mechanicName column to ServiceLog');
    }
    if (!slCols.includes('pricePaid')) {
        sqlite.exec('ALTER TABLE ServiceLog ADD COLUMN pricePaid INTEGER');
        console.log('Added pricePaid column to ServiceLog');
    }
    if (!slCols.includes('notes')) {
        console.log('notes column already exists');
    }

    const spCols = sqlite.prepare('PRAGMA table_info(ServiceProvider)').all().map(c => c.name);
    if (!spCols.includes('userAdded')) {
        sqlite.exec('ALTER TABLE ServiceProvider ADD COLUMN userAdded INTEGER NOT NULL DEFAULT 0');
    }
    const rvCols = sqlite.prepare('PRAGMA table_info(Review)').all().map(c => c.name);
    if (!rvCols.includes('providerId')) {
        sqlite.exec('ALTER TABLE Review ADD COLUMN providerId INTEGER REFERENCES ServiceProvider(providerId) ON DELETE SET NULL');
    }
    if (!slCols.includes('mechanicId')) {
        sqlite.exec('ALTER TABLE ServiceLog ADD COLUMN mechanicId INTEGER');
        console.log('Added mechanicId column to ServiceLog');
    }

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
        'SELECT carId AS id, userId, make, model, year, style, fuelType, mileage, scheduled FROM Car WHERE userId = ?',
        [userId]
    );

    DB.addCar = (userId, make, model, year, type, mileage, fuelType) => query(
        'INSERT INTO Car (userId, make, model, year, style, mileage, fuelType) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, make, model, year, type, mileage, fuelType]
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
    DB.getProviders = () => query(`
        SELECT s.*,
               COALESCE(AVG(r.rating), 0) AS avgRating,
               COUNT(r.reviewId)          AS reviewCount
        FROM ServiceProvider s
        LEFT JOIN Review r ON r.providerId = s.providerId
        GROUP BY s.providerId
        ORDER BY s.userAdded DESC, avgRating DESC
    `, []);

// instead of hardcoding one syntax, pick based on DB_TYPE:
const INSERT_IGNORE = DB_TYPE === 'sqlite' ? 'INSERT OR IGNORE' : 'INSERT IGNORE';

DB.addProvider = (name, address, phone) => query(
    `${INSERT_IGNORE} INTO ServiceProvider (provider, location, priceRange, userAdded) VALUES (?, ?, ?, 1)`,
    [name, address || '', phone || '']
);

DB.getProviderByName = (name) => query(
    'SELECT * FROM ServiceProvider WHERE provider = ?',
    [name]
);

    DB.addServiceLog = (carId, userId, serviceId, serviceName, category, mileageAt, date, costMin, costMax, mechanicName, pricePaid, notes, mechanicId) => {
        const sql = `
            INSERT INTO ServiceLog 
            (carId, userId, serviceId, serviceName, category, mileageAt, date, costMin, costMax, mechanicName, pricePaid, notes, mechanicId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return query(sql, [
            carId, userId, serviceId, serviceName, category, mileageAt, date, 
            costMin, costMax, 
            mechanicName || '',      // Default to empty string if null
            pricePaid || null,        // Keep as null if not provided
            notes || '',              // Default to empty string if null
            mechanicId || null        // Add mechanicId
        ]);
    };

    DB.getCarServiceLog = (carId, userId) => query(
        'SELECT * FROM ServiceLog WHERE carId = ? AND userId = ? ORDER BY date DESC, logId DESC',
        [carId, userId]
    );

    DB.getUserServiceLog = (userId) => query(
        'SELECT * FROM ServiceLog WHERE userId = ? ORDER BY date DESC, logId DESC',
        [userId]
    );

    DB.deleteServiceLog = (logId, userId) => query(
        'DELETE FROM ServiceLog WHERE logId = ? AND userId = ?',
        [logId, userId]
    );

    DB.getReviews = (userId) => query(
        `SELECT r.reviewId AS id, r.userId, r.providerId, r.mechanicName, r.rating, r.comment, r.jobType, r.createdAt
         FROM Review r
         LEFT JOIN ServiceProvider s ON r.providerId = s.providerId
         WHERE r.userId = ?
         ORDER BY r.createdAt DESC`,
        [userId]
    );

DB.addReview = (userId, providerId, mechanicName, rating, comment, jobType) => query(
    'INSERT INTO Review (userId, providerId, mechanicName, rating, comment, jobType) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, providerId, mechanicName, rating, comment, jobType]
);

DB.updateReview = (reviewId, userId, rating, comment, jobType) => query(
    'UPDATE Review SET rating = ?, comment = ?, jobType = ? WHERE reviewId = ? AND userId = ?',
    [rating, comment, jobType, reviewId, userId]
);

DB.deleteReview = (reviewId, userId) => query(
    'DELETE FROM Review WHERE reviewId = ? AND userId = ?',
    [reviewId, userId]
);
DB.getUserReviewForProvider = (userId, providerId) => query(
    'SELECT reviewId FROM Review WHERE userId = ? AND providerId = ?',
    [userId, providerId]
);

module.exports = DB;