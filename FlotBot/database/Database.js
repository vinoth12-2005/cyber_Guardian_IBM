const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

/**
 * Database
 * Promise-based wrapper around sqlite3.
 * Provides run(), get(), all() helpers.
 */
class Database {

    constructor(dbPath) {

        this.dbPath = dbPath || path.join(
            process.env.APPDATA || process.env.HOME,
            "FlotBot",
            "flotbot.db"
        );

        this._ensureDir();
        this.db = null;
    }

    _ensureDir() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return reject(err);
                // Enable WAL mode for better concurrent performance
                this.db.run("PRAGMA journal_mode=WAL;");
                this.db.run("PRAGMA foreign_keys=ON;");
                console.log(`[DB] Connected: ${this.dbPath}`);
                resolve();
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve();
            this.db.close((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Execute a statement (INSERT, UPDATE, DELETE, CREATE)
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    /**
     * Fetch a single row
     */
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    /**
     * Fetch all matching rows
     */
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    }

    /**
     * Execute multiple statements in a transaction
     */
    async transaction(statements) {
        await this.run("BEGIN TRANSACTION");
        try {
            for (const { sql, params } of statements) {
                await this.run(sql, params);
            }
            await this.run("COMMIT");
        } catch (err) {
            await this.run("ROLLBACK");
            throw err;
        }
    }

}

module.exports = Database;
