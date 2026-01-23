import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { Labubu, Rarity, StockStatus } from '@labubu/common';

export const LABUBU_CSV_FIELDS = [
  'sku',
  'name',
  'series',
  'description',
  'rarity',
  'msrp',
  'stockStatus',
  'kicksdevId',
  'ebaySearchOverride',
] as const;

export type CsvLabubuRecord = Pick<
  Labubu,
  'sku' | 'name' | 'series' | 'description' | 'rarity' | 'msrp' | 'stockStatus' | 'kicksdevId' | 'ebaySearchOverride'
>;

export const LABUBU_CSV_PATH = path.resolve(process.cwd(), 'src', 'data', 'labubus.csv');

const normalizeMsrp = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeRecord = (record: Partial<CsvLabubuRecord>): CsvLabubuRecord => ({
  sku: record.sku ?? '',
  name: record.name ?? '',
  series: record.series ?? '',
  description: record.description ?? '',
  rarity: (record.rarity as Rarity | undefined) ?? '',
  msrp: normalizeMsrp(record.msrp),
  stockStatus: (record.stockStatus as StockStatus | undefined) ?? '',
  kicksdevId: record.kicksdevId ?? '',
  ebaySearchOverride: record.ebaySearchOverride ?? '',
});

const writeRawCsv = async (csvText: string) => {
  await fs.writeFile(LABUBU_CSV_PATH, csvText, 'utf8');
};

export const readLabubuCsvText = async (): Promise<string> => {
  return fs.readFile(LABUBU_CSV_PATH, 'utf8');
};

export const loadLabubusFromCsv = async (): Promise<CsvLabubuRecord[]> => {
  const csvText = await readLabubuCsvText();
  const parsed = Papa.parse<CsvLabubuRecord>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (parsed.errors.length) {
    throw new Error(
      `Failed to parse Labubu CSV: ${parsed.errors.map((e: Papa.ParseError) => e.message).join('; ')}`,
    );
  }

  return parsed.data.map(normalizeRecord);
};

const toCsvText = (records: Partial<CsvLabubuRecord>[]): string => {
  const rows = records.map((record) =>
    LABUBU_CSV_FIELDS.map((field) => {
      const value = (record as Record<string, unknown>)[field];
      if (value === undefined || value === null) return '';
      return typeof value === 'number' ? value.toString() : String(value);
    }),
  );

  return Papa.unparse({
    fields: [...LABUBU_CSV_FIELDS],
    data: rows,
  });
};

export const persistLabubusToCsv = async (records: Partial<CsvLabubuRecord>[]) => {
  const csvText = toCsvText(records);
  await writeRawCsv(csvText);
};

export const upsertLabubuInCsv = async (
  labubu: Partial<CsvLabubuRecord>,
): Promise<{ previousCsvText: string; updatedRecords: CsvLabubuRecord[] }> => {
  const previousCsvText = await readLabubuCsvText();
  const currentRecords = await loadLabubusFromCsv();
  const existingIndex = currentRecords.findIndex((entry) => entry.sku === labubu.sku);

  let normalized: CsvLabubuRecord;

  if (existingIndex >= 0) {
    const merged: Partial<CsvLabubuRecord> = { ...currentRecords[existingIndex] };
    for (const field of LABUBU_CSV_FIELDS) {
      const value = (labubu as Record<string, unknown>)[field];
      if (value !== undefined) {
        (merged as Record<string, unknown>)[field] = value;
      }
    }
    normalized = normalizeRecord(merged);
    currentRecords[existingIndex] = normalized;
  } else {
    normalized = normalizeRecord(labubu);
    currentRecords.push(normalized);
  }

  await persistLabubusToCsv(currentRecords);
  return { previousCsvText, updatedRecords: currentRecords };
};

export const removeLabubuFromCsv = async (
  sku: string,
): Promise<{ previousCsvText: string; updatedRecords: CsvLabubuRecord[] }> => {
  const previousCsvText = await readLabubuCsvText();
  const currentRecords = await loadLabubusFromCsv();
  const filtered = currentRecords.filter((entry) => entry.sku !== sku);

  await persistLabubusToCsv(filtered);
  return { previousCsvText, updatedRecords: filtered };
};

export const replaceCsvWithLabubus = async (
  records: Partial<CsvLabubuRecord>[],
): Promise<{ previousCsvText: string }> => {
  const previousCsvText = await readLabubuCsvText();
  await persistLabubusToCsv(records);
  return { previousCsvText };
};

export const restoreCsvFromBackup = async (csvText: string) => {
  await writeRawCsv(csvText);
};
