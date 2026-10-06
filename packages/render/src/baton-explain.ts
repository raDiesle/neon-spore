import { batonBoss, type World } from "@neon-spore/sim";
import { beadPoint } from "./baton-bead-draw.js";
import { type BatonPart, batonComing, batonFocus, batonRunning } from "./baton-explain-when.js";
import { socketPoint } from "./baton-socket-draw.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatOf } from "./view-role.js";

/**
 * **THE BATON says each new part on the field** — the owner, 6 October 2026:
 * *better than a guide page is to explain in game, two or three beats before
 * the new part happens, and while it is happening what the players need to
 * do.* His three answers the same day: a **banner** across the field while it
 * is coming, then a **label** beside the part while it runs; the **first time
 * per wave** only; and **each screen its own job**, so the two of them still
 * have to say the other half out loud.
 *
 * When is `baton-explain-when.ts`. This is the words and where they stand:
 * the banner on the clear rows between the bottom of the arm and the hull,
 * the label a tile to the side of the bead or socket it is about, away from
 * the mark on it. Drawn after the boss cue (`boss-cue-field.ts`), so no tube
 * and no mark is laid over a word.
 */

interface Words {
  /** Both screens, while the part is coming. */
  coming: string;
  /** Player 1's job while it runs. */
  p1: string;
  /** Player 2's job while it runs. */
  p2: string;
}

const WORDS: Record<BatonPart, Words> = {
  swing: {
    coming: "NEXT: THE ARM SWINGS",
    p1: "MOVE UNDER IT. IT SWINGS ONE COLUMN.",
    p2: "FIRE WHEN P1 IS UNDER IT.",
  },
  shed: {
    coming: "NEXT: THE ARM DROPS ROCKS",
    p1: "WHEN YOU ARE GREY, TAP IT OFF.",
    p2: "WHEN YOU ARE GREY, TAP IT OFF.",
  },
  twin: {
    coming: "NEXT: A SECOND BEAD",
    p1: "TAP THE BEAD THAT IS MARKED.",
    p2: "SHOOT EACH BEAD IN ITS OWN COLOUR.",
  },
  merge: {
    coming: "NEXT: JOIN THE TWO BEADS",
    p1: "HOLD THE UPPER BEAD WITH P2.",
    p2: "HOLD THE LOWER BEAD WITH P1.",
  },
  crossing: {
    coming: "NEXT: THE LAST LONG DROP",
    p1: "TAP, THEN WAIT FOR P2.",
    p2: "FIRE AFTER EACH P1 TAP.",
  },
  pair: {
    coming: "NEW: A SECOND ARM",
    p1: "MOVE TO THE ARM THAT IS MARKED.",
    p2: "SHOOT THE BEAD ON EITHER ARM.",
  },
  across: {
    coming: "NEW: THE ARM LIES ACROSS",
    p1: "MOVE ONE COLUMN RIGHT EACH TIME.",
    p2: "SHOOT IT BEFORE IT MOVES ON.",
  },
};

const BANNER_FONT = '700 13px "Courier New",monospace';
const LABEL_FONT = '700 10px "Courier New",monospace';
/** A dark rim under the letters, as the cue's reason has (`boss-cue-text.ts`). */
const RIM = 3;
const RIM_INK = "rgba(8,4,16,.92)";
/** Letters to a line of the label, so it fits beside a bead and not across the field. */
const LINE = 15;
const LINE_HEIGHT = 12;

/** The words a part asks of the seats this screen shows, a seat a block. */
export function batonJobs(part: BatonPart, both: boolean, seat: 1 | 2): string[] {
  const w = WORDS[part];
  if (!both) return [seat === 1 ? w.p1 : w.p2];
  return [`P1 ${w.p1}`, `P2 ${w.p2}`];
}

/** What the banner says while a part is coming. */
export function batonBanner(part: BatonPart): string {
  return WORDS[part].coming;
}

/** A label's words broken into lines of at most `LINE` letters, at the spaces. */
export function wrap(text: string): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line === "" ? word : `${line} ${word}`;
    if (next.length > LINE && line !== "") {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line !== "") out.push(line);
  return out;
}

function rimmed(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineWidth = RIM;
  ctx.strokeStyle = RIM_INK;
  ctx.strokeText(text, x, y);
  ctx.restore();
  ctx.fillText(text, x, y);
}

/** The banner, centred on the clear rows over the hull, breathing so it is seen. */
function drawBanner(ctx: CanvasRenderingContext2D, l: Layout, text: string, time: number): void {
  ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time * 5);
  ctx.font = BANNER_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.text;
  rimmed(ctx, text, l.width / 2, l.hullY - 2 * l.tile);
}

/** The label beside `at`, on whichever side of it has the room. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  blocks: string[],
  at: { x: number; y: number },
): void {
  const lines = blocks.flatMap((block, i) => (i > 0 ? ["", ...wrap(block)] : wrap(block)));
  const right = at.x < l.width / 2;
  const x = at.x + (right ? 1 : -1) * 0.9 * l.tile;
  const top = at.y - ((lines.length - 1) * LINE_HEIGHT) / 2;
  ctx.globalAlpha = 0.95;
  ctx.font = LABEL_FONT;
  ctx.textAlign = right ? "left" : "right";
  ctx.fillStyle = PALETTE.text;
  lines.forEach((line, i) => {
    if (line !== "") rimmed(ctx, line, x, top + i * LINE_HEIGHT);
  });
}

/** Where a running part's label is about. */
function anchor(l: Layout, world: World, part: BatonPart): { x: number; y: number } | null {
  const b = batonBoss(world);
  if (b === null) return null;
  const cfg = world.cfg;
  if (part === "shed") return b.swellSocket >= 0 ? socketPoint(l, cfg, b, b.swellSocket) : null;
  if (part === "merge") {
    const upper = socketPoint(l, cfg, b, cfg.batonSockets - 2);
    const lower = socketPoint(l, cfg, b, cfg.batonSockets - 1);
    return { x: upper.x, y: (upper.y + lower.y) / 2 };
  }
  const bead = batonFocus(cfg, b, part);
  return bead === null ? null : beadPoint(l, cfg, b, bead, world.tick);
}

/** The banner for what is coming and the label for what is running, on this screen. */
export function drawBatonExplain(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const b = batonBoss(world);
  if (b === null) return;
  const coming = batonComing(world.cfg, b);
  const running = batonRunning(world.cfg, b);
  if (coming === null && running === null) return;
  ctx.save();
  if (coming !== null) drawBanner(ctx, l, batonBanner(coming), time);
  const at = running === null ? null : anchor(l, world, running);
  if (running !== null && at !== null)
    drawLabel(ctx, l, batonJobs(running, l.role === "test", seatOf(l.role)), at);
  ctx.restore();
}
