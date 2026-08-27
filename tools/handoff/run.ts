#!/usr/bin/env bun

/**
 * `bun run handoff` — the block a session ends on.
 *
 * The question it answers is the only one worth asking from a phone: is there
 * anything left for me to do, or can I close this and go back to main? Every
 * fact in it comes from git, the `Check:` trailers or `docs/parked.md`, so the
 * one thing it cannot do is claim a landing that did not happen.
 *
 *   bun run handoff
 *   bun run handoff --ask "should the barb sway with the bulb or against it"
 *   bun run handoff --check      run `bun run check` and say so in the block
 *   bun run handoff --no-fetch   trust the refs that are here already
 */

import { join } from "node:path";
import { outstanding } from "../checks/checks.js";
import { readChecks } from "../checks/repo.js";
import { type Handoff, render } from "./handoff.js";
import { parseParked } from "./parked.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);

const asks: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const next = argv[i + 1];
  if (argv[i] === "--ask" && next) {
    asks.push(next);
    i++;
  }
}
const wantsCheck = argv.includes("--check");
const noFetch = argv.includes("--no-fetch");

async function git(args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "ignore" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

async function ok(args: string[]): Promise<boolean> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "ignore", stderr: "ignore" });
  return (await proc.exited) === 0;
}

async function run(command: string[]): Promise<boolean> {
  const proc = Bun.spawn(command, { cwd: root, stdout: "ignore", stderr: "ignore" });
  return (await proc.exited) === 0;
}

const offline = noFetch ? false : !(await ok(["fetch", "--quiet", "origin", "main"]));
const trunk = (await ok(["rev-parse", "--verify", "--quiet", "origin/main"]))
  ? "origin/main"
  : "main";

const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"])) || "HEAD";
const head = await git(["rev-parse", "HEAD"]);
const remoteTip = await git(["rev-parse", `origin/${branch}`]);

const parkedFile = Bun.file(join(root, "docs/parked.md"));
const parked = (await parkedFile.exists()) ? parseParked(await parkedFile.text()) : [];

const state: Handoff = {
  branch,
  landed: await ok(["merge-base", "--is-ancestor", head, trunk]),
  ahead: Number((await git(["rev-list", "--count", `${trunk}..HEAD`])) || "0"),
  pushed: remoteTip !== "" && remoteTip === head,
  dirty: (await git(["status", "--porcelain"]))
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().replace(/^\S+\s+/, "")),
  green: wantsCheck ? await run(["bun", "run", "check"]) : null,
  asks,
  waiting: outstanding(await readChecks(root)).length,
  parked: parked.map((p) => p.title),
  offline,
};

console.log(render(state));
