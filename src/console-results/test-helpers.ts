import { Input, Result, TestResult } from "../types";

// export const getMaxScoreForTest = (runnerResult: Result) =>
//   runnerResult.max_score || 0;

// export const getTotalMaxScore = (runnerResults: Input) => {
//   return runnerResults.testResults.reduce(
//     (acc, { results }) => acc + results.max_score,
//     0
//   );
// };

export const totalPercentageReducer = (
  acc: number,
  {
    score,
    weight,
    maxScore,
  }: { score: number; weight: number; maxScore: number }
) => {
  return acc + ((score || 0) / (maxScore || 1)) * weight;
};

export const getTestScore = (test: Result, pointsPerTest: number) => {
  return test.ok ? pointsPerTest : 0;
};

export const getTestWeight = (maxScore: number, allMaxScores: number) => {
  if (maxScore === 0) {
    return (0).toFixed(1);
  }
  const weight = allMaxScores !== 0 ? (maxScore / allMaxScores) * 100 : 0;

  return Math.round(weight).toFixed(2);
};
