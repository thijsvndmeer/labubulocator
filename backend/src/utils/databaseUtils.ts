import { Database } from "sqlite3";

export type Range<T> =
  | { field: keyof T; min: number }
  | { field: keyof T; max: number }
  | { field: keyof T; min: number; max: number };

export interface QueryOptions<T> {
  filter?: Partial<T>;
  ranges?: Range<T>[];
  sortBy?: keyof T;
  sortOrder?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
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
 * Dynamically builds a SQL SET clause and collects corresponding parameters
 * from a partial data object. This is typically used for UPDATE statements.
 *
 * Properties with `undefined` values in the `data` object are ignored.
 *
 * @param data A partial object containing the key-value pairs to be set.
 *             Keys are converted to `KEY = ?` and values are collected as parameters.
 * @returns An object containing:
 *   - `clause`: The dynamically generated SQL SET clause string (e.g., "SET name = ?, value = ?").
 *   - `params`: An array of corresponding parameter values for the SET clause.
 */
export const buildSetClause = <T>(data: Partial<T>): { clause: string; params: unknown[] } => {
  const clauseList: string[] = [];
  const params: unknown[] = [];

  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined);
  entries.forEach(([key, value]) => {
    clauseList.push(`${key} = ?`);
    params.push(value);
  });

  return { clause: `SET ${clauseList.join(", ")}`, params: params };
};

/**
 * Dynamically builds a combined SQL clause string (WHERE, ORDER BY, LIMIT, OFFSET)
 * and collects corresponding parameters based on the provided query options.
 *
 * This function processes options in the following order:
 * 1. Equality filters (`filter`)
 * 2. Range conditions (`ranges`)
 * 3. Sorting (`sortBy`, `sortOrder`)
 * 4. Pagination (`limit`, `offset`)
 *
 * @param options The QueryOptions object containing various criteria for building the SQL clause.
 *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
 *               Each key-value pair is converted to `KEY = ?`.
 *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
 *               Each range is converted to `FIELD >= ?` and/or `FIELD <= ?`.
 *   - `sortBy`: Optional. The field name to sort the results by.
 *   - `sortOrder`: Optional. The sorting direction, either "ASC" or "DESC".
 *   - `limit`: Optional. The maximum number of rows to return.
 *   - `offset`: Optional. The number of rows to skip. Only valid if `limit` is also present.
 *
 * @returns An object containing:
 *   - `clause`: The dynamically generated SQL clause string (e.g., "WHERE name = ? ORDER BY id ASC LIMIT 10 OFFSET 0").
 *               This string will start with "WHERE", "ORDER BY", or "LIMIT" depending on which options are present.
 *   - `params`: An array of corresponding parameter values for the WHERE clause.
 */
export const buildOptionsClause = <T>(options: QueryOptions<T>): { clause: string; params: unknown[] } => {
  const params: unknown[] = [];

  let whereClause = "";
  if (options.filter || options.ranges) {
    const entries = Object.entries(options.filter || {}).filter(([, value]) => value !== undefined);
    const clauseList: string[] = [];
    entries.forEach(([key, value]) => {
      clauseList.push(`${key} = ?`);
      params.push(value);
    });

    for (const range of options.ranges || []) {
      if ("min" in range) {
        clauseList.push(`${range.field as string} >= ?`);
        params.push(range.min);
      }
      if ("max" in range) {
        clauseList.push(`${range.field as string} <= ?`);
        params.push(range.max);
      }
    }

    whereClause = `WHERE ${clauseList.join(" AND ")}`;
  }

  let sortClause = "";
  if (options.sortBy) {
    sortClause = `ORDER BY ${options.sortBy as string}${options.sortOrder ? ` ${options.sortOrder}` : ""}`;
  }

  let limitClause = "";
  if (options.limit) {
    limitClause += `LIMIT ${options.limit}`;
    if (options.offset) {
      limitClause += ` OFFSET ${options.offset}`;
    }
  }

  return { clause: [whereClause, sortClause, limitClause].join(" "), params: params };
};
