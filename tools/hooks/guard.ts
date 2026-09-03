#!/usr/bin/env bun

/**
 * The PreToolUse guard: a handful of Bash commands that are wrong in this repo
 * specifically, and wrong in a way that only shows up once something else is
 * already broken. A stage-everything that scoops up another lane's
 * half-finished edit, a push to main that bypasses `bun run land`'s
 * check-then-fast-forward order, a hot server that steals the human's port, a
 * worktree-remove that deletes the ground a session is standing on, a
 * formatter run in the mode that deletes a file's header with an unused
 * import, a Claude model billed twice by going through the worker's key. Each
 * one is cheap to block before it runs and expensive to unwind after.
 *
 * It was two bash scripts until the matching moved off `grep` and `case`.
 * Those were tested against the whole command line, so `git commit --amend`
 * matched the rule written against `--am` and a plain reword was refused with
 * a message about staging another lane's work; the way round it was `git reset
 * --soft` and a fresh commit, which is the same result with no guard at all.
 * The rules below run over the *arguments* of each command in the line, which
 * is what they were always about. The move off bash also took the hook's test
 * with it: `bun test` no longer needs `bash` on PATH, which it does not have
 * in PowerShell.
 */

import { realpathSync } from "node:fs";
import path from "node:path";
import { commandsIn } from "./shell-words.ts";

/** Why the command was refused, and what to do instead. */
export type Refusal = { readonly blocked: string; readonly instead: string };

const STAGE_BY_PATH = "Stage the specific files this task touched, by path.";

const REFUSALS = {
  stageEverything: {
    blocked:
      "staging everything (git add -A/./--all) can pick up another lane's unfinished work in this tree.",
    instead: STAGE_BY_PATH,
  },
  commitAll: {
    blocked: "committing with -a/--all stages whatever is dirty, including another lane's work.",
    instead: `${STAGE_BY_PATH} A reword (--amend, on its own) is not this and is allowed.`,
  },
  pushMain: {
    blocked:
      "pushing to main directly bypasses the rebase-then-check order that keeps main's history linear.",
    instead: "Land it with 'bun run land', which rebases, checks, and fast-forwards in that order.",
  },
  hotServer: {
    blocked:
      "hot dev servers (bun run dev, dev:game, bun --hot) belong to the human's own session.",
    instead:
      "Verify with 'bun run preview' / 'preview:once', or launch the director by absolute path inside this worktree.",
  },
  worktreeSelf: {
    blocked: "this would remove the worktree the current session is standing in.",
    instead: "Remove it from another session or after switching out, never from inside itself.",
  },
  unsafeFormat: {
    blocked: "biome's --unsafe fixes delete an unused import together with the comment above it.",
    instead:
      "Run 'bun run format', the safe half. If a rule offers only an unsafe fix, apply it by hand to the one file and check its header survived.",
  },
  workerModel: {
    blocked: "this would run the worker on an Anthropic model through OpenRouter.",
    instead: [
      "Those are billed on a separate account that the Claude app is configured",
      "against; through the worker's key they are paid for twice. The worker slot",
      "is for open weights only.",
      "",
      "If the configured worker has missed twice, the escalation is the commented",
      "model line in .aider.conf.yml, or taking the task back into the session and",
      "saying so. It is never a Claude model on the OpenRouter key.",
    ].join("\n"),
  },
} as const satisfies Record<string, Refusal>;

/** `-am` and `-ma` are `-a`; `--amend` is not, and neither is a `-m` on its own. */
function isShortFlagWith(arg: string, letter: string): boolean {
  return /^-[A-Za-z]+$/.test(arg) && arg.slice(1).includes(letter);
}

/** Leading environment assignments and `sudo` are not the command. */
function withoutPrefixes(args: readonly string[]): readonly string[] {
  let i = 0;
  while (i < args.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(args[i] ?? "") || args[i] === "sudo"))
    i++;
  return args.slice(i);
}

function isProgram(arg: string | undefined, name: string): boolean {
  if (!arg) return false;
  const base = arg.split(/[/\\]/).pop() ?? arg;
  return base === name || base === `${name}.exe`;
}

/** The git subcommand and its arguments, stepping over git's own `-C dir` / `-c key=value`. */
function gitCommand(args: readonly string[]): { name: string; rest: readonly string[] } | null {
  if (args.length === 0 || !isProgram(args[0], "git")) return null;
  let i = 1;
  while (i < args.length) {
    const arg = args[i] ?? "";
    if (arg === "-C" || arg === "-c") {
      i += 2;
      continue;
    }
    if (arg.startsWith("-")) {
      i++;
      continue;
    }
    return { name: arg, rest: args.slice(i + 1) };
  }
  return null;
}

/** Whether `target`, read from `cwd`, is `cwd` itself. A path that does not exist is not. */
function isSameDirectory(target: string, cwd: string): boolean {
  const settle = (p: string) => {
    const real = realpathSync(p);
    return process.platform === "win32" ? real.toLowerCase().replaceAll("\\", "/") : real;
  };
  try {
    return settle(path.resolve(cwd, target)) === settle(cwd);
  } catch {
    return false;
  }
}

function gitRefusal(git: { name: string; rest: readonly string[] }, cwd: string): Refusal | null {
  const { name, rest } = git;
  if (
    name === "add" &&
    rest.some((a) => a === "-A" || a === "--all" || a === "." || isShortFlagWith(a, "A"))
  ) {
    return REFUSALS.stageEverything;
  }
  if (
    name === "commit" &&
    rest.some((a) => a === "--all" || a === "--am" || isShortFlagWith(a, "a"))
  ) {
    return REFUSALS.commitAll;
  }
  if (name === "push") {
    const named = rest.some((a) => !a.startsWith("-") && a.split(/[/:+]/).includes("main"));
    if (named) return REFUSALS.pushMain;
  }
  if (name === "worktree" && rest[0] === "remove") {
    const target = rest.slice(1).find((a) => !a.startsWith("-"));
    if (target && isSameDirectory(target, cwd)) return REFUSALS.worktreeSelf;
  }
  return null;
}

function commandRefusal(raw: readonly string[], cwd: string): Refusal | null {
  const args = withoutPrefixes(raw);
  if (args.length === 0) return null;

  const git = gitCommand(args);
  if (git) return gitRefusal(git, cwd);

  if (isProgram(args[0], "bun")) {
    if (args.includes("--hot")) return REFUSALS.hotServer;
    if (args[1] === "run" && (args[2] === "dev" || args[2] === "dev:game"))
      return REFUSALS.hotServer;
  }
  if (args.includes("--unsafe") && args.some((a) => isProgram(a, "biome")))
    return REFUSALS.unsafeFormat;
  return null;
}

/**
 * The worker rule reads the whole line rather than its arguments: it is about
 * what the command *mentions*, and a model name reaches aider through a config
 * file, a flag or an environment variable indifferently.
 */
function workerModelRefusal(line: string): Refusal | null {
  const text = line.toLowerCase();
  if (!/aider|delegate/.test(text)) return null;
  if (!/anthropic|claude-sonnet|claude-opus|claude-haiku/.test(text)) return null;
  return REFUSALS.workerModel;
}

/** The refusal this command line earns, or null to let it run. */
export function refusalFor(line: string, cwd: string = process.cwd()): Refusal | null {
  const worker = workerModelRefusal(line);
  if (worker) return worker;
  for (const args of commandsIn(line)) {
    const refusal = commandRefusal(args, cwd);
    if (refusal) return refusal;
  }
  return null;
}

async function main(): Promise<void> {
  let command = "";
  try {
    const payload = JSON.parse(await Bun.stdin.text());
    command = payload?.tool_input?.command ?? "";
  } catch {
    process.exit(0);
  }
  const refusal = command ? refusalFor(command) : null;
  if (!refusal) process.exit(0);
  process.stderr.write(`Blocked: ${refusal.blocked}\n${refusal.instead}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
