import { Database } from 'sqlite3';
import { PersistedPriceEntry, PriceEntryData } from '../types/labubu';
import { BaseRepository } from './baseRepository';

export class PriceHistoryRepository extends BaseRepository<PersistedPriceEntry> {

    //============================================================================================================================================================================================
    // Constructor
    //============================================================================================================================================================================================

    constructor(db: Database) {
        super(db, 'price_history', ['id', 'listing_id', 'price', 'date']);
    }

    //============================================================================================================================================================================================
    // CRUD methods
    //============================================================================================================================================================================================

    // create

    public async create(data: PriceEntryData): Promise<number> {
        return await super.create(data);
    }

    // read

    public async find(identifier: { id: number }): Promise<PersistedPriceEntry | null>;

    public async find<K extends keyof PersistedPriceEntry>(identifier: { id: number }, fields: K[]): Promise<Pick<PersistedPriceEntry, K> | null>;

    public async find<K extends keyof PersistedPriceEntry>(identifier: { id: number }, fields?: K[]): Promise<Pick<PersistedPriceEntry, K> | null> {
        return await super.find(identifier, fields);
    }

    // update

    public async update(identifier: { id: number }, data: Partial<PriceEntryData>): Promise<number> {
        return await super.update(identifier, data);
    }

    // delete

    public async delete(identifier: { id: number }): Promise<number> {
        return await super.delete(identifier);
    }
}