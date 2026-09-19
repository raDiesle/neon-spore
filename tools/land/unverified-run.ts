#!/usr/bin/env bun

/**
 * `bun run unverified <sha> --unverified "<what>" [--unverified "<what>" ...]`
 * — the second door `unverified.ts` describes but `note-commit.ts` only ever
 * opened once, at the moment a landing's own trunk move committed the entry.
 *
 * A lane that lands and only then realises it never watched a wave at tempo
 * cannot run `bun run land --unverified` again: from `main` it refuses
 * because a trunk is landed on rather than landing, and from the spent
 * branch it refuses because the branch carries nothing `main` has not got.
 * This session hit both refusals in one turn and wrote the entry by hand in
 * `renderUnverified`'s shape instead — a paragraph of formatting duplicated
 * in a document, which is exactly the drift `filesLine`'s path-only rule was
 * hardened against once already. `<sha>` is the already-landed commit (what
 * `bun run land` printed on its own `main is at …` line — **not** the sha on
 * the closing banner, which is the release-notes commit landing writes on
 * top and never the work itself; this refuses that one and steps to its
 * parent rather than queuing an entry about `docs/release-notes.md`). For a
 * landing of several commits, pass the range it moved through instead,
 * `<oldest>..<newest>`. Everything past that argument is `parseUnverified`'s
 * own.
 */

import { join } from "node:path";
import { git } from "./git.js";
import { LOG_FORMAT, parseLanded } from "./notes.js";
import { appendEntry, parseUnverified, renderUnverified } from "./unverified.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const [ref, ...rest] = process.argv.slice(2);

if (!ref || ref.startsWith("--")) {
  console.log(
    '✗ give the already-landed sha first: bun run unverified <sha> --unverified "<what>"',
  );
  process.exit(1);
}

const unverified = parseUnverified(rest);
if (unverified.length === 0) {
  console.log("✗ --unverified needs what went unchecked, in quotes — nothing to queue");
  process.exit(1);
}

const isRange = ref.includes("..");
let newest = isRange ? (ref.split("..", 2)[1] ?? "") : ref;

if ((await git(["rev-parse", "--verify", `${newest}^{commit}`], root)) === "") {
  console.log(`✗ ${newest} is not a commit this repository has`);
  process.exit(1);
}

// The banner's own sha, handed back in rather than a work commit's — step
// past the bookkeeping `writeNotes` made of it, to what actually landed.
if (!isRange && /^Release notes for /.test(await git(["log", "-1", "--format=%s", newest], root))) {
  console.log(`  skipped  ${newest} is the release-notes commit — using its parent`);
  newest = `${newest}^`;
}
const oldest = isRange ? (ref.split("..", 2)[0] ?? "") : `${newest}^`;

const log = await git(
  ["log", "--reverse", "--date=short", `--format=${LOG_FORMAT}`, `${oldest}..${newest}`],
  root,
);
const landed = parseLanded(log);
if (landed.length === 0) {
  console.log(
    `✗ ${oldest}..${newest} landed nothing — is that really the range this landing moved through?`,
  );
  process.exit(1);
}

const diff = await git(["diff", "--name-only", "--diff-filter=d", oldest, newest], root);
const files = diff
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const branch = await git(["branch", "--show-current"], root);
const last = landed.at(-1);
if (!last) {
  console.log("✗ nothing landed in that range");
  process.exit(1);
}

const entry = renderUnverified({
  branch: branch || "HEAD",
  date: last.date,
  sha: last.sha,
  items: unverified,
  files,
  subjects: landed.map((commit) => commit.subject),
});

const path = join(root, "docs/queue.md");
const file = Bun.file(path);
const existing = (await file.exists()) ? await file.text() : "";
await Bun.write(path, appendEntry(existing, entry));
const what = unverified.length === 1 ? "one thing" : `${unverified.length} things`;
console.log(
  `  queued   docs/queue.md — ${what} ${landed.length === 1 ? "this landing" : "those landings"} could not check`,
);
console.log("  commit and land docs/queue.md the ordinary way — this only wrote the entry");
