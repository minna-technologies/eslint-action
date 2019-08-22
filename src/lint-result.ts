/* eslint-disable @typescript-eslint/camelcase */
import {ChecksUpdateParamsOutputAnnotations} from "@octokit/rest";
import {CLIEngine} from "eslint";
import LintResult = CLIEngine.LintResult;

export function convertLintResultToAnnotation(lintResult: LintResult, workspacePath: string): ChecksUpdateParamsOutputAnnotations[] {
  const filePath = lintResult.filePath.substring(workspacePath.length + 1);

  return lintResult.messages.map(lintMessage => {
    let annotationLevel: "notice" | "warning" | "failure";
    switch (lintMessage.severity) {
      case 0:
        annotationLevel = "notice";
        break;
      case 1:
        annotationLevel = "warning";
        break;
      default:
        annotationLevel = "failure";
    }
    const message = `[${lintMessage.ruleId}] ${lintMessage.message}`;
    return {
      path: filePath,
      start_line: lintMessage.line,
      start_column: lintMessage.column,
      end_line: lintMessage.endLine || lintMessage.line,
      end_column: lintMessage.endColumn || lintMessage.column,
      message,
      annotation_level: annotationLevel
    };
  });
}
