#!/usr/bin/env bun

/**
 * Wrapper for aider that handles console encoding on Windows, file mentions
 * that would trigger yes-always prompts, and runs that report success but
 * change nothing.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { normalize } from "node:path";
import { ignoredBy } from "./ignored.js";
import { mentionedPaths } from "./mentions.js";
import { ceilingMs } from "./timeout.js";

async function filterReadOnlyCandidates(
  candidates: string[],
  specFile: string,
  targetFiles: string[],
  ignorePatterns: string | null,
): Promise<string[]> {
  const existing = candidates.filter((path) => existsSync(path));

  const normalizedSpec = normalize(specFile);
  const normalizedTargets = new Set(targetFiles.map((f) => normalize(f)));

  // The spec is already the message; passing it again wastes context.
  const notSpec = existing.filter((path) => normalize(path) !== normalizedSpec);

  const notTarget = notSpec.filter((path) => !normalizedTargets.has(normalize(path)));

  const notGitIgnored = await filterGitIgnored(notTarget);

  if (ignorePatterns === null) return notGitIgnored;

  const notAiderIgnored = notGitIgnored.filter((path) => !ignoredBy(ignorePatterns, path));
  return notAiderIgnored;
}

async function filterGitIgnored(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];

  const proc = spawn("git", ["check-ignore", "--stdin"], {
    stdio: ["pipe", "pipe", "ignore"],
  });

  let stdout = "";

  proc.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  const exitCode = await new Promise<number>((resolve) => {
    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", () => resolve(-1));
    proc.stdin.write(paths.join("\n"));
    proc.stdin.end();
  });

  // If git is not available, keep all paths rather than dropping them.
  if (exitCode === -1) return paths;

  const ignored = new Set(
    stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  );

  return paths.filter((path) => !ignored.has(path));
}

async function main() {
  const args = process.argv.slice(2);
  const separatorIndex = args.indexOf("--");
  const mainArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
  const extraArgs = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

  if (mainArgs.length < 2) {
    console.error("Usage: bun run delegate <spec-file> <file-to-edit>... [-- <extra aider args>]");
    process.exit(1);
  }

  const specFile = mainArgs[0]!;
  const targetFiles = mainArgs.slice(1);

  if (!existsSync(specFile)) {
    console.error(`Spec file not found: ${specFile}`);
    process.exit(1);
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
    process.exit(1);
  }

  const ignorePatterns = existsSync(".aiderignore") ? await Bun.file(".aiderignore").text() : null;

  if (ignorePatterns !== null) {
    const ignoredTargets = targetFiles.filter((file) => ignoredBy(ignorePatterns, file));
    if (ignoredTargets.length > 0) {
      console.error("Cannot edit files kept out of reach by .aiderignore:");
      for (const file of ignoredTargets) {
        console.error(`  ${file}`);
      }
      console.error("This task must be done in the session, not delegated.");
      process.exit(1);
    }
  }

  const specText = await Bun.file(specFile).text();
  const targetTexts: string[] = [];

  for (const file of targetFiles) {
    if (existsSync(file)) {
      targetTexts.push(await Bun.file(file).text());
    }
  }

  const allTexts = [specText, ...targetTexts];
  const candidates = mentionedPaths(allTexts, targetFiles);
  const readOnlyFiles = await filterReadOnlyCandidates(
    candidates,
    specFile,
    targetFiles,
    ignorePatterns,
  );

  console.log(`Spec: ${specFile}`);
  console.log(`May edit: ${targetFiles.join(", ")}`);
  if (readOnlyFiles.length > 0) {
    console.log(`Read-only: ${readOnlyFiles.join(", ")}`);
  }
  console.log();

  const beforeContents = new Map<string, string | null>();
  for (const file of targetFiles) {
    beforeContents.set(file, existsSync(file) ? await Bun.file(file).text() : null);
  }

  const aiderArgs = [
    "--message-file",
    specFile,
    ...readOnlyFiles.flatMap((f) => ["--read", f]),
    ...targetFiles,
    ...extraArgs,
  ];

  const env = {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
  };

  const exitCode = await new Promise<number>((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;

    const killChild = (child: ReturnType<typeof spawn>): Promise<void> => {
      if (process.platform === "win32") {
        return new Promise<void>((resolve) => {
          const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
            stdio: "ignore",
            shell: false,
          });
          killer.on("close", () => resolve());
          killer.on("error", () => resolve());
        });
      }
      child.kill();
      return Promise.resolve();
    };

    const trySpawn = (cmd: string) => {
      const child = spawn(cmd, aiderArgs, {
        stdio: "inherit",
        env,
        shell: false,
      });

      const ms = ceilingMs(process.env);
      timer = setTimeout(() => {
        timedOut = true;
        const min = ms / 60_000;
        console.error(
          `ceiling of ${min} min reached — run aborted; raise DELEGATE_TIMEOUT_MIN if the run was healthy`,
        );
        killChild(child).then(() => resolve(124));
      }, ms);

      child.on("close", (code: number | null) => {
        if (timer) clearTimeout(timer);
        resolve(timedOut ? 124 : (code ?? 1));
      });
      child.on("error", () => {
        if (timer) clearTimeout(timer);
        if (process.platform === "win32" && cmd === "aider") {
          trySpawn("aider.cmd");
        } else {
          console.error("aider is not on PATH");
          process.exit(1);
        }
      });
    };

    trySpawn("aider");
  });

  // A timeout abort has already printed its message; do not fall through to
  // the no-op check, which would misdiagnose a cutoff as an uncovered mention.
  if (exitCode === 124) process.exit(124);

  const changedFiles: string[] = [];
  for (const file of targetFiles) {
    const before = beforeContents.get(file);
    const after = existsSync(file) ? await Bun.file(file).text() : null;

    if (before !== after) {
      changedFiles.push(file);
    }
  }

  if (changedFiles.length === 0) {
    console.error("");
    console.error("=".repeat(70));
    console.error("ERROR: The run changed nothing.");
    console.error("The report is not evidence that the work was done.");
    console.error("The usual cause is a file mention that was not covered.");
    if (readOnlyFiles.length > 0) {
      console.error(`Read-only files passed: ${readOnlyFiles.join(", ")}`);
    } else {
      console.error("No read-only files were passed.");
    }
    console.error("=".repeat(70));
    process.exit(1);
  }

  console.log(`\nChanged: ${changedFiles.join(", ")}`);
  process.exit(exitCode);
}

await main();
