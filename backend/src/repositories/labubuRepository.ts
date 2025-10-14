import { Database } from 'sqlite3';
import { Labubu } from '@common/types/labubu';
import { PersistedLabubu } from '../types/labubu';

export class LabubuRepository {
    private db: Database;

    //============================================================================================================================================================================================
    // Constructor
    //============================================================================================================================================================================================

    constructor(db: Database) {
        this.db = db;
    }

    //============================================================================================================================================================================================
    // Utils
    //============================================================================================================================================================================================

    private runQuery(sql: string, params: unknown[] = []): Promise<{ lastID: number, changes: number }> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({lastID: this.lastID, changes: this.changes});
                }
            });
        });
    }

    private getQuery<T>(sql: string, params: unknown[] = []): Promise<T | null> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve((row as T) || null);
                }
            });
        });
    }

    private buildClause<T extends object>(data: Partial<T>): { fields: string[], params: unknown[] } {
        const fields: string[] = [];
        const params: unknown[] = [];

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key as keyof T];
                if (value !== undefined) {
                    fields.push(`${key} = ?`);
                    params.push(value);
                }
            }
        }
        return { fields, params };
    }

    //============================================================================================================================================================================================
    // CRUD methods
    //============================================================================================================================================================================================

    // create

    async findOrCreate(data: Labubu): Promise<number> {
        const { lastID: insertResult } = await this.runQuery(
            'INSERT OR IGNORE INTO labubus (sku, name, series, rarity, image, description, msrp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.sku, data.name, data.series, data.rarity, data.image, data.description, data.msrp]
        );
        
        if (insertResult == 0) {
            // result of get querry should never be null.
            const sql = 'SELECT id FROM labubus WHERE sku = ?';
            const getResult = await this.getQuery<{id: number}>(sql, [data.sku]) || {id: 0};
            return getResult.id;      
        }
        return insertResult;
    }

    // read

    async find(identifier: { id: number } | { sku: string }): Promise<PersistedLabubu | null>;

    async find<K extends keyof PersistedLabubu>(identifier: { id: number } | { sku: string }, fields?: (K)[]): Promise<Pick<PersistedLabubu, K> | null> {
        
        const { fields: whereField, params: whereParam } = this.buildClause<{ id: number } | { sku: string }>(identifier);
        if (whereField.length !== 1) {
            throw new Error("Invalid identifier provided for update");
        }

        const sql = `SELECT ${fields ? fields.join(', ') : '*'} FROM labubus WHERE ${whereField}`;
        return await this.getQuery(sql, whereParam);
    }

    // update

    async update(identifier: { id: number } | { sku: string }, data: Partial<Labubu>): Promise<void> {

        const { fields: whereField, params: whereParam } = this.buildClause<{ id: number } | { sku: string }>(identifier);
        if (whereField.length !== 1) {
            throw new Error("Invalid identifier provided for update");
        }

        const { fields: setFields, params: setParams } = this.buildClause<Labubu>(data);
        if (setFields.length === 0) {
            return; // No fields to update
        }

        const sql = `UPDATE labubus SET ${setFields.join(', ')} WHERE ${whereField}`;
        await this.runQuery(sql, setParams.concat(whereParam));
    }

    // delete

    async delete(identifier: { id: number } | { sku: string }): Promise<boolean> {

        const { fields: whereField, params: whereParam } = this.buildClause<{ id: number } | { sku: string }>(identifier);
        if (whereField.length !== 1) {
            throw new Error("Invalid identifier provided for update");
        }

        const sql = `DELETE FROM labubus WHERE ${whereField}`;
        const { changes: changes } = await this.runQuery(sql, whereParam);
        return changes > 0;
    }
}