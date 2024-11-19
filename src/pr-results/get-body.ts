import { Input } from "../types";
import { AggregateResults } from "./aggregate-results";

export function getBody(runnerResults: Input) {
  let grandTotalPassedTests = 0;

  let body = "";

  runnerResults.testResults.forEach((testResult) => {
    body += `\n🔄 ${testResult.name}:\n`;
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
          // body += ` - ✅ ${test.name}\n`;
        } else {
          body += ` - ❌ ${test.name}\n`;
          Object.keys(test.diag).forEach((key) => {
            body += `\t${key}: ${JSON.stringify(test.diag[key], null, 2)}\n`;
          });
        }
      });
  });

  body += "\n## Test Results Summary\n";
  body += AggregateResults(runnerResults);
  return body;
}
