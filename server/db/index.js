const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class UnifiedDatabase {
  constructor() {
    this.driver = null; // 'postgres' | 'sqlite'
    this.pgPool = null;
    this.sqliteDb = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    // 1. Try PostgreSQL if configured
    if (config.db.type === 'postgres') {
      try {
        const poolConfig = config.db.connectionString
          ? { connectionString: config.db.connectionString, ssl: config.db.ssl }
          : {
              host: config.db.host,
              port: config.db.port,
              user: config.db.user,
              password: config.db.password,
              database: config.db.database,
              ssl: config.db.ssl,
            };

        this.pgPool = new Pool(poolConfig);
        const testClient = await this.pgPool.connect();
        await testClient.query('SELECT 1');
        testClient.release();

        this.driver = 'postgres';
        this.connected = true;
        console.log(
          `[Database] Connected successfully to PostgreSQL (${config.db.host}:${config.db.port}/${config.db.database})`
        );
        return;
      } catch (pgErr) {
        console.warn(
          `[Database] PostgreSQL connection failed (${pgErr.message}). Falling back to SQLite for zero-setup execution...`
        );
      }
    }

    // 2. SQLite Connection / Fallback
    const sqlitePath = config.db.sqlitePath;
    const dir = path.dirname(sqlitePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await new Promise((resolve, reject) => {
      this.sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
        if (err) {
          console.error('[Database] Failed to open SQLite DB:', err.message);
          return reject(err);
        }
        // Enable WAL mode for better concurrency and foreign keys
        this.sqliteDb.run('PRAGMA journal_mode = WAL;');
        this.sqliteDb.run('PRAGMA foreign_keys = ON;');
        this.driver = 'sqlite';
        this.connected = true;
        console.log(`[Database] Connected to SQLite database at: ${sqlitePath}`);
        resolve();
      });
    });
  }

  /**
   * Execute parameterized query.
   * Standard SQL uses $1, $2 placeholder format.
   * Automatically adapts to SQLite (?1, ?2) when in SQLite mode.
   */
  async query(text, params = []) {
    if (!this.connected) {
      await this.connect();
    }

    if (this.driver === 'postgres') {
      const res = await this.pgPool.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount,
        fields: res.fields,
      };
    } else {
      // SQLite execution
      // Convert $1, $2, $3... placeholders to ?1, ?2, ?3... for SQLite indexed parameters
      let sqliteSql = text.replace(/\$(\d+)/g, '?$1');

      // Also convert PostgreSQL specific functions / keywords if necessary
      sqliteSql = sqliteSql.replace(/\bILIKE\b/gi, 'LIKE');
      sqliteSql = sqliteSql.replace(/\bNOW\(\)/gi, "datetime('now')");
      sqliteSql = sqliteSql.replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now')");
      sqliteSql = sqliteSql.replace(/\bGEN_RANDOM_UUID\(\)/gi, "lower(hex(randomblob(16)))");

      const hasReturning = /\bRETURNING\b/i.test(sqliteSql);
      const isSelect = /^\s*(SELECT|PRAGMA|WITH)/i.test(sqliteSql) || hasReturning;

      return new Promise((resolve, reject) => {
        if (isSelect) {
          this.sqliteDb.all(sqliteSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve({
              rows: rows || [],
              rowCount: rows ? rows.length : 0,
            });
          });
        } else {
          this.sqliteDb.run(sqliteSql, params, function (err) {
            if (err) return reject(err);
            resolve({
              rows: [{ id: this.lastID }],
              rowCount: this.changes,
              lastID: this.lastID,
            });
          });
        }
      });
    }
  }

  /**
   * Execute multiple raw DDL statements
   */
  async exec(sql) {
    if (!this.connected) {
      await this.connect();
    }

    if (this.driver === 'postgres') {
      return await this.pgPool.query(sql);
    } else {
      return new Promise((resolve, reject) => {
        this.sqliteDb.exec(sql, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }

  async close() {
    if (this.pgPool) {
      await this.pgPool.end();
    }
    if (this.sqliteDb) {
      await new Promise((resolve) => this.sqliteDb.close(resolve));
    }
    this.connected = false;
  }
}

const db = new UnifiedDatabase();

module.exports = db;
