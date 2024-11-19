## Atlas School Autograding Reporter

This repository is a fork of [https://github.com/classroom-resources/autograding-grading-reporter](https://github.com/classroom-resources/autograding-grading-reporter)

## Overview

**Atlas School Autograding Reporter** is a plugin for GitHub Classroom's Autograder. Use it to report the results of the test execution to students and GitHub Classroom.

### TAP (Test Anything Protocol)

This plugins utilizes the [Test Anything Protocol](https://testanything.org/). It is implemented as a TAP consumer. The github action will scan for tap files in the workspace and parse the result into a report. Example TAP output:

```
TAP version 13
1..8
ok 1 - __tests__/subtract.test.js > adds 1 - 2 to equal -1 # time=0.67ms
ok 2 - __tests__/subtract.test.js > adds -1 - -2 to equal 1 # time=0.15ms
ok 3 - __tests__/subtract.test.js > adds 1 - 0 to equal 1 # time=0.06ms
not ok 4 - __tests__/subtract.test.js > adds 0 + 0 to equal 0 # time=3.37ms
    ---
    error:
        name: "AssertionError"
        message: "expected 1 to be +0 // Object.is equality"
    at: "/Users/jeremiahswank/GH-CS1100/tap-test/__tests__/subtract.test.js:17:28"
    actual: "1"
    expected: "0"
    ...
ok 5 - __tests__/sum.test.js > adds 1 + 2 to equal 3 # time=0.63ms
ok 6 - __tests__/sum.test.js > adds -1 + -2 to equal -3 # time=0.15ms
ok 7 - __tests__/sum.test.js > adds 1 + 0 to equal 1 # time=0.42ms
not ok 8 - __tests__/sum.test.js > adds 0 + 0 to equal 0 # time=3.10ms
    ---
    error:
        name: "AssertionError"
        message: "expected 1 to be +0 // Object.is equality"
    at: "/Users/jeremiahswank/GH-CS1100/tap-test/__tests__/sum.test.js:17:23"
    actual: "1"
    expected: "0"
    ...
```

To find a library that supports TAP output for a given language, checkout [TAP Producers](https://testanything.org/producers.html)

## Setup

### Environment Variables

| Env Name               | Description                                     | Required | Default |
| ---------------------- | ----------------------------------------------- | -------- | ------- |
| MAX_POINTS       | Total number of points the assignment is worth  | No       | 100     |
| GLOBAL_PATTERN | File pattern to locate test result files | No      |  **/*.tap  |
| GLOBAL_IGNORE | File pattern to ignore when locating result files | No      |  node_modules/**  |

### Usage

1. Add the GitHub Classroom Reporter to your workflow.

```yaml
name: Grading Report
on:
  - push
  - workflow_dispatch
permissions:
  checks: write
  actions: read
  contents: read
  pull-requests: write
jobs:
  run-autograding-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Grade Report
        uses: atlas-school-classroom/autograding-tap-reporter@main
        env:
          MAX_POINTS: 50
          GLOBAL_PATTERN: "**/*.tap"
          GLOBAL_IGNORE: "node_modules/**"
```

## Output

### Console Output

The action will output the report directly to the console in the github action. It will also fail the action if there are any failing tests

![](./assets/console.png)

### Job Summary

The report will be displays on the job summary for the github action.

![](./assets/job-summary.png)

### Pull Request

If there is an open pull request for the current branch the report will be added as a comment to the pull request.

![](./assets/pr.png)

### Development

[pnpm](https://pnpm.io) is used to manage dependencies. To install dependencies run:
```
pnpm install
```

The github action runs the `dist/index.js` file. To run code in a github action you must build the code and then commit the changes to the dist folder. To build the code run:

```
pnpm build
```

Once built you can push to gihub to run a sample worflow. There a workflow setup for testing the action. When pushing to the repository it will automatically run.

**IMPORTANT:** In order to not impact students do not push to the main branch for testing. All student assignments run off the main branch. Develop in a feature branch and then only push to main when code has been tested and is ready for student assignments.
