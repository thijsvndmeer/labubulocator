import { Database } from "sqlite3";
import { getQuery, runQuery, buildOptionsClause, buildSetClause } from "../utils/databaseUtils";
import { QueryCriteria, QueryOptions } from "@labubu/common";

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
    console.log(`REPOSITORY: Initializing ${tableName} repository.`);
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
  protected async create(data: Omit<T, "id">): Promise<string | number> {
    console.log(`REPOSITORY: Creating new record in ${this.tableName}.`);
    // Invalidate cache on create
    this.cache.clear();
    const dataKeys = Object.keys(data);

    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(", ")}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    const result = await runQuery(this.db, sql, Object.values(data));
    console.log(`REPOSITORY: Created new record with ID: ${result.lastID}`);
    return result.lastID;
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
  protected async get<K extends keyof T>(options: QueryOptions<T> = {}, fields?: K[]): Promise<Pick<T, K>[]> {
    const cacheKey = JSON.stringify({ options, fields });
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.cacheDuration)) {
      console.log(`REPOSITORY: Returning cached data for ${this.tableName}.`);
      return cached.data as Pick<T, K>[];
    }

    console.log(`REPOSITORY: Getting records from ${this.tableName}.`);
    const { clause, params } = buildOptionsClause(options);

    const sql = `SELECT ${fields ? fields.join(", ") : "*"} FROM ${this.tableName} ${clause}`;
    const result = await getQuery(this.db, sql, params);

    console.log(`REPOSITORY: Found ${result.length} records in ${this.tableName}.`);
    this.cache.set(cacheKey, { data: result as T[], timestamp: Date.now() });
    return result as Pick<T, K>[];
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
    console.log(`REPOSITORY: Updating records in ${this.tableName}.`);
    // Invalidate cache on update
    this.cache.clear();
    const { clause, params } = buildOptionsClause(criteria);

    const { clause: setClause, params: setParams } = buildSetClause(data);
    if (setParams.length === 0) {
      console.log(`REPOSITORY: No fields to update in ${this.tableName}.`);
      return 0; // No fields to update
    }

    const sql = `UPDATE ${this.tableName} ${setClause} ${clause}`;
    const result = await runQuery(this.db, sql, setParams.concat(params));
    console.log(`REPOSITORY: Updated ${result.changes} records in ${this.tableName}.`);
    return result.changes;
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
    console.log(`REPOSITORY: Deleting records from ${this.tableName}.`);
    // Invalidate cache on delete
    this.cache.clear();
    const { clause, params } = buildOptionsClause(criteria);

    const sql = `DELETE FROM ${this.tableName} ${clause}`;
    const result = await runQuery(this.db, sql, params);
    console.log(`REPOSITORY: Deleted ${result.changes} records from ${this.tableName}.`);
    return result.changes;
  }
}
