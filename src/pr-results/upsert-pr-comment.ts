import { context } from "@actions/github";
import { getOctokit, getReportTag } from "./util";

/**
 * If comment already exists on PR, updates it, otherwise creates a new comment
 */
export async function upsertPRComment(prNumber: number, comment: string) {
  const octokit = getOctokit();
  const commentList = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      ...context.repo,
      issue_number: prNumber,
    }
  );

  const previousReport = commentList.find((comment) =>
    comment.body?.includes(getReportTag(prNumber.toString()))
  );
  if (previousReport) {
    await octokit.rest.issues.updateComment({
      ...context.repo,
      body: comment,
      comment_id: previousReport.id,
    });
  } else {
    await octokit.rest.issues.createComment({
      ...context.repo,
      body: comment,
      issue_number: prNumber,
    });
  }
}
