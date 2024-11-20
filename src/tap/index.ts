import { glob } from "glob";
import { Parser } from "tap-parser";
import fs from "fs";
import { TapLine } from "../types";

const GLOB_PATTERN = process.env["GLOB_PATTERN"] ?? "**/*.{trx,tap}";
const GLOB_IGNORE = process.env["GLOB_IGNORE"] ?? "node_modules/**";

async function getTapFiles() {
  const tapFiles = await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE });
  return tapFiles;
}

export async function getTapTestResults() {
  const tapFiles = await getTapFiles();

  return tapFiles
    .filter((file) => file.endsWith(".tap"))
    .map((file) => {
      const tapData = fs.readFileSync(file).toString();
      const result = Parser.parse(tapData) as TapLine[];
      return {
        name: file,
        results: result
          .filter((line) => line[0] === "assert")
          .map((line) => line[1]),
      };
    });
}
