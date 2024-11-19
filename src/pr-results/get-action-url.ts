import { context } from "@actions/github";
import { getOctokit } from "./util";

/**
 * Returns the action url to link to the current action job execution
 */
export async function getActionUrl() {
  const octokit = getOctokit();
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const runId = context.runId;

  const jobs = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
    {
      ...context.repo,
      run_id: runId,
    }
  );

  if (jobs.length === 0) {
    console.log("No jobs found");
    return null;
  }

  const job = jobs[0];

  return `https://github.com/${owner}/${repo}/actions/runs/${runId}/job/${job.id}`;
}
