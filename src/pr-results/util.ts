import { context, getOctokit as _getOctokit } from "@actions/github";
import * as core from "@actions/core";
import crypto from "crypto";

export const getSha = () =>
  context.payload.after ??
  context.payload.pull_request?.head.sha ??
  context.sha;

export function getBranch() {
  return context.payload.ref.replace("refs/heads/", "");
}

const hashString = (str: string) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

export const getReportTag = (prNumber: string) => {
  const optionsHash = hashString(prNumber + context.workflow);
  return `<!-- gh classroom action with hash ${optionsHash} -->`;
};

export function getToken() {
  return process.env.GITHUB_TOKEN || core.getInput("token");
}

export function getOctokit() {
  const token = getToken();
  if (!token) {
    throw new Error("No GITHUB_TOKEN found");
  }

  return _getOctokit(token);
}
