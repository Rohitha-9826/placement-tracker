const Database = require('better-sqlite3');
const db = new Database('tracker.db');

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        date_applied TEXT,
        status TEXT NOT NULL DEFAULT 'Applied',
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
        );
`);

module.exports = db;