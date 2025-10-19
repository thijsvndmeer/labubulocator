import { parse } from "csv-parse";
import fs from "fs";
import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import path from "path";

const csvPath = path.resolve("src", "data", "labubus.csv");

export const syncLabubus = async () => {
  try {
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      await labubuRepository.updateOrCreate(record as Labubu);
    }

    console.log(`Succesfully synced ${csvPath} with the database`);
  } catch (err) {
    console.error(`Error processing ${csvPath}:`, err);
  }
};
