import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import process from 'process';

dotenv.config();

const sql = neon(process.env.NETLIFY_DATABASE_URL);

async function createUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createUnitsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS units (
      unit_number INTEGER PRIMARY KEY,
      owner TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function dropRemotesTable() {
  await sql`DROP TABLE IF EXISTS remotes;`;
}

async function createRemotesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS remotes (
      id SERIAL PRIMARY KEY,
      unit_number INTEGER NOT NULL,
      remote_id TEXT UNIQUE NOT NULL,
      entrance_id INTEGER,
      exit_id INTEGER,
      assigned_by TEXT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_number) REFERENCES units(unit_number) ON DELETE CASCADE
    );
  `;
}

async function createRemoteHistoryTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS remote_history (
      id SERIAL PRIMARY KEY,
      unit_number INTEGER NOT NULL,
      remote_id TEXT NOT NULL,
      action TEXT NOT NULL,
      by TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function initializeSchema() {
  await createUsersTable();
  await createUnitsTable();
  await dropRemotesTable();
  await createRemotesTable();
  await createRemoteHistoryTable();
}

export { sql, initializeSchema };
