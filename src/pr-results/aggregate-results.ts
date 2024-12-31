import { getTestScore } from "./test-helpers";
import { Input } from "../types";
import { markdownTable } from "markdown-table";

function round(number: number, precision: number) {
  const multiplier = Math.pow(10, precision);
  return Math.round(number * multiplier) / multiplier;
}

export function getTableTotals(
  runnerResults: Input,
  pushToTable: (a: [testName: string, score: string]) => void
) {
  return runnerResults.testResults.flatMap((testResult) => {
    // pushToTable([`**${testResult.name}**`, "", ""]);
    return testResult.results.map((result) => {
      const maxScore = runnerResults.pointsPerTest;
      const score = getTestScore(result, runnerResults.pointsPerTest);
      const testName = result.name;

      pushToTable([testName, round(score, 2).toString()]);

      return {
        score,
        maxScore,
      };
    });
  });
}

function capitalize(str: string) {
  return str[0].toUpperCase() + str.toLowerCase().slice(1);
}

export function AggregateResults(runnerResults: Input): string {
  try {
    const data = [["Test Name", "Test Score"]];

    const totals = getTableTotals(runnerResults, (row) => data.push(row));

    // const totalPercent = totals.reduce(totalPercentageReducer, 0).toFixed(2) + "%";
    const totalTestScores = totals.reduce((acc, curr) => acc + curr.score, 0);

    data.push([
      "**Total:**",
      `**${Math.min(Math.round(totalTestScores), runnerResults.maxPoints)} / ${runnerResults.maxPoints}**`,
    ]);

    return markdownTable(data);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
