import { Database } from "sqlite3";
import { getQuery, runQuery, buildOptionsClause, QueryOptions, buildSetClause } from "../utils/databaseUtils";

export abstract class BaseRepository<T> {
  protected readonly db: Database;
  protected readonly tableName: string;
  protected readonly validFields: (keyof T)[];

  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  /**
   * Constructor for the BaseRepository class.
   * @param db - The SQLite database object.
   * @param tableName - The name of the table in the database.
   * @param validFields - An array of valid field names for the table. Used for validation.
   */
  constructor(db: Database, tableName: string, validFields: (keyof T)[]) {
    this.db = db;
    this.tableName = tableName;
    this.validFields = validFields;
  }

  //============================================================================================================================================================================================
  // Utils
  //============================================================================================================================================================================================

  /**
   * Ensures that the provided QueryOptions contain valid fields and values.
   * Throws an error if any field in filter, ranges, sortBy, limit, or offset is invalid.
   *
   * @param options The QueryOptions object to validate.
   * @throws Error - If any option field or value is invalid.
   */
  ensureValidOptions(options: Partial<QueryOptions<T>>) {
    if (options.filter) {
      this.ensureValidFields(Object.keys(options.filter));
    }
    if (options.ranges) {
      this.ensureValidFields(options.ranges.map((r) => r.field as string));
    }
    if (options.sortBy) {
      this.ensureValidFields([options.sortBy as string]);
    }
    if (options.sortOrder && !(options.sortOrder === "ASC" || options.sortOrder === "DESC")) {
      throw new Error(`Invalid sort order: ${options.sortOrder}`);
    }
    if (options.limit && !Number.isFinite(options.limit)) {
      throw new Error(`Invalid limit: ${options.limit}`);
    }
    if (options.offset && !Number.isFinite(options.offset)) {
      throw new Error(`Invalid offset: ${options.offset}`);
    }
  }

  /**
   * Ensures that all fields in the given array are valid fields for the table.
   * Throws an error if any of the fields are invalid.
   * @param fields - An array of field names to validate.
   * @throws Error - If any fields are invalid.
   */
  protected ensureValidFields(fields: string[]) {
    for (const field of fields) {
      if (!this.validFields.includes(field as keyof T)) {
        throw new Error(`Invalid field: ${field}`);
      }
    }
  }

  /**
   * Ensures that all fields in the given array are valid data fields for the table.
   * Throws an error if any of the fields are invalid or if a field is 'id'.
   * @param fields - An array of field names to validate.
   * @throws Error - If any fields are invalid.
   */
  protected ensureValidDataFields(fields: string[]) {
    for (const field of fields) {
      if (!this.validFields.includes(field as keyof T) || field === "id") {
        throw new Error(`Invalid field: ${field}`);
      }
    }
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
    const dataKeys = Object.keys(data);
    this.ensureValidDataFields(dataKeys);

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
   *   - `sortBy`: Optional. The field name to sort the results by.
   *   - `sortOrder`: Optional. The sorting direction, either "ASC" or "DESC".
   *   - `limit`: Optional. The maximum number of rows to return.
   *   - `offset`: Optional. The number of rows to skip. Only valid if `limit` is also present.
   * @param fields Optional. An array of column names to return in the result. If omitted, all columns are returned.
   * @returns A promise that resolves with an array of the found rows. Returns an empty array if no rows are found.
   * @throws Error - If any option field or value is invalid (validation performed by `ensureValidOptions`).
   */
  protected async get<K extends keyof T>(options: QueryOptions<T> = {}, fields: K[] = []): Promise<Pick<T, K>[]> {
    this.ensureValidFields(fields as string[]);
    this.ensureValidOptions(options);

    const { clause, params } = buildOptionsClause(options);

    const sql = `SELECT ${fields.length > 0 ? fields.join(", ") : "*"} FROM ${this.tableName} ${clause}`;
    return await getQuery(this.db, sql, params);
  }

  // update

  /**
   * Updates records in the database table that match the provided query options.
   * Only updates the fields provided in the data object.
   *
   * @param options The QueryOptions object containing various criteria for building the SQL clause.
   *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
   *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
   * @param data An object containing the data to update in the table, excluding the 'id' field.
   * @returns A promise that resolves to the number of rows affected by the update operation.
   * @throws Error - If any option field or value is invalid, or if data fields are invalid.
   */
  protected async update(
    options: Pick<QueryOptions<T>, "filter" | "ranges"> = {},
    data: Partial<Omit<T, "id">>
  ): Promise<number> {
    this.ensureValidOptions(options);
    this.ensureValidDataFields(Object.keys(data));

    const { clause, params } = buildOptionsClause(options);

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
   * @param options The QueryOptions object containing various criteria for building the SQL clause.
   *   - `filter`: Optional. Key-value pairs for equality conditions (e.g., `{ name: 'Labubu' }`).
   *   - `ranges`: Optional. An array of range objects (e.g., `{ field: 'msrp', min: 50, max: 100 }`).
   * @returns A promise that resolves to the number of rows affected by the delete operation.
   */
  protected async delete(options: Pick<QueryOptions<T>, "filter" | "ranges"> = {}): Promise<number> {
    this.ensureValidOptions(options);
    const { clause, params } = buildOptionsClause(options);

    const sql = `DELETE FROM ${this.tableName} ${clause}`;
    return (await runQuery(this.db, sql, params)).changes;
  }
}
