const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'kwe_keys.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS units (
    unit_number INTEGER PRIMARY KEY,
    owner TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  DROP TABLE IF EXISTS remotes;
  
  CREATE TABLE IF NOT EXISTS remotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_number INTEGER NOT NULL,
    remote_id TEXT UNIQUE NOT NULL,
    entrance_id INTEGER,
    exit_id INTEGER,
    assigned_by TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_number) REFERENCES units(unit_number) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS remote_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_number INTEGER NOT NULL,
    remote_id TEXT NOT NULL,
    action TEXT NOT NULL,
    by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
