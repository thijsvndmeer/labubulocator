import { Database } from "sqlite3";

export type Range<T> =
  | { field: keyof T; min: number }
  | { field: keyof T; max: number }
  | { field: keyof T; min: number; max: number };

export interface WhereOptions<T> {
  filter?: Partial<T>;
  ranges?: Range<T>[];
}

/**
 * Executes a SQL statement that doesn't return rows (e.g., INSERT, UPDATE, DELETE).
 * @param db The database connection object.
 * @param sql The SQL statement to execute.
 * @param params An array of parameters to bind to the SQL statement.
 * @returns A promise that resolves with the last inserted ID and the number of rows changed.
 */
export const runQuery = (
  db: Database,
  sql: string,
  params: unknown[] = []
): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Executes a SQL query that returns an array of rows. Returns an empty array if no rows are found.
 * @param db The database connection object.
 * @param sql The SQL query to execute.
 * @param params An array of parameters to bind to the SQL query.
 * @returns A promise that resolves with an array of the found rows. Is empty if no rows are found.
 */
export const getQuery = <T>(db: Database, sql: string, params: unknown[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T[]);
      }
    });
  });
};

/**
 * Builds a SQL clause from a data object, for use in WHERE or SET statements.
 * It converts object keys to `key = ?` strings and collects the corresponding values.
 * Properties with `undefined` values are ignored.
 * @param data The object to convert into a clause.
 * @returns An object containing an array of fields strings (e.g., `['key1 = ?', 'key2 = ?']`) and an array of their corresponding values.
 */
export const buildClause = <T>(data: Partial<T> = {}): { fields: string[]; params: unknown[] } => {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);

  const fields = entries.map(([key]) => `${key} = ?`);
  const params = entries.map(([, value]) => value);

  return { fields, params };
};

/**
 * Builds SQL WHERE clauses and corresponding parameters by combining equality filters and range conditions.
 * This method processes equality filters first, then appends range conditions.
 *
 * @param whereOptions An object containing:
 *          - `filter` An optional object containing key-value pairs for equality conditions. Each key will be converted to {KEY = ?} and pushed to fields. The values are pushed to params.
 *          - `ranges` An optional array of range objects. Each object specifies a field, and either a 'min' value, a 'max' value, or both.
 *                     Each Range will be converted to {KEY >= ?} {KEY <= ?} and pushed to fields. The min-max values are pushed to params.
 * @returns An object containing:
 *          - `fields`: An array of SQL WHERE clause strings (e.g., `['KEY = ?', 'KEY >= ?']`).
 *          - `params`: An array of corresponding parameter values in the correct order.
 */
export const buildWhereClause = <T>(whereOptions: WhereOptions<T>): { fields: string[]; params: unknown[] } => {
  const result = buildClause(whereOptions.filter || {});

  for (const range of whereOptions.ranges || []) {
    if ("min" in range) {
      result.fields.push(`${range.field as string} >= ?`);
      result.params.push(range.min);
    }
    if ("max" in range) {
      result.fields.push(`${range.field as string} <= ?`);
      result.params.push(range.max);
    }
  }

  return result;
};
