import { Database } from "sqlite3";
import { buildClause, getQuery, runQuery, buildWhereClause, WhereOptions } from "../utils/databaseUtils";

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

    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(", ")}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    return (await runQuery(this.db, sql, Object.values(data))).lastID;
  }

  // read

  /**
   * Gets all rows in the database table that matches all the given filters and ranges.
   * If fields are provided, only those columns are returned in the result.
   * @param whereOptions An object containing:
   *          - `filter` An optional object containing the values to search for.
   *          - `ranges` An optional array of ranges to search for.
   * @param fields - An optional array of column names to return in the result.
   * @returns A promise that resolves with an array of the found rows. Is empty if no rows are found.
   * */
  protected async get<K extends keyof T>(whereOptions: WhereOptions<T> = {}, fields: K[] = []): Promise<Pick<T, K>[]> {
    this.ensureValidFields(Object.keys((whereOptions.filter || {})));
    this.ensureValidFields((whereOptions.ranges || []).map((r) => r.field as string));
    this.ensureValidFields(fields as string[]);

    const { fields: whereField, params: whereParam } = buildWhereClause(whereOptions);
    const whereClause = whereField.length > 0 ? ` WHERE ${whereField.join(" AND ")}` : "";

    const sql = `SELECT ${fields.length > 0 ? fields.join(", ") : "*"} FROM ${this.tableName} ${whereClause}`;
    return await getQuery(this.db, sql, whereParam);
  }

  // update

  /**
   * Updates any record in the database table that matches all the given filters and ranges.
   * Only updates the fields provided in the data object.
   * @param whereOptions An object containing:
   *          - `filter` An optional object containing the values to search for.
   *          - `ranges` An optional array of ranges to search for.
   * @param data - An object containing the data to update in the table, excluding the 'id' field.
   * @returns A promise that resolves to the number of rows affected by the update operation.
   */
  protected async update(whereOptions: WhereOptions<T> = {}, data: Partial<Omit<T, "id">>): Promise<number> {
    this.ensureValidFields(Object.keys((whereOptions.filter || {})));
    this.ensureValidFields((whereOptions.ranges || []).map((r) => r.field as string));
    this.ensureValidDataFields(Object.keys(data));

    const { fields: whereField, params: whereParam } = buildWhereClause(whereOptions);
    const whereClause = whereField.length > 0 ? ` WHERE ${whereField.join(" AND ")}` : "";

    const { fields: setFields, params: setParams } = buildClause(data);
    if (setFields.length === 0) {
      return 0; // No fields to update
    }

    const sql = `UPDATE ${this.tableName} SET ${setFields.join(", ")} ${whereClause}`;
    return (await runQuery(this.db, sql, setParams.concat(whereParam))).changes;
  }

  // delete

  /**
   * Deletes any record from the database table that matches all the given filters and ranges.
   * Be carefull! if no filter or ranges are provided, all records will be deleted.
   * @param whereOptions An object containing:
   *          - `filter` An optional object containing the values to search for.
   *          - `ranges` An optional array of ranges to search for.
   * @returns A promise that resolves to the number of rows affected by the delete operation.
   */
  protected async delete(whereOptions: WhereOptions<T> = {}): Promise<number> {
    this.ensureValidFields(Object.keys((whereOptions.filter || {})));
    this.ensureValidFields((whereOptions.ranges || []).map((r) => r.field as string));

    const { fields: whereField, params: whereParam } = buildWhereClause(whereOptions);
    const whereClause = whereField.length > 0 ? ` WHERE ${whereField.join(" AND ")}` : "";

    const sql = `DELETE FROM ${this.tableName} ${whereClause}`;
    return (await runQuery(this.db, sql, whereParam)).changes;
  }
}
