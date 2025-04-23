import * as vscode from "vscode";
import { execSync } from "child_process";

export async function activate(context: vscode.ExtensionContext) {
	const lang = vscode.env.language;
	const isJa = lang.startsWith("ja");

  const disposable = vscode.commands.registerCommand("genreview.generateReviewPrompt", async () => {

    const parentBranch = await vscode.window.showInputBox({
      prompt: isJa ? "親ブランチ名を入力してください（例: main）" : "Enter the parent branch name (e.g., main)",
    });

    if (!parentBranch) return;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage(
        isJa ? "ワークスペースが開かれていません。" : "No workspace folder is open."
      );
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    // コミットログ整形
    let commitBlocks: string[] = [];
    try {
      const logOutput = execSync(
        `git log ${parentBranch}..HEAD --pretty=format:"__COMMIT__%h|%s" -p --reverse`,
        { cwd: rootPath }
      ).toString();

      const logs = logOutput.split("__COMMIT__").slice(1);

      for (const block of logs) {
        const [line, ...diffLines] = block.split("\n");
        const [shortHash, subject] = line.split("|");

        const diff = diffLines.join("\n").trim();
        const entry = `### ${shortHash} - ${subject}\n\n\`\`\`diff\n${diff}\n\`\`\``;
        commitBlocks.push(entry);
      }
    } catch (err) {
      vscode.window.showErrorMessage(isJa ? "git log の取得に失敗しました。" : "Failed to get git log.");
      return;
    }

    const commitSection = commitBlocks.join("\n\n");

    const prompt = isJa
      ? `
以下は Pull Request の差分です。レビューコメントをコード上の事実に基づいて、マークダウン形式のコードスニペットで出力してコピーできるように作成してください。

- 各コミットに対して、GitHub の PR 上に貼れるような **見出し付き Markdown 形式** で出力してください
- 以下のような観点で、指摘・提案・質問を行ってください
  - 冗長・不要なコード、重複ロジック、命名、責務、関心の分離
  - コメントの不足や曖昧さ、テスト不足、パフォーマンスやセキュリティの懸念
  - 変更の意図が曖昧な箇所への質問
- **意図や背景を推測せず、あくまで変更されたコードの事実に基づいて客観的にレビュー**してください

${commitSection}
`.trim()
      : `
Below is the diff from a Pull Request.
Please provide **Markdown-formatted review comments** based on the actual code changes and make it copyable.

- Comment on each commit using a clear Markdown heading (e.g. \`### abc1234 - Summary\`)
- Include suggestions, concerns, or questions about:
  - Redundant or unused code, duplicated logic, naming, unclear responsibilities, separation of concerns
  - Lack of comments, unclear logic, missing tests, performance or security issues
  - Parts of the code where the intent is unclear — ask questions!
- **Do not infer intent** — base your review only on what has changed in the code

${commitSection}
`.trim();

    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(
      isJa ? "📋 レビュープロンプトをクリップボードにコピーしました！" : "📋 Review prompt copied to clipboard!"
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
