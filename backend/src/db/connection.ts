// ---------------------------------------------------------------------------
// This file owns the single SQLite connection used by the whole backend.
//
// Why SQLite? For a project like this, you don't need a separate database
// server (Postgres/MySQL) running in the background. SQLite stores the
// entire database in ONE FILE (shadowguard.db) sitting right in this
// folder. That means:
//   - No installation, no service to start, no password to configure.
//   - You can literally delete the file and re-run `npm run seed` to reset
//     all data back to a fresh state.
//   - It's still "real SQL" - the same queries would work against Postgres
//     later if this ever needed to scale up.
//
// We use Node's BUILT-IN `node:sqlite` module (available since Node 22)
// instead of a third-party package like `better-sqlite3`. Third-party
// SQLite packages are "native modules" - they contain C++ code that has
// to be compiled for your exact operating system when you run
// `npm install`. On Windows that compilation step requires Visual Studio
// Build Tools, which is a heavy, error-prone install. `node:sqlite` ships
// inside Node itself, so there's nothing to compile - it just works.
// It's still marked "experimental" by Node (you'll see a one-line warning
// in the console when the server starts), but the API is stable enough
// for this project and is on track to become a permanent part of Node.
// ---------------------------------------------------------------------------

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The .db file lives at backend/shadowguard.db
const DB_PATH = path.join(__dirname, '..', '..', 'shadowguard.db');

export const db = new DatabaseSync(DB_PATH);

// WAL mode = better performance for a mix of reads/writes, standard choice.
db.exec('PRAGMA journal_mode = WAL');

/**
 * Creates every table the app needs, if it doesn't already exist.
 * Safe to call every time the server starts (CREATE TABLE IF NOT EXISTS).
 */
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_interactions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      department TEXT NOT NULL,
      aiApplication TEXT NOT NULL,
      requestType TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      dataDetected TEXT NOT NULL,      -- JSON array, e.g. ["PII","Financial"]
      policy TEXT NOT NULL,
      status TEXT NOT NULL,
      promptSummary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS risk_assessments (
      id TEXT PRIMARY KEY,
      interactionId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      aiApplication TEXT NOT NULL,
      requestType TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      riskScore INTEGER NOT NULL,
      factors TEXT NOT NULL,           -- JSON array of strings
      dataDetected TEXT NOT NULL,      -- JSON array
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sensitive_data_detections (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      dataType TEXT NOT NULL,
      severity TEXT NOT NULL,
      aiApplication TEXT NOT NULL,
      user TEXT NOT NULL,
      actionTaken TEXT NOT NULL,
      description TEXT NOT NULL,
      pattern TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      scope TEXT NOT NULL,
      status TEXT NOT NULL,
      lastUpdated TEXT NOT NULL,
      rules INTEGER NOT NULL,
      violations INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      ipAddress TEXT NOT NULL,
      details TEXT NOT NULL,
      metadata TEXT NOT NULL           -- JSON object
    );

    -- Simple key/value tables for the Settings page. Each row is one
    -- JSON blob, since these are single-record "settings" objects
    -- rather than a growing list.
    CREATE TABLE IF NOT EXISTS organization_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS governance_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );
  `);
}
