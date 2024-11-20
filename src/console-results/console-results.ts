import { Input, TestResult } from "../types";

import { COLORS } from "./colors";
import { AggregateResults } from "./aggregate-results";
import { printLogo } from "./print-logo";

export const ConsoleResults = function ConsoleResults(runnerResults: Input) {
  try {
    let grandTotalPassedTests = 0;
    let grandTotalTests = 0;

    printLogo();

    runnerResults.testResults.forEach((testResult) => {
      console.log(`\n\n🔄 ${testResult.name}`);

      testResult.results.forEach((test) => {
        if (test.ok) {
          grandTotalPassedTests++;
        } else {
          console.log(`\n\n${COLORS.red}❌ ${test.name}${COLORS.reset}\n`);
          Object.keys(test.diag ?? {}).forEach((key) => {
            console.log(`${key}: ${JSON.stringify(test.diag[key], null, 2)}`);
          });
        }
      });
      grandTotalTests += testResult.results.length;
    });

    // Calculate and display grand total points
    AggregateResults(runnerResults);
    console.log(
      `\n${COLORS.cyan}🏆 Grand total tests passed: ${grandTotalPassedTests}/${grandTotalTests}${COLORS.reset}\n`
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};
