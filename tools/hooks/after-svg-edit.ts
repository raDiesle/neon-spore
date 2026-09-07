#!/usr/bin/env bun

/**
 * A drawn picture is the one thing a session cannot check by reading it back.
 *
 * Determinism has `after-sim-edit.ts` because nobody can eyeball it. This is
 * the mirror of that problem: a session writing SVG cannot see what it wrote,
 * so it stays inside the shapes it can predict from coordinates alone and the
 * result comes out thin every time. The owner named it on 7 September 2026,
 * against an SVG from another model that was simply more detailed.
 *
 * The fix is a loop — numbers, then a rasterised still, then a correction — and
 * a loop only happens if something says so at the moment the file is edited.
 * `.claude/skills/svg-look` holds the procedure; this makes sure a session that
 * never opened the skill still meets it.
 *
 * It reminds and does not block. The judgement it cannot make is whether the
 * file is a picture or an explanatory diagram, and a hook that stopped the turn
 * over a diagram would cost more than the thinness it was written to prevent.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { editedPath, readPayload, sessionId } from "./payload.ts";

/**
 * Files that carry SVG without being a picture.
 *
 * The shim, the rasteriser, the packer and every test stand up SVG in order to
 * check something else. Reminding a session to look at `svg-dom.ts` is noise in
 * a context window, which is the cost this hook is trying not to spend.
 */
const PLUMBING = [
  "/test/",
  ".test.ts",
  "tools/director/src/svg-dom.ts",
  "tools/frames/",
  "tools/raster/",
  "tools/hooks/",
] as const;

/** Whether the edited file draws something a person will look at. */
export function drawsAPicture(path: string | null, content: string): boolean {
  if (path === null) return false;
  if (PLUMBING.some((part) => path.includes(part))) return false;
  if (path.endsWith(".svg")) return true;
  return content.includes("2000/svg") || content.includes("createElementNS");
}

/**
 * The reminder, in the fewest tokens that still say what to do.
 *
 * Every line here is one a session would otherwise have to be told twice: the
 * cheap check comes before the image, the image has to be *read* and not merely
 * produced, and a diagram is allowed to stay plain.
 */
export function reminder(path: string): string {
  return [
    `${path} draws a picture, and a picture is built by looking at it.`,
    "",
    "  1. bun run shapes:report          geometry as numbers, no image",
    "  2. bun run png <in.svg> <out.png> then READ the png",
    "  3. correct what the frame shows, and look again — two or three rounds",
    "",
    "Match the density of any reference SVG in the conversation; build interiors",
    "from tools/director/src/skins and bun run shapes:parts, not from scratch.",
    "The procedure is .claude/skills/svg-look. An explanatory diagram or a piece",
    "of plumbing is exempt — say which and carry on.",
  ].join("\n");
}

/**
 * Whether this file has already been mentioned in this session.
 *
 * A file gets edited several times while it is being drawn, and the same eight
 * lines repeated on each of them is the noise that makes a hook worth turning
 * off. Keyed by session so the next one is reminded again.
 */
function firstTimeThisSession(session: string, path: string): boolean {
  const dir = join(tmpdir(), "neon-spore-svg-look", session);
  const marker = join(dir, createHash("sha256").update(path).digest("hex").slice(0, 16));
  if (existsSync(marker)) return false;
  mkdirSync(dir, { recursive: true });
  writeFileSync(marker, path);
  return true;
}

async function main(): Promise<void> {
  const payload = await readPayload();
  const path = editedPath(payload);
  if (path === null) process.exit(0);

  const content = await Bun.file(path)
    .text()
    .catch(() => "");
  if (!drawsAPicture(path, content)) process.exit(0);
  if (!firstTimeThisSession(sessionId(payload), path)) process.exit(0);

  // Exit code 2 is the one that feeds the message back to Claude rather than
  // to a log nobody reads.
  process.stderr.write(`${reminder(path)}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
