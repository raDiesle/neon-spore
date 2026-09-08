#!/usr/bin/env bun

import { cuesOf, placedAt, reveal } from "./depth-cues.js";
import { MOTIONS } from "./motions/index.js";

/**
 * `bun run --cwd tools/shape-sheet cues` — the motion half of `report.ts`.
 *
 * Deterministic and line-oriented, so two revisions diff instead of being
 * compared by eye, and so the question a session cannot answer by looking —
 * *is this a turn or a squash?* — is answerable for a couple of hundred tokens
 * instead of the fifteen hundred an image costs. `depth-cues.ts` says what each
 * column means and `docs/style-guide.md` says why these three and no others.
 *
 * **The last row is the point of the table.** It is not a motion: it is the
 * same eight marks placed on a surface rather than posed by an affine, and its
 * REVEAL is the number no row above it can ever reach.
 */

/** One window for every motion, so the counts are comparable down the column.
 * Sixteen beats is a little under one revolution of the slowest thing here. */
const WINDOW = 16;

const cols = ["MOTION", "ASPECT", "×", "WIDTH", "SWAY", "ASYM", "REVEAL"] as const;
const widths = [16, 15, 7, 7, 6, 7, 8];

function row(cells: string[]): string {
  return cells
    .map((c, i) => c.padEnd(widths[i] as number))
    .join("")
    .trimEnd();
}

function main(): void {
  const lines = [row([...cols]), row(widths.map((w) => "-".repeat(w - 2)))];
  for (const m of MOTIONS) {
    const c = cuesOf(m, WINDOW);
    lines.push(
      row([
        c.name,
        `${c.aspectLo.toFixed(3)}-${c.aspectHi.toFixed(3)}`,
        (c.aspectHi / c.aspectLo).toFixed(2),
        String(c.widthTurns),
        String(c.swayTurns),
        c.asymmetry.toFixed(3),
        c.reveal.toFixed(2),
      ]),
    );
  }
  lines.push("");
  lines.push(
    row([
      "· placed",
      "·",
      "·",
      "·",
      "·",
      "·",
      reveal(
        placedAt((t) => t * 0.34375),
        WINDOW,
      ).toFixed(2),
    ]),
  );
  lines.push("");
  lines.push(`${WINDOW} beats per row. ASPECT is drawn sx/sy and × the factor across it.`);
  lines.push("WIDTH and SWAY are periods in that window: two against one is a body");
  lines.push("turning about an axis it does not stand on, and one against none is a");
  lines.push("squash. ASYM is how far the width cycle is from mirroring itself — a");
  lines.push("lean is symmetric by construction and reads as nothing. REVEAL is how");
  lines.push("much of the body goes behind and comes back, and it is the whole table:");
  lines.push("it is 0 for every pose there can ever be, because a card is one contour");
  lines.push("and no affine has hidden a part of the thing it transformed.");
  console.log(lines.join("\n"));
}

main();
