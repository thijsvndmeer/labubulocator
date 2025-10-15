import { Database } from 'sqlite3';
import { Labubu } from '@common/types/labubu';
import { PersistedLabubu } from '../types/labubu';
import { BaseRepository } from './baseRepository';

export class LabubuRepository extends BaseRepository<PersistedLabubu> {

    //============================================================================================================================================================================================
    // Constructor
    //============================================================================================================================================================================================

    constructor(db: Database) {
        super(db, 'labubus', ['id', 'sku', 'name', 'series', 'rarity', 'image', 'description', 'msrp']);
    }

    //============================================================================================================================================================================================
    // CRUD methods
    //============================================================================================================================================================================================

    // create

    public async create(data: Labubu): Promise<number> {
        return await super.create(data);
    }

    public async findOrCreate(data: Labubu): Promise<number> {
        const existing = await this.find({ sku: data.sku }, ['id']);
        if (existing) {
            return existing.id;
        }
        return await super.create(data);
    }

    // read

    public async find(identifier: { id: number } | { sku: string }): Promise<PersistedLabubu | null>;

    public async find<K extends keyof PersistedLabubu>(identifier: { id: number } | { sku: string }, fields: K[]): Promise<Pick<PersistedLabubu, K> | null>;

    public async find<K extends keyof PersistedLabubu>(identifier: { id: number } | { sku: string }, fields?: K[]): Promise<Pick<PersistedLabubu, K> | null> {
        return await super.find(identifier, fields);
    }


    // update

    public async update(identifier: { id: number } | { sku: string }, data: Partial<Labubu>): Promise<number> {
        return await super.update(identifier, data);
    }

    // delete

    public async delete(identifier: { id: number } | { sku: string }): Promise<number> {
        return await super.delete(identifier);
    }
}