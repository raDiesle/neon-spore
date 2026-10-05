import {
  type AntiphonState,
  antiphonChooser,
  antiphonOrganCol,
  antiphonRailAsks,
  type SimConfig,
} from "@neon-spore/sim";
import { antiphonCandidateAt, antiphonOrganCircle, antiphonPerch } from "./antiphon-shape.js";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { drawGripRing } from "./grip-rings.js";
import { drawVerdictRing, type GripVerdicts } from "./grip-verdict.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { drawPullArrow } from "./pull-knob.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsAntiphonRail } from "./view-role-clocks-b.js";

/**
 * **THE ANTIPHON's second handle: the rail, on the one screen it hangs on.**
 *
 * The organ is the explainer's to turn (`antiphon-grip.ts`); this is the
 * chooser's, and the whole of it is one sentence — *carry the one being
 * described down to it.* A thumb grabs a candidate and carries it along its
 * vein toward the organ's place; let go short and it springs back, carried
 * all the way and it is judged there (`sim/antiphon-hand.ts`). THE
 * FILAMENT's lesson, a path to drag along and a place to drop at.
 *
 * **The chooser's and only theirs**, decided by what each seat is drawn:
 * `showsAntiphonRail` puts the rail on one screen a level, and a handle a
 * seat cannot see is not a handle. A press from the other seat is dropped
 * without a sound in the simulation, as `queenMark` drops it.
 *
 * **A ring on every candidate, never on one**: a ring on the one being
 * described would be the chooser's own reading handed back. Each carries
 * the way down its vein inside it (`drawPullArrow`), and the one in hand
 * moves with its ring. The hit test is the candidate's resting circle at its
 * perch, thumb-sized, nearest wins — `creatureAt`'s rule. Whether the carry
 * *takes* — not before the organ stands, not a second one at once — is the
 * simulation's to refuse.
 *
 * Over the rings, the convention every mark answers a touch with
 * (`antiphon-marks.ts`): the halo under each candidate a carry would take
 * on (`antiphonRailAsks`); the verdict is the organ's and drawn there
 * (`drawAntiphonVerdict`).
 */

/** How far below the rail the word sits, in tiles — clear of the candidates. */
const WORD_DOWN = 1.15;
/** The word's frame, in tiles. */
const HALF_W = 0.62;
const HALF_H = 0.4;

/**
 * A press on a candidate while the rail is up: a `drag` on `antiphonRail`
 * carrying the place on the rail as its `id` (`drag-targets-c.ts`). The
 * move reports the thumb's displacement both ways (`touch-move.ts`), and
 * the simulation reads it along the vein.
 */
export function antiphonRailUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "antiphon");
  if (s === null || !showsAntiphonRail(l.role, s)) return null;
  if (field.seat !== antiphonChooser(s)) return null;
  if (s.downBeat >= 0 || s.rail.length === 0) return null;
  const r = handleRadius(l, field.cfg);
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < s.rail.length; i++) {
    const c = s.rail[i];
    if (c === undefined) continue;
    const at = antiphonPerch(l, field.cfg, c.col);
    if (!hitCircle({ x: at.x, y: at.y, r: Math.max(r, l.tile * 0.8) }, x, y)) continue;
    const d = Math.hypot(x - at.x, y - at.y);
    if (d >= bestDist) continue;
    best = i;
    bestDist = d;
  }
  if (best === null) return null;
  const target = "antiphonRail";
  const player = field.seat;
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target, player, originX: x, originY: y, id: best },
  };
}

/** The rings, each with the way down its vein, and the one word under them. */
export function drawAntiphonRailGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  beat: number,
  time: number,
  fade: number,
): void {
  if (fade < 1 || s.downBeat >= 0 || s.rail.length === 0) return;
  const r = handleRadius(l, cfg);
  const organ = antiphonOrganCircle(l, cfg);
  for (let i = 0; i < s.rail.length; i++) {
    const at = antiphonCandidateAt(l, cfg, s, i);
    if (antiphonRailAsks(s, cfg, beat, i)) drawMarkHalo(ctx, at.x, at.y, r, time);
    const held = s.carried === i;
    drawGripRing(ctx, at.x, at.y, r, held, time);
    const len = Math.hypot(organ.x - at.x, organ.y - at.y);
    if (len > 1) {
      const way = { dx: (organ.x - at.x) / len, dy: (organ.y - at.y) / len };
      drawPullArrow(ctx, at, r, way, time, { alpha: held ? 0.6 : 0.85 });
    }
  }
  if (s.carried >= 0) return;
  // **The cue** (`decisions.md` #34, `boss-cue-text.ts`). It says the verb and
  // never the answer: one word under the middle of the rail rather than one
  // per candidate, so it names nothing on it. The seat is the chooser's twice
  // over: the rail is drawn to them alone, and `cueSeen` says so again.
  const at = antiphonPerch(l, cfg, antiphonOrganCol(cfg));
  const cue: BossCue = {
    seat: antiphonChooser(s),
    kind: "CARRY",
    word: "PULL",
    x: at.x,
    y: at.y + l.tile * WORD_DOWN,
    halfW: l.tile * HALF_W,
    halfH: l.tile * HALF_H,
    seed: 96,
    framed: false,
  };
  if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
}

/** The organ's verdict, on every screen: green for the organ carried home, red for a decoy. */
export function drawAntiphonVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  verdicts: GripVerdicts,
): void {
  const v = verdicts.at(0);
  if (v === null) return;
  const c = antiphonOrganCircle(l, cfg);
  drawVerdictRing(ctx, c.x, c.y, c.r, v);
}
