import { Database } from 'sqlite3';
import { ListingData, PersistedListing } from '../types/labubu';
import { BaseRepository } from './baseRepository';

export class ListingRepository extends BaseRepository<PersistedListing> {

    //============================================================================================================================================================================================
    // Constructor
    //============================================================================================================================================================================================

    constructor(db: Database) {
        super(db, 'listings', ['id', 'labubu_id', 'vendor_name', 'product_url', 'listing_title', 'last_checked_at', 'in_stock']);
    }

    //============================================================================================================================================================================================
    // CRUD methods
    //============================================================================================================================================================================================

    // create

    public async create(data: ListingData): Promise<number> {
        return await super.create(data);
    }

    public async findOrCreate(data: ListingData): Promise<number> {
        const existing = await this.find({ product_url: data.product_url}, ['id']);
        if (existing) {
            return existing.id;
        }
        return await super.create(data);
    }

    // read

    public async find(identifier: { id: number } | { product_url: string }): Promise<PersistedListing | null>;

    public async find<K extends keyof PersistedListing>(identifier: { id: number } | { product_url: string }, fields: K[]): Promise<Pick<PersistedListing, K> | null>;

    public async find<K extends keyof PersistedListing>(identifier: { id: number } | { product_url: string }, fields?: K[]): Promise<Pick<PersistedListing, K> | null> {
        return await super.find(identifier, fields);
    }

    // update

    public async update(identifier: { id: number } | { product_url: string }, data: Partial<ListingData>): Promise<number> {
        return await super.update(identifier, data);
    }

    // delete

    public async delete(identifier: { id: number } | { product_url: string }): Promise<number> {
        return await super.delete(identifier);
    }
}