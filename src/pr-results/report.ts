import fs from "fs";

export function log(message: string) {
  // console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, message);
  }
}
