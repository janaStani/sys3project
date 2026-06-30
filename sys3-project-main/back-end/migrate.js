const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const sqliteFile = path.resolve(process.env.DB_FILE || path.join(__dirname, 'db', 'local.db'));
const db = new Database(sqliteFile);

try {
    db.exec('ALTER TABLE Car ADD COLUMN fuelType TEXT');
    console.log('fuelType column added');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Column already exists, skipping.');
    } else {
        throw err;
    }
}

db.close();

// used on the local SQLLite file