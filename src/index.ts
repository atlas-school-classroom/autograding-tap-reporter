import * as core from "@actions/core";
import { NotifyClassroom } from "./notify-classroom";
import { TapLine } from "./types";
import { ConsoleResults } from "./console-results/console-results";
import { PullRequestResults } from "./pr-results";
import { getTestResults } from "./tap";
import { getTrxTestResults } from "./trx";

const MAX_POINTS = process.env["MAX_POINTS"] ?? 100;

function getTotalPoints(): number {
  return Number(MAX_POINTS);
}

async function run() {
  try {
    await getTrxTestResults();
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
