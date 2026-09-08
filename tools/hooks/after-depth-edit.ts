#!/usr/bin/env bun

/**
 * A depth claim is the one drawing mistake that looks like a success.
 *
 * `after-svg-edit.ts` exists because a session cannot see what it drew. This is
 * narrower and sharper: a session *can* see that a body is changing width, and
 * a body changing width is exactly what a coin flipping looks like. So the
 * cheapest thing to reach for when asked to make something read solid is an
 * `sx` cosine, and it will be wrong every time — `docs/dimensional.md` measured
 * an affine at 1.10 : 1 against a real turn's 22.9 : 1, and no tuning closes
 * that, because an affine scales the picture about one centre by definition.
 *
 * Two things are worth saying at the moment the file is edited, and neither
 * survives being left to a document a session may not open. The first is that
 * the projection already exists and must be called rather than written out
 * again — four copies of it accumulated before it had a home. The second is
 * that the rule has a shape: **the silhouette is posed and the surface is
 * placed**, and a file doing one of those while meaning the other is the whole
 * defect.
 *
 * It reminds and does not block, for `after-svg-edit.ts`'s reason: the
 * judgement it cannot make is whether this file is claiming depth or merely
 * mentioning it, and a hook that stopped a turn over the word "solid" would
 * cost more than the flatness it was written to prevent.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { editedPath, readPayload, sessionId } from "./payload.ts";

/** Where a depth claim can be made at all: something a person looks at. */
const DRAWS = ["packages/render/src/", "tools/director/src/", "tools/versus/candidates/"] as const;

/** Files that carry the words without making the claim. */
const EXEMPT = ["/test/", ".test.ts", "packages/content/src/surface.ts", "tools/hooks/"] as const;

/**
 * The projection, written out by hand. `cos(lat)` multiplied by a sine is the
 * shape of it whatever the variables are called, and it is the one spelling
 * that cannot be anything else.
 */
const RE_DERIVED = /Math\.cos\(\s*lat\w*\s*\)\s*\*\s*Math\.sin\(|Math\.sin\(\s*lon\w*/;

/** A file saying, in prose or in a name, that it is making something round. */
const CLAIM =
  /three-dimensional|foreshorten|\bterminator\b|reads? as (a )?(solid|round)|in depth\b|turning about/i;

export function scope(path: string | null): boolean {
  if (path === null || !path.endsWith(".ts")) return false;
  const p = path.replaceAll("\\", "/");
  if (EXEMPT.some((part) => p.includes(part))) return false;
  return DRAWS.some((dir) => p.includes(dir));
}

/** What this file has done that is worth a sentence, or nothing. */
export function finding(path: string | null, content: string): "copy" | "claim" | null {
  if (!scope(path)) return null;
  if (RE_DERIVED.test(content)) return "copy";
  if (CLAIM.test(content)) return "claim";
  return null;
}

export function reminder(path: string, what: "copy" | "claim"): string {
  const head =
    what === "copy"
      ? `${path} looks like it works out where a surface feature lands. That line lives in packages/content/src/surface.ts — call it.`
      : `${path} claims depth, and a depth claim is the drawing mistake that looks like a success.`;
  return [
    head,
    "",
    "  A silhouette is POSED; a surface is PLACED. An affine moves every mark at",
    "  one rate (1.10 : 1) and can never bring anything out from behind (22.9 : 1).",
    "",
    "  pin(lon, lat, reach) once, facet(pin, theta) per frame, scale(sx, sy) to",
    "  foreshorten, surfaceLit for the shading — the light does not turn.",
    "  bun run shapes:cues  checks the two periods, the asymmetry and the reveal.",
    "",
    "The rule and what is dangerous at 26 px: .claude/skills/depth.",
  ].join("\n");
}

function firstTimeThisSession(session: string, path: string): boolean {
  const dir = join(tmpdir(), "neon-spore-depth", session);
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
  const what = finding(path, content);
  if (what === null) process.exit(0);
  if (!firstTimeThisSession(sessionId(payload), path)) process.exit(0);

  // Exit code 2 is the one that feeds the message back to Claude rather than
  // to a log nobody reads.
  process.stderr.write(`${reminder(path, what)}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
