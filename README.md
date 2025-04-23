# 🔍 PR Review Prompt Generator

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Sado4.genreview?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Sado4.genreview)  
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/Sado4.genreview?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Sado4.genreview)

A VS Code extension that helps you generate AI-ready prompts to **automatically review Pull Request diffs** using tools like ChatGPT.

It analyzes the Git commit diffs in your PR and generates a prompt to help LLMs comment on potential issues, improvements, or questions — as if reviewing your code.

---

> ✨ Now supports **English and Japanese** based on your VS Code display language!

---

## ✨ Features

- Generates a **structured AI prompt** from your commit diffs
- Designed for AI to **suggest GitHub-compatible review comments**
- Copies the prompt to your clipboard — just paste it into ChatGPT or any LLM tool
- 🗣️ **Auto-detects display language** and switches between English and Japanese

## 📸 Demo

![Demo](images/demo.gif)

## 🛠 How to Use

1. Open the Command Palette and run:  
   `Generate PR Review Prompt from Commit Diff`
2. Enter the name of the parent branch (e.g. `main`)
3. The review prompt will be copied to your clipboard!

Paste it into your favorite AI tool and get **review comments** for your PR.

## 💡 Prompt Intent

This extension instructs AI to:

- Review each commit **based on factual code changes**
- Point out potential issues, test gaps, performance or security concerns
- Suggest improvements (refactoring, naming, comments, etc.)
- Ask questions where code changes seem unclear

It avoids speculative feedback and focuses on **objective review**.

## 🌐 Language Support

| VS Code Language | Extension Language |
|------------------|--------------------|
| `English`        | English            |
| `Japanese (ja)`  | Japanese           |

No additional setup required — it just works! 🎉

---

👉 [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=Sado4.genreview)
