import {CLIEngine} from "eslint";

export function runLintCheck(fileExtensions: string[], filePatterns: string[]): CLIEngine.LintReport {
  const cli = new CLIEngine({
    extensions: fileExtensions
  });

  return cli.executeOnFiles(filePatterns);
}
