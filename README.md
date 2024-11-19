## Atlas School Autograding Reporter

This repository is a fork of [https://github.com/classroom-resources/autograding-grading-reporter](https://github.com/classroom-resources/autograding-grading-reporter)

### Overview

**Atlas School Autograding Reporter** is a plugin for GitHub Classroom's Autograder. Use it to report the results of the test execution to students and GitHub Classroom.

### Environment Variables

| Env Name               | Description                                     | Required | Default |
| ---------------------- | ----------------------------------------------- | -------- | ------- |
| MAX_POINTS       | Total number of points the assignment is worth  | No       | 100     |
| GLOBAL_PATTERN | File pattern to locate test result files | No      |  **/*.tap  |
| GLOBAL_IGNORE | File pattern to ignore when locating result files | No      |  node_modules/**  |

### TAP (Test Anything Protocol)

This plugins is impleneyted as a TAP consumer. It will parse the TAP output and report the results to GitHub Classroom.

### Usage

1. Add the GitHub Classroom Reporter to your workflow.

```yaml
name: Autograding Tests
on:
  - push
  - workflow_dispatch
  - repository_dispatch
permissions:
  checks: write
  actions: read
  contents: read
jobs:
  run-autograding-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: "Test Case: Test One"
        id: test-one
        uses: classroom-resources/autograding-command-grader@v1
        with:
          test-name: test-one
          command: 'echo "Hello World"'
      - name: "Test Case: Test Two"
        id: test-two
        uses: classroom-resources/autograding-command-grader@v1
        with:
          test-name: test-one
          command: diff "lsdfkjsf" "sljdhfksjdf"
      - name: "Test Case: Test Three"
        id: test-three
        uses: classroom-resources/autograding-command-grader@v1
        with:
          test-name: test-three
          command: diff "lsdfkjsf" "sljdhfksjdf"
      - name: Grade Report
        uses: atlas-school-classroom/autograding-tap-reporter@main
        env:
          ATLAS_MAX_POINTS: 50
```

### Example Output

```
    @@@@@@@@@@@@@@@            @@@@@@      @@@@@@@@@@@                                             
    @@@@@@@@@@@@@@@            @@@@@@      @@@@@@@@@@@                                             
     @@@@@@@@@@@@@@@           @@@@@@          @@@@@@@                                             
       @@@@@@@@@@@@@       @@@@@@@@@@@@@@@     @@@@@@@       @@@@@@@@@@@@@@         @@@@@@@@@@@@@  
      @@@@@@@ @@@@@@@      @@@@@@@@@@@@@@@     @@@@@@@     @@@@@@@@@@@@@@@@@      @@@@@@@@@@@@@@@@@
      @@@@@@   @@@@@@@     @@@@@@@@@@@@@@@     @@@@@@@     @@@@@@@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@
     @@@@@@@   @@@@@@@        @@@@@@@          @@@@@@@     @@@@@@     @@@@@@@    @@@@@@@    @@@@@@@
    @@@@@@@@@@@@@@@@@@@       @@@@@@@          @@@@@@@            @@@@@@@@@@@    @@@@@@@@@@@@      
    @@@@@@@@@@@@@@@@@@@@      @@@@@@@          @@@@@@@      @@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@@ 
   @@@@@@@@@@@@@@@@@@@@@      @@@@@@@          @@@@@@@     @@@@@@@@@@@@@@@@@@      @@@@@@@@@@@@@@@@
   @@@@@@@@@@@@@@@@@@@@@@     @@@@@@@          @@@@@@@    @@@@@@@     @@@@@@@              @@@@@@@@
  @@@@@@@          @@@@@@@    @@@@@@@          @@@@@@@    @@@@@@@   @@@@@@@@@    @@@@@@      @@@@@@
@@@@@@@@@@@@     @@@@@@@@@@@@@  @@@@@@@@@@@ @@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@     @@@@@@@@@@@@@  @@@@@@@@@@@ @@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@
@@@@@@@@@@@@     @@@@@@@@@@@@@    @@@@@@@@@  @@@@@@@@@@@@    @@@@@@@@@ @@@@@@@@@@   @@@@@@@@@@@@@@  



🔄 Processing: ATLAS_TEST_TEST_ONE
✅ test-one
Test code:
echo "Hello World"

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: ATLAS_TEST_TEST_TWO
❌ test-one
Test code:
diff "lsdfkjsf" "sljdhfksjdf"

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: ATLAS_TEST_TEST_THREE
❌ test-three
Test code:
diff "lsdfkjsf" "sljdhfksjdf"

Test runner summary
┌────────────────────┬─────────────┬─────────────┐
│ Test Name   │ Test Score  │ Max Score   │
├────────────────────┼─────────────┼─────────────┤
│ Test one           │ 16.67       │ 16.67       │
├────────────────────┼─────────────┼─────────────┤
│ Test two           │ 0           │ 16.67       │
├────────────────────┼─────────────┼─────────────┤
│ Test three         │ 0           │ 16.67       │
├────────────────────┼─────────────┼─────────────┤
│ Total:             │ 17          │ 50          │
└────────────────────┴─────────────┴─────────────┘
🏆 Grand total tests passed: 1/3

Error: Some tests failed.
```

### Development

[pnpm](https://pnpm.io) is used to manage dependencies. To install dependencies run:
```
pnpm install
```

The github action runs the `dist/index.js` file. To run code in a github action you must build the code and then commit the changes to the dist folder. To build the code run:

```
pnpm build
```

Once built you can push to gihub to run some sample worflows. There are two workflows for testing the action. When pushing to the repository they will automatically run:
 * `error.yml:` This contains three test cases where two the them fail.
 * `success.yml:` This contains three test cases where all three pass.

**IMPORTANT:** In order to not impact students do not push to the main branch for testing. All student assignments run off the main branch. Develop in a feature branch and then only push to main when code has been tested and is ready for student assignments.
