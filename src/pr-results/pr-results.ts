import { context } from "@actions/github";
import { Input } from "../types";
import { getPR } from "./get-pr";
import { generateComment } from "./generate-comment";
import { upsertPRComment } from "./upsert-pr-comment";
import * as report from "./report";

export const PullRequestResults = async function ConsoleResults(
  runnerResults: Input
) {
  // On pull_request events get pr number from context
  let prNumber: number | undefined = context?.payload?.pull_request?.number;
  if (!prNumber) {
    //GFor non pull_request event get lookup pr number for branch
    const pr = await getPR();
    prNumber = pr?.number;
  }

  const comment = await generateComment(runnerResults, prNumber);
  report.log(comment);

  if (!prNumber) {
    console.log("No PR number");
    return;
  }

  await upsertPRComment(prNumber, comment);
};
