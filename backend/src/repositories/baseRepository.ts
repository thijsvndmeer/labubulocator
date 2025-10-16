import { Database } from "sqlite3";
import { buildClause, getQuery, runQuery } from "../utils/databaseUtils";

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
   * Ensures that all fields in the given array are valid fields for the table.
   * Throws an error if any of the fields are invalid.
   * @param fields - An array of field names to validate.
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

    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(
      ", "
    )}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    return (await runQuery(this.db, sql, Object.values(data))).lastID;
  }

  // read

  /**
   * Gets all rows in the database table that matches all the given identifiers.
   * If no identifier is provided, an empty array is returned.
   * If fields are provided, only those columns are returned in the result.
   * @param identifier - An object containing the values to search for in the table.
   * @param fields - An optional array of column names to return in the result.
   * @returns A promise that resolves with an array of the found rows. Is empty if no rows are found.
   * */
  protected async get<K extends keyof T>(
    identifier: Partial<T>,
    fields: K[] = []
  ): Promise<Pick<T, K>[]> {
    this.ensureValidFields(Object.keys(identifier));
    const { fields: whereField, params: whereParam } = buildClause(identifier);
    if (whereField.length === 0) {
      return []; // Nothing to get
    }

    this.ensureValidFields(fields as string[]);

    const sql = `SELECT ${fields.length > 0 ? fields.join(", ") : "*"} FROM ${
      this.tableName
    } WHERE ${whereField.join(" AND ")}`;
    return await getQuery(this.db, sql, whereParam);
  }

  /**
   * Gets all rows in the database table.
   * If fields are provided, only those columns are returned in the result.
   * @param fields - An optional array of column names to return in the result.
   * @returns A promise that resolves with an array of all rows. Is empty if the table is empty.
   */
  protected async getAll<K extends keyof T>(
    fields: K[] = []
  ): Promise<Pick<T, K>[]> {
    this.ensureValidFields(fields as string[]);

    const sql = `SELECT ${fields.length > 0 ? fields.join(", ") : "*"} FROM ${
      this.tableName
    }`;
    return await getQuery(this.db, sql);
  }

  // update

  /**
   * Updates any record in the database table that matches all the given identifiers.
   * If no identifier is provided, no records are updated.
   * @param identifier - An object containing the values to search for in the table.
   * @param data - An object containing the data to update in the table, excluding the 'id' field.
   * @returns A promise that resolves to the number of rows affected by the update operation.
   */
  protected async update(
    identifier: Partial<T>,
    data: Partial<Omit<T, "id">>
  ): Promise<number> {
    this.ensureValidFields(Object.keys(identifier));
    const { fields: whereField, params: whereParam } = buildClause(identifier);
    if (whereField.length === 0) {
      return 0; // Nothing to update
    }

    this.ensureValidDataFields(Object.keys(data));
    const { fields: setFields, params: setParams } = buildClause(data);
    if (setFields.length === 0) {
      return 0; // No fields to update
    }

    const sql = `UPDATE ${this.tableName} SET ${setFields.join(
      ", "
    )} WHERE ${whereField.join(" AND ")}`;
    return (await runQuery(this.db, sql, setParams.concat(whereParam))).changes;
  }

  /**
   * Updates all records in the database table.
   * @param data - An object containing the data to update in the table, excluding the 'id' field.
   * @returns A promise that resolves to the number of rows affected by the update operation.
   */
  protected async updateAll(data: Partial<Omit<T, "id">>): Promise<number> {
    this.ensureValidDataFields(Object.keys(data));
    const { fields: setFields, params: setParams } = buildClause(data);
    if (setFields.length === 0) {
      return 0; // No fields to update
    }

    const sql = `UPDATE ${this.tableName} SET ${setFields.join(", ")}`;
    return (await runQuery(this.db, sql, setParams)).changes;
  }

  // delete

  /**
   * Deletes any record from the database table that matches all the given identifiers.
   * If no identifier is provided, no records are deleted.
   * @param identifier - An object containing the values to search for in the table.
   * @returns A promise that resolves to the number of rows affected by the delete operation.
   */
  protected async delete(identifier: Partial<T>): Promise<number> {
    this.ensureValidFields(Object.keys(identifier));
    const { fields: whereField, params: whereParam } = buildClause(identifier);
    if (whereField.length === 0) {
      return 0; // Nothing to delete
    }

    const sql = `DELETE FROM ${this.tableName} WHERE ${whereField.join(
      " AND "
    )}`;
    return (await runQuery(this.db, sql, whereParam)).changes;
  }

  /**
   * Deletes all records from the database table.
   * @returns A promise that resolves to the number of rows affected by the delete operation.
   */
  protected async deleteAll(): Promise<number> {
    const sql = `DELETE FROM ${this.tableName}`;
    return (await runQuery(this.db, sql)).changes;
  }
}
