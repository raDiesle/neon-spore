import {
  drawPullKnob,
  drawPullTrack,
  PALETTE,
  pullTrackPoint,
  smoothstep,
} from "@neon-spore/render";
import { ENDING } from "../../../packages/render/src/goo-moment.js";
import {
  type Combo,
  type LabCombo,
  PARTNER_PULLS,
  PARTNER_WAKES,
  partnerAt,
} from "./combo-lab-rule.js";
import type { HoldLook, HoldView } from "./hold-goo/view.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import { BEAT_SECONDS, HOLD_R, type HoldAsk } from "./hold-lab-rule.js";
import { afterOf, toneOf } from "./pull-lab-paint.js";
import { knobAt } from "./pull-lab-rule.js";
import { LAB_KNOB } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * One frame of THE COMBO LAB (`combo-lab.ts`): the PULL LAB's empty field and
 * its pull, drawn by the game's own `drawPullTrack` and `drawPullKnob` — and,
 * once the knob is at the end of its channel, **the HOLD LAB's hold in its
 * place**, SOAK at the HOLD LAB's own size (`HOLD_R`), filling as the hold is done. The
 * partner's knob is drawn as the game draws a partner's: dim, no arrow, no
 * channel (`lamprey-handles.ts`). No word on the field; the bar says it.
 *
 * **The place the hold will stand wears the waiting clock** — the one a mark
 * only the partner is asked wears in the game (`drawMarkWait`) — from the
 * moment a knob is on the field until the hold is counted, whether it waits on the
 * partner or on the beats (the owner, 12 October 2026: *show on placeholder a
 * clock symbol we use for other player to wait for him*) — and from before the
 * knob is taken (14 October: *should already show the clock icon before the
 * user started to pull it*). It stands in the
 * middle of the dashed place while the knob travels, and once the hold is on
 * slides up to the drop's shoulder, so SOAK's water wells up in the middle
 * uncovered (`drawHoldClock`, which every hold in the labs wears).
 */

export interface ComboFrame {
  combo: Combo;
  state: LabCombo;
  look: HoldLook;
  time: number;
}

/** Seconds the clock takes to slide from the place to the drop's shoulder. */
const SLIDE = 0.3;
/** Seconds since something that never happened. */
const NEVER = 60;

export function paintComboLab(ctx: CanvasRenderingContext2D, f: ComboFrame): void {
  const { combo, state, time } = f;
  const pull = state.pull;
  if (combo.partner) paintPartner(ctx, f);
  if (!state.waiting) {
    const tone = toneOf(pull);
    const held = pull.phase === "held" || pull.phase === "full";
    const after = afterOf(pull, strayReach("half"));
    drawPullTrack(ctx, combo.shape.track, { ...tone, held, origin: 0, at: pull.at, time, after });
    if (state.phase === "pull") {
      const q = pullTrackPoint(combo.shape.track, pull.at);
      drawPullKnob(ctx, knobAt(combo.shape, pull), LAB_KNOB, {
        ...tone,
        held,
        time,
        way: { dx: q.dx, dy: q.dy },
        after,
      });
    }
  }
  const view = holdView(ctx, f);
  if (view) {
    ctx.save();
    f.look.paint(view);
    ctx.restore();
  }
  if (waits(state)) {
    const end = pullTrackPoint(combo.shape.track, 1);
    const u = state.phase === "hold" ? smoothstep(Math.min(1, state.held / SLIDE)) : 0;
    drawHoldClock(ctx, end, HOLD_R, u, time);
  }
}

/** A knob is on the field and nothing is counted yet: the clock is up, before the thumb is. */
export const waits = (s: LabCombo): boolean => !s.waiting;

function paintPartner(ctx: CanvasRenderingContext2D, { combo, state, time }: ComboFrame): void {
  const track = combo.partner;
  if (!track) return;
  const at = pullTrackPoint(track, partnerAt(state));
  const pulling = state.phase === "hold" && state.held > PARTNER_WAKES;
  drawPullKnob(ctx, { x: at.x, y: at.y }, LAB_KNOB, {
    hex: PALETTE.dim,
    rim: PALETTE.rock,
    held: pulling || state.phase === "done",
    time,
    way: null,
    theirs: true,
  });
}

/** How long the hold at the end asks, as the HOLD LAB's SOAK counts it. */
export function holdAskOf(combo: Combo): HoldAsk {
  const beats =
    combo.partner === null
      ? combo.beats
      : Math.max(1, Math.round((PARTNER_WAKES + PARTNER_PULLS) / BEAT_SECONDS));
  return { key: combo.key, label: combo.label, beats };
}

/** What the hold look is told while the knob is held at the end, or its count plays out. */
export function holdView(ctx: CanvasRenderingContext2D, f: ComboFrame): HoldView | null {
  const { combo, state, time } = f;
  const ending = state.verdict === "counted" && state.since < ENDING ? state.since : null;
  if (state.phase === "pull" && ending === null) return null;
  const end = pullTrackPoint(combo.shape.track, 1);
  return {
    ctx,
    at: { x: end.x, y: end.y },
    r: HOLD_R,
    time,
    ask: holdAskOf(combo),
    // Counted with the thumb still down, the drop boils away under it: no lift asked.
    mark: !state.waiting,
    held: state.phase === "hold",
    fill: state.phase === "pull" ? 1 : state.fill,
    near: 0,
    way: { x: 0, y: 0 },
    grabbed: state.held,
    lifted: state.phase === "pull" ? state.since : NEVER,
    born: NEVER,
    ending,
    failure: null,
  };
}

const VERDICT_WORDS: Readonly<Record<string, string>> = {
  counted: "COUNTED",
  refused: "LET GO EARLY · REFUSED",
  strayed: "OFF THE PATH",
};

/** The state for the bar, and how much of the hold is done; the tallies follow it (`comboReadout`). */
export function comboState(combo: Combo, s: LabCombo): string {
  const waitingFor = combo.partner ? "HOLDING · THE PARTNER PULLS" : "HOLDING";
  const state = s.verdict
    ? VERDICT_WORDS[s.verdict]
    : s.phase === "hold"
      ? waitingFor
      : s.pull.phase === "held"
        ? "PULLING"
        : "WAITING";
  return `${state} · HOLD ${Math.round(s.fill * 100)}%`;
}
