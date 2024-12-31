import * as github from "@actions/github";
import { getBranch, getOctokit } from "./util";

/**
 * Looks for an open PR for the current branch
 */
export async function getPR() {
  const state = "open";
  const branch = getBranch();
  const octokit = getOctokit();

  const result = await octokit.rest.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: branch,
    state,
  });

  const prs = result.data;
  const pr =
    prs.find((el) => {
      return github.context.payload.ref === `refs/heads/${el.head.ref}`;
    }) || prs[0];
  return pr;
}
