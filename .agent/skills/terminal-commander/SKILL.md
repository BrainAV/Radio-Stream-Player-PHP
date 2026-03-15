---
name: terminal-commander
description: Specialized skill for executing reliable, OS-aware terminal commands. Guards against shell-specific syntax errors (PowerShell vs Bash) and ensures safe escaping of special characters.
---

# Terminal Commander Skill

Use this skill whenever you are about to run complex `run_command` operations, especially those involving chaining, heavy quoting, or database passwords with special characters. This skill ensures your commands execute correctly on the USER's specific OS.

## 🛠️ OS-Aware Syntax Rules (Windows/PowerShell)

### 1. Chain Commands Correctly
Always check `USER_OS` in the environment metadata. 
- **PowerShell (Windows)**: Do NOT use `&&`. Use `;` or `and` (if supported) to chain commands.
    - ❌ `git add . && git commit -m "msg"`
    - ✅ `git add .; git commit -m "msg"`
- **Bash/Zsh (Linux/macOS)**: Use `&&` for conditional execution.

### 2. Guard Against Special Characters
Special characters in passwords (like `&`, `!`, `[`, `{`) are often reserved in PowerShell.
- ALWAYS wrap strings containing special characters in double quotes.
- ❌ `-pPassword!&`
- ✅ `"-pPassword!&"`

### 3. Git Operations
When performing multi-step git operations (add, commit, tag):
- Prefer separate `run_command` calls or separate them with `;` in PowerShell.
- Always check `command_status` after high-risk commands.

## 📋 Pre-Flight Checklist
Before calling `run_command`:
1. [ ] Identify the shell (Windows = PowerShell).
2. [ ] Replace all `&&` with `;` if on Windows.
3. [ ] Escape any passwords or complex strings using quotes.
4. [ ] Verify the current working directory (`Cwd`) is correct for the tool (e.g., `.sql` files need the `database/` path).

## 🛡️ Mitigation Strategy
If a command fails with a "ParserError" or "CommandNotFoundException":
1. Do NOT repeat the exact same command.
2. Read the error carefully (e.g., "The ampersand (&) character is not allowed").
3. Apply this skill's rules to refactor the command and try again.
