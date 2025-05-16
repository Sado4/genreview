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
      // マージコミットは除外
      const logOutput = execSync(
        `git log ${parentBranch}..HEAD --no-merges --pretty=format:"__COMMIT__%h|%s" -p --reverse`,
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
      const message = isJa
        ? "git log の取得に失敗しました。詳細は出力パネルをご確認ください。"
        : "Failed to get git log. See output panel for details.";

      vscode.window.showErrorMessage(message);

      const outputChannel = vscode.window.createOutputChannel("genreview");
      outputChannel.appendLine(`[Error] git log failed:\n${(err as Error).stack}`);
      outputChannel.show(true);

      return;
    }

    const commitSection = commitBlocks.join("\n\n");

    const prompt = isJa
      ? `
以下は Pull Request の全体差分です。GitHub の PR 上で直接貼り付けられるよう、Markdown形式でコードレビューコメントを出力してください。

- コミットごとの出力ではなく、PR全体を対象として指摘すべき点を**観点別に分類**してMarkdown形式で出力してください
- 以下の観点で、**コード上の事実**に基づいてレビューコメントを記述してください：
  - 冗長・不要なコード、重複ロジック、命名の不備、責務の曖昧さ、関心の分離
  - コメントの不足や曖昧さ、テスト不足、パフォーマンスやセキュリティへの懸念
  - 意図が不明なコードへの質問や指摘
- **変更の背景や目的を推測せず、あくまでコードの差分に基づいて客観的にコメントしてください**
- 各項目は箇条書きで整理し、可能であればレビュー観点ごとに見出しを設けてください

${commitSection}
`.trim()
      : `
The following is the full diff of a Pull Request. Please provide **Markdown-formatted review comments** suitable for posting directly in a GitHub PR.

- Do **not** provide per-commit comments — instead, analyze the diff **as a whole**
- Group your comments by category (e.g., naming, duplication, testing, etc.)
- Focus your feedback strictly on the actual code changes. Consider:
  - Redundant or unnecessary code, duplicated logic, unclear naming, unclear separation of concerns
  - Missing comments or tests, unclear logic, potential performance or security issues
  - Parts where the intention is unclear — ask questions when needed
- **Avoid guessing the intent or purpose** — only comment on what has changed
- Use bullet points and clear section headings per concern category

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
