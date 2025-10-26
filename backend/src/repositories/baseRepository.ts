import { Database } from "sqlite3";
import { QueryCriteria, QueryOptions } from "../types/labubu";
import { buildOptionsClause, buildSetClause, getQuery, runQuery } from "../utils/databaseUtils";

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

export abstract class BaseRepository<T> {
  protected readonly db: Database;
  protected readonly tableName: string;
  private cache = new Map<string, CacheEntry<T>>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  /**
   * Constructor for the BaseRepository class.
   * @param db - The SQLite database object.
   * @param tableName - The name of the table in the database.
   */
  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  /**
   * Creates a new record in the database table.
   * @param data - An object containing the data to insert into the table, excluding the 'id' field.
   * @returns A promise that resolves to the ID of the newly created record.
   */
  protected async create(data: Omit<T, "id">): Promise<number> {
    // Invalidate cache on create
    this.cache.clear();
    const dataKeys = Object.keys(data);

    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(", ")}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    return (await runQuery(this.db, sql, Object.values(data))).lastID;
  }

  // read

  /**
   * Retrieves records from the database table based on the provided query options.
   * This method supports filtering, range conditions, sorting, and pagination.
   *
   * @param options The QueryOptions object containing various criteria for building the SQL clause.
   *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
   *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
   *   - `order`: Optional. An array of sorting objects (e.g., `{ by: 'name', direction: 'ASC' }`).
   *   - `limit`: Optional. The maximum number of rows to return.
   *   - `offset`: Optional. The number of rows to skip. Only valid if `limit` is also present.
   * @param fields Optional. An array of column names to return in the result. If omitted, all columns are returned.
   * @returns A promise that resolves with an array of the found rows. Returns an empty array if no rows are found.
   * @throws Error - If any option field or value is invalid (validation performed by `ensureValidOptions`).
   */
  public async get<K extends keyof T>(
    options: QueryOptions<T> = {},
    fields?: K[]
  ): Promise<Pick<T, K>[]> {
    const { clause, params } = buildOptionsClause(options);
    const selectFields = fields ? fields.join(', ') : '*';
    const query = `SELECT ${selectFields} FROM ${this.tableName} ${clause}`;
    const rows = await getQuery<Pick<T, K>>(this.db, query, params);
    if (rows) {
      rows.forEach((row: any) => {
        if (row.priceRange && typeof row.priceRange === 'string') {
          try {
            row.priceRange = JSON.parse(row.priceRange);
          } catch (error) {
            console.error("Error parsing priceRange JSON:", error);
            row.priceRange = null;
          }
        }
      });
    }
    return rows || [];
  }

  // update

  /**
   * Updates records in the database table that match the provided query options.
   * Only updates the fields provided in the data object.
   *
   * @param criteria The QueryCriteria object containing various criteria for building the SQL clause.
   *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
   *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
   * @param data An object containing the data to update in the table, excluding the 'id' field.
   * @returns A promise that resolves to the number of rows affected by the update operation.
   * @throws Error - If any option field or value is invalid, or if data fields are invalid.
   */
  protected async update(criteria: QueryCriteria<T> = {}, data: Partial<Omit<T, "id">>): Promise<number> {
    // Invalidate cache on update
    this.cache.clear();
    const { clause, params } = buildOptionsClause(criteria);

    const { clause: setClause, params: setParams } = buildSetClause(data);
    if (setParams.length === 0) {
      return 0; // No fields to update
    }

    const sql = `UPDATE ${this.tableName} ${setClause} ${clause}`;
    return (await runQuery(this.db, sql, setParams.concat(params))).changes;
  }

  // delete

  /**
   * Deletes any record from the database table that matches all the given filters and ranges.
   * Be carefull! if no filter or ranges are provided, all records will be deleted.
   * @param criteria The QueryCriteria object containing various criteria for building the SQL clause.
   *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
   *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
   * @returns A promise that resolves to the number of rows affected by the delete operation.
   */
  protected async delete(criteria: QueryCriteria<T> = {}): Promise<number> {
    // Invalidate cache on delete
    this.cache.clear();
    const { clause, params } = buildOptionsClause(criteria);

    const sql = `DELETE FROM ${this.tableName} ${clause}`;
    return (await runQuery(this.db, sql, params)).changes;
  }
}
