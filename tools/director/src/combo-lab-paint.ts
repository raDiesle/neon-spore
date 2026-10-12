import { drawPullKnob, drawPullTrack, PALETTE, pullTrackPoint } from "@neon-spore/render";
import { ENDING } from "../../../packages/render/src/goo-moment.js";
import {
  type Combo,
  type LabCombo,
  PARTNER_PULLS,
  PARTNER_WAKES,
  partnerAt,
} from "./combo-lab-rule.js";
import type { HoldLook, HoldView } from "./hold-goo/view.js";
import { BEAT_SECONDS, type HoldAsk } from "./hold-lab-rule.js";
import { afterOf, paintField, toneOf } from "./pull-lab-paint.js";
import { knobAt } from "./pull-lab-rule.js";
import { LAB_KNOB } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * One frame of THE COMBO LAB (`combo-lab.ts`): the PULL LAB's empty field and
 * its pull, drawn by the game's own `drawPullTrack` and `drawPullKnob` — and,
 * once the knob is at the end of its channel, **the HOLD LAB's hold in its
 * place**, the look picked on the bar, filling as the hold is done. The
 * partner's knob is drawn as the game draws a partner's: dim, no arrow, no
 * channel (`lamprey-handles.ts`). No word on the field; the bar says it.
 */

export interface ComboFrame {
  combo: Combo;
  state: LabCombo;
  look: HoldLook;
  time: number;
}

/** The hold's drop, a little larger than the knob it takes over from. */
const HOLD_SIZE = 1.3;
/** Seconds since something that never happened. */
const NEVER = 60;

export function paintComboLab(ctx: CanvasRenderingContext2D, f: ComboFrame): void {
  paintField(ctx);
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
}

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

/** How long the hold at the end asks, as the HOLD LAB's looks count it. */
export function holdAskOf(combo: Combo): HoldAsk {
  const beats =
    combo.partner === null
      ? combo.beats
      : Math.max(1, Math.round((PARTNER_WAKES + PARTNER_PULLS) / BEAT_SECONDS));
  return { key: combo.key, label: combo.label, beats };
}

/** What the hold look is told while the knob is held at the end, or its count plays out. */
function holdView(ctx: CanvasRenderingContext2D, f: ComboFrame): HoldView | null {
  const { combo, state, time } = f;
  const ending = state.verdict === "counted" && state.since < ENDING ? state.since : null;
  if (state.phase === "pull" && ending === null) return null;
  const end = pullTrackPoint(combo.shape.track, 1);
  return {
    ctx,
    at: { x: end.x, y: end.y },
    r: LAB_KNOB * HOLD_SIZE,
    time,
    ask: holdAskOf(combo),
    mark: true,
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

/** The bar's readout: the state, how much of the hold is done, and what the tries have come to. */
export function comboReadout(combo: Combo, s: LabCombo): string {
  const waitingFor = combo.partner ? "HOLDING · THE PARTNER PULLS" : "HOLDING";
  const state = s.verdict
    ? VERDICT_WORDS[s.verdict]
    : s.phase === "hold"
      ? waitingFor
      : s.pull.phase === "held"
        ? "PULLING"
        : "WAITING";
  const done = Math.round(s.fill * 100);
  return `${state} · HOLD ${done}% · COUNTED ${s.counted} · REFUSED ${s.refused} · OFF PATH ${s.strayed}`;
}
