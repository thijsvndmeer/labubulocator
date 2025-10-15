import { Database } from "sqlite3";

/**
 * Executes a SQL statement that doesn't return rows (e.g., INSERT, UPDATE, DELETE).
 * @param db The database connection object.
 * @param sql The SQL statement to execute.
 * @param params An array of parameters to bind to the SQL statement.
 * @returns A promise that resolves with the last inserted ID and the number of rows changed.
 */
export const runQuery = (db: Database, sql: string, params: unknown[] = []): Promise<{ lastID: number, changes: number }> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({lastID: this.lastID, changes: this.changes});
            }
        });
    });
}

/**
 * Executes a SQL query that is expected to return a single row.
 * @param db The database connection object.
 * @param sql The SQL query to execute.
 * @param params An array of parameters to bind to the SQL query.
 * @returns A promise that resolves with the first row found as type T, or null if no rows are returned.
 */
export const getQuery = <T>(db: Database, sql: string, params: unknown[] = []): Promise<T | null> => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve((row as T) || null);
            }
        });
    });
}

/**
 * Builds a SQL clause from a data object, for use in WHERE or SET statements.
 * It converts object keys to `key = ?` strings and collects the corresponding values.
 * Properties with `undefined` values are ignored.
 * @param data The object to convert into a clause.
 * @returns An object containing an array of clause strings (`fields`) and an array of their corresponding values (`params`).
 */
export const buildClause = <T extends object>(data: Partial<T>): { fields: string[], params: unknown[] } => {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);

    const fields = entries.map(([key]) => `${key} = ?`);
    const params = entries.map(([, value]) => value);

    return { fields, params };
}