import { Input } from "../types";
import { AggregateResults } from "./aggregate-results";

export function getBody(runnerResults: Input) {
  let grandTotalPassedTests = 0;

  let body = "";

  runnerResults.testResults.forEach((testResult) => {
    // body += `\n🔄 ${testResult.name}:\n`;
    testResult.results
      // .sort((a, b) => {
      //   if (a.ok === b.ok) {
      //     return 0;
      //   }
      //   if (a.ok) {
      //     return -1;
      //   }
      //   return 1;
      // })
      .forEach((test) => {
        if (test.ok) {
          // grandTotalPassedTests++;
          body += `✅ ${test.name}\n`;
        } else {
          body += `❌ ${test.name}\n`;
        }

        if (test.diag) {
          if (typeof test.diag === "object") {
            body += "\n";
            Object.keys(test.diag).forEach((key) => {
              const value =
                typeof test.diag[key] === "object"
                  ? JSON.stringify(test.diag[key], null, 2)
                  : test.diag[key];
              body += `**${key}**: \n\n${value}\n\n`;
            });
            body += "\n";
          }
          if (typeof test.diag === "string") {
            body += `${test.diag}\n`;
          }
        }
      });
  });

  body += "\n## Test Results Summary\n";
  body += AggregateResults(runnerResults);
  return body;
}
