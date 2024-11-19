export type TestResult = {
  version: number;
  status: "pass" | "fail" | "error";
  max_score: number;
  tests: {
    name: string;
    status: "pass" | "fail" | "error";
    line_no: number;
    message: string;
    test_code: string;
  }[];
};

export type Input = {
  testResults: { name: string; results: Result[] }[];
  maxPoints: number;
  pointsPerTest: number;
};

export type GithubRepo = {
  clone_url: string;
};

export type GithubRef = {
  ref: string;
  sha: string;
  repo: GithubRepo;
};

export type PullRequest = {
  base: GithubRef;
  head: GithubRef;
  number: number;
};

/**
 * A representation of a TestPoint result, with diagnostics if present.
 */
export type Result = {
  ok: boolean;
  name: string;
  id: number;
  buffered: boolean;
  tapError: string | null;
  skip: boolean | string;
  todo: boolean | string;
  previous: Result | null;
  plan: Plan | null;
  diag: any | null;
  time: number | null;
  fullname: string;
  closingTestPoint: boolean;
};

/**
 * A class representing the TAP plan line
 */
export type Plan = {
  start: number;
  end: number;
  comment: string;
};

/**
 * The summary results provided in the `complete` event when the TAP
 * stream ends.
 */
export type FinalResults = {
  ok: boolean;
  count: number;
  pass: number;
  fail: number;
  bailout: boolean | string;
  todo: number;
  skip: number;
  failures: TapError[];
  time: number | null;
  passes?: Result[];
  plan: FinalPlan;
  skips: (Result & {
    skip: true | string;
  })[];
  todos: (Result & {
    todo: true | string;
  })[];
};

/**
 * An indication that a violation of the TAP specification has occurred
 *
 * This can indicate a test point that exceeds the plan, a test point
 * encountered after a trailing plan, or in the case of `pragma +strict`,
 * any non-TAP data.
 */
export type TapError =
  | Result
  | {
      tapError: string;
      [k: string]: any;
    };

/**
 * The summary of the plan, for inclusion in the results
 * provided in the `complete` event.
 */
export type FinalPlan = {
  start: number | null;
  end: number | null;
  skipAll: boolean;
  skipReason: string;
  comment: string;
};

export type VersionLine = ["version", number];
export type PlanLine = ["plan", Plan];
export type AssertLine = ["assert", Result];
export type FinalResultsLine = ["complete", FinalResults];
export type TapLine = VersionLine | PlanLine | AssertLine | FinalResultsLine;
