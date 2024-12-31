import * as github from "@actions/github";
import { getBranch, getOctokit } from "./util";

/**
 * Looks for an open PR for the current branch
 */
export async function getPR() {
  const state = "open";
  const branch = getBranch();
  const org = github.context.repo.owner;
  const head = `${org}:${branch}`;

  console.log(head);

  const octokit = getOctokit();

  console.log("owner", github.context.repo.owner);
  console.log("repo", github.context.repo.repo);
  console.log("head ", head);
  // console.log(JSON.stringify(github.context.repo, null, 2));

  const result = await octokit.rest.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head,
  });
  console.log(result);

  const prs = result.data.filter((el) => el.state === state);
  const pr =
    prs.find((el) => {
      console.log(
        "github.context.payload.ref",
        github.context.payload.ref,
        `refs/heads/${el.head.ref}`
      );
      return github.context.payload.ref === `refs/heads/${el.head.ref}`;
    }) || prs[0];
  return pr;
}
