import { PALETTE, smoothstep } from "@neon-spore/render";
import { drawWayArrow } from "../../../packages/render/src/way-arrow.js";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import { viewOf } from "./hold-goo/view.js";
import {
  freshHold,
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  holdAsk,
  type LabHold,
  lift,
  move,
  press,
  tick,
} from "./hold-lab-rule.js";
import { LAB_TILE } from "./pull-lab-shapes.js";

/**
 * **HOLD, THEN SWIPE**, in THE COMBO LAB — THE SLING's cord (`DrawRelease`):
 * a mark held for its beats — the HOLD LAB's rule and look — and then the
 * lift's direction is the answer. Held the whole time and lifted with a swipe
 * a tile or more the asked way, it is counted; let go before the beats are
 * done, or lifted short or the other way, it is refused, red.
 *
 * The way asked is drawn as THE INSTAR's arrow (`drawWayArrow`), dim while
 * the hold fills and bright once it is drawn: the white of an instruction.
 */

interface Swipe {
  hold: LabHold;
  /** The beats are held: the next lift is the swipe. */
  drawn: boolean;
  /** Where the thumb was when the hold was drawn, and where it is now. */
  from: { x: number; y: number };
  at: { x: number; y: number };
  /** Lifts after a full hold that were short or the wrong way. */
  wrong: number;
}

const ASK: HoldAsk = holdAsk("2");
/** The way asked: to the right. */
const WAY = { dx: 1, dy: 0 };
/** How far a swipe must go the asked way: a tile. */
const SWIPE = LAB_TILE;

function judge(s: Swipe): void {
  const h = s.hold;
  const along = (s.at.x - s.from.x) * WAY.dx + (s.at.y - s.from.y) * WAY.dy;
  const good = along >= SWIPE;
  h.verdict = good ? "counted" : "refused";
  h.last = h.verdict;
  h.since = 0;
  h.age = 0;
  h.from = { fill: 1, off: { ...h.off } };
  if (good) h.counted++;
  else s.wrong++;
}

/** AUTO: a hold and a swipe right, a hold let go early, a hold and a swipe the wrong way. */
function loopOf(): ThumbStep[] {
  const T = ASK.beats * (60 / 96);
  const at = HOLD_AT;
  const right = { x: at.x + SWIPE * 1.6, y: at.y - 4 };
  const left = { x: at.x - SWIPE * 1.6, y: at.y + 4 };
  return [
    { until: 0.8, down: false, to: at },
    { until: 1 + T, down: true, to: at },
    { until: 1.25 + T, down: true, to: right },
    { until: 2.6 + T, down: false, to: at },
    { until: 2.6 + T * 1.5, down: true, to: at },
    { until: 4 + T * 1.5, down: false, to: at },
    { until: 4.2 + T * 2.5, down: true, to: at },
    { until: 4.45 + T * 2.5, down: true, to: left },
    { until: 5.8 + T * 2.5, down: false, to: at },
  ];
}

const STEPS = loopOf();

export const HOLD_SWIPE: ComboRule<Swipe> = {
  key: "swipe",
  label: "HOLD, THEN SWIPE",
  says: "a mark held for two beats, and then lifted with a swipe the asked way",
  like: "THE SLING's cords, drawn for their beats and loosed by the swipe",
  fresh: () => ({
    hold: freshHold(),
    drawn: false,
    from: HOLD_AT,
    at: HOLD_AT,
    wrong: 0,
  }),
  press(s, at) {
    if (!press(s.hold, at)) return;
    s.drawn = false;
    s.at = at;
  },
  move(s, at) {
    s.at = at;
    move(s.hold, at);
  },
  lift(s) {
    lift(s.hold);
    if (!s.drawn) return;
    s.drawn = false;
    judge(s);
  },
  tick(s, dt) {
    tick(s.hold, ASK, dt);
    const h = s.hold;
    if (h.phase !== "done" || s.drawn || h.verdict !== "counted" || h.since > 0) return;
    // The beats are held: not a count yet, the swipe is.
    h.counted--;
    h.verdict = null;
    h.last = null;
    s.drawn = true;
    s.from = s.at;
  },
  paint(ctx, s, look, time) {
    const v = viewOf(ctx, s.hold, ASK, time);
    ctx.save();
    look.paint(s.drawn ? { ...v, held: true, fill: 1, r: HOLD_R } : { ...v, r: HOLD_R });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = s.drawn ? 1 : 0.35;
    const x = HOLD_AT.x + WAY.dx * HOLD_R * 2.4;
    const y = HOLD_AT.y + WAY.dy * HOLD_R * 2.4;
    ctx.strokeStyle = PALETTE.text;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawWayArrow(ctx, x, y, HOLD_R * 0.7, WAY.dx, WAY.dy, time);
    ctx.restore();
  },
  state(s) {
    const h = s.hold;
    if (h.verdict === "counted") return "COUNTED";
    if (h.verdict === "refused")
      return h.from.fill === 1 ? "SHORT OR THE WRONG WAY · REFUSED" : "LET GO EARLY · REFUSED";
    if (h.verdict === "slipped") return "OFF THE MARK";
    if (s.drawn) return "DRAWN · SWIPE TO LOOSE";
    return h.phase === "held" ? "HOLDING" : "WAITING";
  },
  tally: (s) => ({
    counted: s.hold.counted,
    refused: s.hold.refused + s.wrong,
    strayed: s.hold.slipped,
  }),
  thumb: (t) => scriptedThumb(STEPS, t, smoothstep),
  loop: STEPS[STEPS.length - 1]?.until ?? 1,
};
