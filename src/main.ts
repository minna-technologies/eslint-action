import * as core from "@actions/core";

import {createCheck, createOctokit, updateCheck} from "./github-checks";
import {ChecksUpdateParamsOutput} from "@octokit/rest";
import {runLintCheck} from "./eslint";
import {flatMap, get} from "lodash";
import {convertLintResultToAnnotation} from "./lint-result";
import {spawnSync} from "child_process";

const githubToken = core.getInput("GITHUB_TOKEN", {required: true});
const filePatterns = core.getInput("FILE_PATTERNS", {required: true});
console.log(`file patterns: ${filePatterns} - ${JSON.stringify(filePatterns)}`);
const fileExtensions = core.getInput("FILE_EXTENSIONS").split(",") || [".js", ".jsx", ".tsx", ".ts"];
const installCommand = core.getInput("INSTALL_COMMAND");
const workspacePath = process.env.GITHUB_WORKSPACE;

const checkName = "ESLint check";

const octokit = createOctokit(githubToken);

async function run() {
  const installOutput = spawnSync(installCommand);
  if (installOutput.status != 0) {
    core.setFailed(`Failed to run install command: ${installCommand}`);
  }

  const checkId = await createCheck(octokit, checkName);

  const lintReport = runLintCheck(fileExtensions, filePatterns.split(","));

  const annotations = flatMap(lintReport.results.filter(result => result.messages.length > 0), lintResult => convertLintResultToAnnotation(lintResult, workspacePath));

  const outputMessage = `${lintReport.errorCount} error(s), ${lintReport.warningCount} warning(s) found.`;
  const output: ChecksUpdateParamsOutput = {
    summary: outputMessage,
    annotations
  };
  console.info(outputMessage);

  const conclusion = lintReport.errorCount > 0 ? "success" : "failure";

  await updateCheck(octokit, checkId, output, conclusion);
}

run().catch(error => {
  console.error(error);
  const message = get(error, "message", "");
  core.setFailed(`Action script failed, ${message}`);
});
