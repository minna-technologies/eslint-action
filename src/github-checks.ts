/* eslint-disable @typescript-eslint/camelcase */
import Octokit, {ChecksUpdateParamsOutput, ChecksUpdateParamsOutputAnnotations} from "@octokit/rest";
import {Context} from "@actions/github/lib/context";
import {chunk} from 'lodash';

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
    started_at: new Date().toISOString()
  });

  return id;
}

export async function updateCheck(octokit: Octokit, checkRunId: number, output: ChecksUpdateParamsOutput, conclusion: "success" | "failure"): Promise<void> {
  const MAX_ANNOTATIONS = 50;
  const annotationChunks = chunk(output.annotations, MAX_ANNOTATIONS);

  async function send(annotations: ChecksUpdateParamsOutputAnnotations[])  {
    return octokit.checks.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      status: "completed",
      completed_at: new Date().toISOString(),
      output: {...output, annotations},
      check_run_id: checkRunId,
      conclusion
    });
  }

  if (annotationChunks.length == 0) {
    await send([]);
  } else {
    for (let i = 0; i < annotationChunks.length; i++) {
      const annotationChunk = annotationChunks[i];

      await send(annotationChunk);
    }
  }
}
