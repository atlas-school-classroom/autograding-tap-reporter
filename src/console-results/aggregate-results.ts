import Table from "cli-table3";
import { getTestScore } from "./test-helpers";
import { Input, TestResult } from "../types";
import { COLORS } from "./colors";

function round(number: number, precision: number) {
  const multiplier = Math.pow(10, precision);
  return Math.round(number * multiplier) / multiplier;
}

export function getTableTotals(
  runnerResults: Input,
  pushToTable: (
    a: [testName: string, score: number | string, maxScore: number | string]
  ) => void
) {
  return runnerResults.testResults.flatMap((testResult) => {
    pushToTable([testResult.name, "", ""]);
    return testResult.results.map((results) => {
      const maxScore = runnerResults.pointsPerTest;
      const score = getTestScore(results, runnerResults.pointsPerTest);
      const testName = results.name;

      pushToTable([testName, round(score, 2), round(maxScore, 2)]);

      return {
        score,
        maxScore,
      };
    });
  });
}

export function AggregateResults(runnerResults: Input) {
  try {
    const table = new Table({
      head: ["Test Name", "Test Score", "Max Score"],
    });

    const totals = getTableTotals(runnerResults, (row) => table.push(row));

    // const totalPercent = totals.reduce(totalPercentageReducer, 0).toFixed(2) + "%";
    const totalTestScores = totals.reduce((acc, curr) => acc + curr.score, 0);

    table.push([
      "Total: ",
      `${Math.min(Math.round(totalTestScores), runnerResults.maxPoints)}`,
      `${runnerResults.maxPoints}`,
    ]);

    console.log(`\n${COLORS.cyan}Test Results Summary${COLORS.reset}\n`);
    console.log(table.toString());
  } catch (error: any) {
    throw new Error(error.message);
  }
}
