/**
 * The files a bash command wrote, read out of the command line itself.
 *
 * `after-edit-size.ts` is registered for `Edit`, `Write` and `MultiEdit`, and
 * every one of those hands the hook a `file_path`. A session told to make its
 * changes through Bash instead — a heredoc, a `sed -i`, a short `python3`
 * script, which is what an auto-mode lane is instructed to do — writes the
 * same files through a payload that names no path at all, and the notice that
 * exists to arrive *with* the edit does not arrive. One lane wrote seven files
 * that way, took a page to 251 lines, and heard about it from `check:fast` two
 * minutes later, exactly as lanes did before the hook was written.
 *
 * So the paths are recovered from `tool_input.command`. This is not a shell:
 * it knows the four shapes that actually write in this repository and nothing
 * else, and **it says nothing rather than guessing**. A path it fails to find
 * costs what the hook cost before it existed; a path it invents costs a lane a
 * sentence about a file it never touched, which is worse, because the notice's
 * whole value is that it is always about the file in hand.
 *
 * Its own file because the parsing is the change and `after-edit-size.ts` is
 * the decision — and because a shape added here later (PowerShell's
 * `Set-Content`, a `cp` over a tracked file) is a test in `edited.test.ts`
 * rather than a second reading of the hook.
 *
 * **PowerShell is a second table, not a second argument.** `commandsIn`
 * already reads both dialects (`shell-words.ts`) and `>`/`>>` mean the same
 * thing in both, so `redirected` needs nothing extra — but the shapes that
 * actually write there, `Set-Content`, `Add-Content` and `Out-File`, carry
 * their path behind a *named* parameter rather than in operand position, and
 * `sed`, `tee` and a Python heredoc are all absent. The rule stays the one
 * this file is built on: a command it cannot read is silence, not a guess —
 * so a path is only read off the position `PS_WRITERS` names when nothing
 * else in the line could be confused for it.
 */

import { heredocBodies } from "./heredoc.ts";
import { commandsIn, type Dialect } from "./shell-words.ts";

/** A word the shell reads as an option, never as the file being written. */
function isFlag(word: string): boolean {
  return word.startsWith("-") && word !== "-";
}

/** The command's own name, with any directory in front of it dropped. */
function program(args: readonly string[]): string {
  return (args[0] ?? "").split("/").pop() ?? "";
}

/**
 * Targets of an output redirection: the word after `>` or `>>`.
 *
 * `commandsIn` leaves a redirection operator as an ordinary argument, which is
 * exactly what is needed here — the operator and its target survive in order.
 * `<` is left alone on purpose: a command reading a file has not changed it.
 */
function redirected(args: readonly string[]): string[] {
  const found: string[] = [];
  for (let i = 0; i < args.length - 1; i++) {
    const arg = args[i] ?? "";
    const target = args[i + 1] ?? "";
    if ((arg === ">" || arg === ">>") && target !== "" && !isFlag(target)) found.push(target);
  }
  return found;
}

/**
 * `sed`'s own grammar, only as far as this needs it: which of its operands are
 * files rather than the script.
 *
 * A bare `sed 's/a/b/' file` carries its script as the first operand, and a
 * `sed -e 's/a/b/' file` carries it behind the flag instead. Reading that
 * properly rather than taking every operand is the difference between naming
 * the file and also naming `s/a/b/` — which `counted` would drop, but only
 * after this had claimed a command wrote something it did not.
 */
const SCRIPT_FLAG = new Set(["-e", "-f", "--expression", "--file"]);

function sedFiles(rest: readonly string[]): string[] {
  const files: string[] = [];
  let hasScriptFlag = false;
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i] ?? "";
    if (SCRIPT_FLAG.has(arg)) {
      hasScriptFlag = true;
      i++;
      continue;
    }
    if (arg.startsWith("--expression=") || arg.startsWith("--file=")) {
      hasScriptFlag = true;
      continue;
    }
    if (!isFlag(arg)) files.push(arg);
  }
  // With no flag to carry it, the script is the first operand and the files
  // are everything after it.
  return hasScriptFlag ? files : files.slice(1);
}

/**
 * Operands of a command that writes the files it is given: `sed -i` and `tee`.
 *
 * `sed` without `-i` is a reader and contributes nothing; that one flag is the
 * whole difference between printing a file and rewriting it.
 */
function operands(args: readonly string[]): string[] {
  const name = program(args);
  const rest = args.slice(1);
  if (name === "tee") return rest.filter((arg) => !isFlag(arg));
  if (name !== "sed") return [];
  const inPlace = rest.some((arg) => arg === "--in-place" || /^-[a-zA-Z]*i/.test(arg));
  return inPlace ? sedFiles(rest) : [];
}

/**
 * Paths a Python heredoc opens for writing.
 *
 * The body of a heredoc is data the shell never runs, so `commandsIn` keeps it
 * out of the arguments — and a `python3 - <<'PY'` script is the one place in
 * this repository where the file being written is named inside that data. Only
 * a mode that writes counts: an `open(path)` or an `open(path, "r")` is a read.
 */
const OPEN = /\bopen\(\s*(['"])(.+?)\1\s*,\s*(['"])([^'"]*)\3/g;

function opened(body: string): string[] {
  const found: string[] = [];
  for (const match of body.matchAll(OPEN)) {
    const path = match[2] ?? "";
    const mode = match[4] ?? "";
    if (path !== "" && /[wax]/.test(mode)) found.push(path);
  }
  return found;
}

/**
 * PowerShell cmdlets that write a file, and which named parameter carries the
 * path — matched case-insensitively, the way PowerShell itself reads them.
 */
const PS_WRITERS: Record<string, string> = {
  "set-content": "-path",
  "add-content": "-path",
  "out-file": "-filepath",
};

/**
 * Files a PowerShell command writes: `Set-Content`, `Add-Content` and
 * `Out-File`, read off the named flag `PS_WRITERS` gives that cmdlet.
 *
 * The flag is read first because it is unambiguous. A bare positional path —
 * `Set-Content file.ts "x"` — is taken only when `rest` carries no flag at
 * all, the same conservatism `sedFiles` uses for a scriptless `sed`: a flag
 * present anywhere (`-Encoding utf8` with the path itself unnamed) means the
 * first operand might be that flag's value rather than the path, and this
 * would rather say nothing than guess wrong.
 */
function psFiles(args: readonly string[]): string[] {
  const name = program(args).toLowerCase();
  const flag = PS_WRITERS[name];
  if (flag === undefined) return [];
  const rest = args.slice(1);
  for (let i = 0; i < rest.length; i++) {
    if ((rest[i] ?? "").toLowerCase() === flag) {
      const value = rest[i + 1] ?? "";
      return value !== "" && !isFlag(value) ? [value] : [];
    }
  }
  if (rest.some((arg) => isFlag(arg))) return [];
  const first = rest[0] ?? "";
  return first !== "" && !isFlag(first) ? [first] : [];
}

/**
 * Every path `line` looks like it wrote, in the order it named them and once
 * each. An empty list is the ordinary answer for a command that only reads.
 */
export function writtenPaths(line: string, dialect: Dialect = "posix"): string[] {
  const found: string[] = [];
  for (const args of commandsIn(line, dialect)) {
    found.push(...redirected(args));
    found.push(...(dialect === "powershell" ? psFiles(args) : operands(args)));
  }
  if (dialect === "posix") {
    for (const body of heredocBodies(line)) found.push(...opened(body));
  }
  return [...new Set(found.map((path) => path.replaceAll("\\", "/")).filter((p) => p !== ""))];
}
