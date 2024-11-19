import { context } from "@actions/github";
import { getSha } from "./util";

export function getCommitUrl() {
  return `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${getSha()}`;
}
