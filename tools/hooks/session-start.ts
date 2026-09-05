#!/usr/bin/env bun

/**
 * Pin bun to a version new enough for this repo, in Claude Code on the web.
 *
 * The web image ships whatever bun it was built with, and on 5 September 2026
 * that was 1.3.11 — a version that cannot read this repo's `bun.lock`
 * (`lockfileVersion: 2`) and hangs `apps/server`'s workerd tests on a `ws`
 * gap it had not yet closed. The symptom is the worst kind: `bun install
 * --frozen-lockfile`, `bun run check` and therefore `bun run land` all fail for
 * a reason that is the toolchain and not the tree, so a cloud session cannot
 * land work that is green everywhere else. A whole afternoon went into finding
 * that out once; this is so no session finds it out twice.
 *
 * It fetches a current bun from the npm registry — the one host the web proxy
 * allows for packages, and where bun ships its binary as `@oven/bun-linux-x64`
 * with no download from `bun.sh` to be blocked — and puts it first on PATH for
 * the rest of the session through `$CLAUDE_ENV_FILE`. The image's bun is left
 * in place; nothing is overwritten.
 *
 * A no-op outside the web env (`$CLAUDE_CODE_REMOTE`), on anything but
 * linux-x64 (the only image this repo runs on there), and once bun is already
 * new enough — so a resume or a newer image costs one version comparison and
 * stops. `test/session-start.test.ts` holds the comparison.
 */

import { spawn } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";

/** The lowest bun this repo's lockfile and workerd tests are known to want. */
export const WANTED = "1.4.2";

/**
 * Whether `current` is older than `wanted`, by numeric version parts. A
 * pre-release suffix (`1.4.2-canary`) is treated as its release — the hook only
 * needs "is the image's bun too old", and a canary of the wanted version is
 * not.
 */
export function needsUpgrade(current: string, wanted: string): boolean {
  const parts = (v: string): number[] =>
    v
      .split("-")[0]!
      .split(".")
      .map((n) => Number.parseInt(n, 10) || 0);
  const c = parts(current);
  const w = parts(wanted);
  for (let i = 0; i < Math.max(c.length, w.length); i++) {
    const a = c[i] ?? 0;
    const b = w[i] ?? 0;
    if (a !== b) return a < b;
  }
  return false;
}

/** The version a bun binary reports, or `null` if it will not run here. */
function versionOf(binary: string): string | null {
  try {
    const out = Bun.spawnSync([binary, "--version"]);
    if (!out.success) return null;
    return out.stdout.toString().trim();
  } catch {
    return null;
  }
}

/** Fetch the pinned bun binary into `dir` and return its path, or `null`. */
async function fetchBun(dir: string): Promise<string | null> {
  const pkg = `${dir}/pkg`;
  mkdirSync(pkg, { recursive: true });
  Bun.write(
    `${pkg}/package.json`,
    `${JSON.stringify({ name: "neon-spore-bun-pin", private: true })}\n`,
  );
  const added = spawn("bun", ["add", `@oven/bun-linux-x64@^${WANTED}`], {
    cwd: pkg,
    stdio: "ignore",
  });
  const code = await new Promise<number>((resolve) => added.on("close", (c) => resolve(c ?? 1)));
  if (code !== 0) return null;
  const src = `${pkg}/node_modules/@oven/bun-linux-x64/bin/bun`;
  if (!existsSync(src)) return null;
  const dest = `${dir}/bun`;
  copyFileSync(src, dest);
  chmodSync(dest, 0o755);
  return dest;
}

/** Put `dir` first on PATH for the session, once. */
function exportPath(envFile: string, dir: string): void {
  const line = `export PATH="${dir}:$PATH"`;
  const existing = existsSync(envFile) ? readFileSync(envFile, "utf8") : "";
  if (existing.includes(line)) return;
  appendFileSync(envFile, `${line}\n`);
}

async function main(): Promise<void> {
  // The web image is the only place with a bun this repo did not choose; a
  // local checkout brought its own.
  if (process.env.CLAUDE_CODE_REMOTE !== "true") return;
  // `@oven/bun-linux-x64` is the glibc build the web image runs; anything else
  // keeps the bun it already has rather than a binary that will not start.
  if (process.platform !== "linux" || process.arch !== "x64") return;
  const envFile = process.env.CLAUDE_ENV_FILE;
  if (!envFile) return;
  if (!needsUpgrade(Bun.version, WANTED)) return;

  const dir = `${process.env.HOME ?? "/root"}/.cache/neon-spore-bun`;
  mkdirSync(dir, { recursive: true });

  // Cached across sessions on a reused container, so fetch only when the pinned
  // binary is not already present and new enough.
  let binary = `${dir}/bun`;
  const have = versionOf(binary);
  if (have === null || needsUpgrade(have, WANTED)) {
    binary = (await fetchBun(dir)) ?? "";
  }
  if (binary && !needsUpgrade(versionOf(binary) ?? "0", WANTED)) {
    exportPath(envFile, dir);
    process.stderr.write(
      `session-start: bun ${Bun.version} is below ${WANTED}; pinned ${dir}/bun ahead of it\n`,
    );
  } else {
    process.stderr.write(
      `session-start: could not pin bun ${WANTED}; leaving the image's ${Bun.version}\n`,
    );
  }
}

await main();
