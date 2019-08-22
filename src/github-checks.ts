/* eslint-disable @typescript-eslint/camelcase */
import { ChecksUpdateParamsOutput } from "@octokit/rest";
import {Context} from "@actions/github/lib/context";
import Octokit from "@octokit/rest";

const context = new Context();

export function createOctokit(token: string): Octokit {
  return new Octokit({auth: `token ${token}`});
}

export async function createCheck(octokit: Octokit, checkName: string): Promise<number> {
  const {data: {id}} = await octokit.checks.create({
    name: checkName,
    owner: context.repo.owner,
    repo: context.repo.repo,
    head_sha: context.sha,
    status: "in_progress",
    started_at: new Date().toString()
  });

  return id;
}

export async function updateCheck(octokit: Octokit, checkRunId: number, output: ChecksUpdateParamsOutput, conclusion: "success" | "failure"): Promise<void> {
  await octokit.checks.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: "completed",
    completed_at: new Date().toString(),
    output,
    check_run_id: checkRunId,
    conclusion
  });
}
