/**
 * BUILD's own state: the base, the attachments, and the recipe text they add
 * up to.
 *
 * Split out of `shapes-build.ts` when that file went past the length limit,
 * along the seam `shapes-pair.ts` already draws between the rest of SHAPES
 * and its controls: this is *what is being built*, and `shapes-build.ts` is
 * *the page that builds it*. Nothing here touches the DOM.
 */

import type { OwnMotion } from "@neon-spore/content";
import { type Attachment, MOTIONS } from "@neon-spore/shape-sheet";

export const JET = MOTIONS.find((m) => m.name === "JET") as OwnMotion;

export interface Base {
  lobes: number;
  rx: number;
  ry: number;
  bell: boolean;
  swims: boolean;
}

export const SIZES: Record<string, { rx: number; ry: number }> = {
  ROUND: { rx: 34, ry: 34 },
  TALL: { rx: 26, ry: 40 },
  WIDE: { rx: 42, ry: 28 },
};

export const base: Base = { lobes: 3, rx: 34, ry: 34, bell: false, swims: false };
export let sizeName = "ROUND";
export let attachments: Attachment[] = [];

export function setSizeName(name: string): void {
  sizeName = name;
}

/**
 * Where the next click puts a part, if nothing says otherwise.
 *
 * The golden angle rather than an even split of however many parts there are
 * — an even split reflows every existing attachment's angle each time one is
 * added, which would undo a placement the moment a second part joined it.
 * This instead gives each new one a place of its own that happens to avoid
 * the ones already there, without moving them.
 */
function nextAngle(): number {
  return (attachments.length * 2.4) % (Math.PI * 2);
}

export function addPart(id: string): void {
  attachments = [...attachments, { part: id, at: nextAngle(), size: 1 }];
}

export function removeAt(i: number): void {
  attachments = attachments.filter((_, k) => k !== i);
}

export function nudge(i: number, field: "at" | "size", delta: number, min?: number): void {
  attachments = attachments.map((a, k) => {
    if (k !== i) return a;
    if (field === "at") return { ...a, at: a.at + delta };
    const size = Math.max(min ?? 0.2, (a.size ?? 1) + delta);
    return { ...a, size };
  });
}

export function flipAt(i: number): void {
  attachments = attachments.map((a, k) => (k === i ? { ...a, flip: !a.flip } : a));
}

export function resetAttachments(): void {
  attachments = [];
}

/** The recipe as a paste-ready object literal, in `Recipe`'s own shape. */
export function recipeText(): string {
  const lines: string[] = [];
  if (base.swims) lines.push('// import { JET } from "./motions/index.js";');
  lines.push("{");
  lines.push('  name: "MY BODY",');
  lines.push('  note: "say the recipe in one line",');
  lines.push('  owner: "nothing yet",');
  lines.push(`  rx: ${base.rx},`);
  lines.push(`  ry: ${base.ry},`);
  lines.push(`  lobes: ${base.lobes},`);
  if (base.bell) lines.push("  bell: 0.34,");
  if (base.swims) lines.push("  pulse: {},");
  if (base.swims) lines.push("  motion: JET,");
  lines.push("  parts: [");
  for (const a of attachments) {
    const fields = [`part: "${a.part}"`, `at: ${a.at.toFixed(2)}`];
    if (a.size !== undefined && a.size !== 1) fields.push(`size: ${a.size.toFixed(2)}`);
    if (a.flip) fields.push("flip: true");
    lines.push(`    { ${fields.join(", ")} },`);
  }
  lines.push("  ],");
  lines.push("}");
  return lines.join("\n");
}
