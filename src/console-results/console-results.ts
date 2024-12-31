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
          console.log(`${COLORS.green}✅ ${test.name}${COLORS.reset}`);
        } else {
          console.log(`${COLORS.red}❌ ${test.name}${COLORS.reset}`);
          if (test.diag) {
            if (typeof test.diag === "object") {
              Object.keys(test.diag ?? {}).forEach((key) => {
                const value =
                  typeof test.diag[key] === "object"
                    ? JSON.stringify(test.diag[key], null, 2)
                    : test.diag[key];
                console.log(`${key}: ${value}`);
              });
            }
          }
          if (typeof test.diag === "string") {
            console.log(`${test.diag}`);
          }
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

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
