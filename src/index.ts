import * as core from "@actions/core";
import { NotifyClassroom } from "./notify-classroom";
import { TapLine } from "./types";
import { ConsoleResults } from "./console-results/console-results";
import { PullRequestResults } from "./pr-results";
import { glob } from "glob";
import { Parser } from "tap-parser";
import fs from "fs";

const MAX_POINTS = process.env["MAX_POINTS"] ?? 100;
const GLOB_PATTERN = process.env["GLOB_PATTERN"] ?? "**/*.tap";
const GLOB_IGNORE = process.env["GLOB_IGNORE"] ?? "node_modules/**";

function getTotalPoints(): number {
  return Number(MAX_POINTS);
}

async function getTapFiles() {
  const tapFiles = await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE });
  return tapFiles;
}

async function getTestResults() {
  const tapFiles = await getTapFiles();

  return tapFiles.map((file) => {
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
async function run() {
  try {
    const testResults = await getTestResults();
    const numberOfTests = testResults.flatMap((r) => r.results).length;
    const maxPoints = getTotalPoints();
    const pointsPerTest = maxPoints / numberOfTests;
    const results = { testResults, maxPoints, pointsPerTest };

    NotifyClassroom(results);
    ConsoleResults(results);
    PullRequestResults(results);

    if (
      results.testResults.some((r) => r.results.some((r) => r.ok === false))
    ) {
      core.setFailed("Some tests failed.");
    }
  } catch (error) {
    //@ts-ignore
    core.setFailed(error.message);
  }
}
run();
