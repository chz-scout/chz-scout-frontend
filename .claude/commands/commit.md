---
description: "Create well-formatted commits with conventional commit format and emoji"
allowed-tools: ["Bash", "Read", "Glob"]
---

Analyze the current git changes and create a well-formatted commit message following these conventions:

## Commit Format
```
<emoji> <type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Types and Emojis
- ✨ feat: New feature
- 🐛 fix: Bug fix
- 📝 docs: Documentation
- 💄 style: Styling changes
- ♻️ refactor: Code refactoring
- ⚡ perf: Performance improvement
- ✅ test: Adding tests
- 🔧 chore: Build/config changes

## Steps
1. Run `git status` and `git diff --staged` to see changes
2. Analyze the changes and determine the appropriate type
3. Create a concise, meaningful commit message
4. Execute the commit

$ARGUMENTS