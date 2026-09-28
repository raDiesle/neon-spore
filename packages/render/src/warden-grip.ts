import {
  type Creature,
  type SimConfig,
  type WardenState,
  type World,
  wardenPhase,
  wardenSwipeAlong,
  wardenThrown,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";
import { wardenEyeCircle } from "./warden.js";
import { wardenPose, wardenPosedCircle } from "./warden-drift.js";
import { WARDEN_EYE_MARK } from "./warden-fx.js";
import { drawWardenTrack } from "./warden-track.js";

/**
 * **THE WARDEN's eye as a control**, for the two gestures that ask a thumb for
 * it after the rope (`sim/warden-hand.ts`): player 2's thumb resting on the
 * eye under NARROW, which parts the lids and pins the pupil, and player 1's
 * swipe across the hatch under GLARE, which throws it open for
 * `wardenThrowBeats` and then lets it slam. One circle, and the phase and the
 * seat say which of the two a press is: the rope's handle hangs a row below
 * (`tether.ts`), so nothing here is under it.
 *
 * The circle is the eye **at rest**, shut, where it stands this beat — not
 * the hatch as it has come open, which swells with the pull and would be a
 * control you could only grab once your partner had done their half. The
 * pupil walks a column a beat under WATCH and NARROW; the thumb is asked to
 * land where it is *now*, the way the rope's handle is (`handles.ts`), and
 * once it is down the pupil stops under it.
 *
 * What is drawn is read off the world every frame and nothing is kept: under
 * NARROW a ring on the eye on the navigator's screen, breathing until her
 * thumb lands and filled while the sim has it (`eyeHeld`); under GLARE a track
 * through the hatch, because a swipe is drawn as the way the thumb goes and
 * never as a ring, filling as his thumb carries it (`warden-track.ts`), until
 * the lift throws it, and then the window's dial round the eye on **both**
 * screens, because three beats is *our* count — the shot has to go inside it. The other seat's thumb is never
 * drawn as a thumb: the pilot sees the lids part, the navigator sees the
 * hatch fly open, and each is what the partner's hand *does*. That is the
 * split. The word for each is the cue's (`boss-cue-read-f.ts`), never a
 * second voice here.
 *
 * **The eye answers a touch the way every mark does** (`mark-feedback.ts`,
 * `.claude/skills/new-boss` §5): on the seat it asks, a halo breathing under
 * the ring; on the other, a dashed ring turning round it and a clock in
 * place of the ring, until the partner's thumb is down; and on both, the
 * verdict — green for a thumb landed or a hatch thrown, red for a press this
 * phase refused (`sim/warden-hand.ts`, `warden-fx.ts`). So either seat's
 * press is handed through while the eye asks, and the simulation is what
 * says no — the wrong seat's as a press holding nothing, refused once.
 */

/** The ring, inside the hatch: on the eye, not round the hole. */
const RING_MUL = 0.5;

/** The eye, shut, where the pupil stands: what a thumb is asked to land on. */
export function wardenGripCircle(l: Layout, body: Creature, b: WardenState): Circle {
  return wardenEyeCircle(l, body, b, 0);
}

/**
 * Which of the two hands a press on the eye is under this phase, and whose
 * it asks for. A thrown hatch still answers its press, as it always has, and
 * the simulation lets it do nothing (`sim/warden-hand.ts`).
 */
function wardenGripAsks(
  b: WardenState,
): { target: "wardenEye" | "wardenHatch"; seat: 1 | 2 } | null {
  const asks = wardenPhase(b.plates).asks;
  if (asks === "hold") return { target: "wardenEye", seat: 2 };
  if (asks === "throw") return { target: "wardenHatch", seat: 1 };
  return null;
}

/** The eye under this point, if it asks: the phase's gesture and its seat. */
function eyeUnder(l: Layout, x: number, y: number, field: Field) {
  const b = bossOf(field, "warden");
  if (b === null) return null;
  const asks = wardenGripAsks(b);
  if (asks === null) return null;
  const body = field.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return null;
  // Where the eye is drawn this beat, rocked with the ring (`warden-drift.ts`).
  const pose = wardenPose(l, field.cfg, body, field.beat, field.beatPhase);
  if (!hitCircle(wardenPosedCircle(pose, wardenGripCircle(l, body, b)), x, y)) return null;
  return asks;
}

/**
 * **Whose thumb the eye under this point asks for** — the desk's question
 * before a press, because the eye is there for the wrong seat too and only
 * refuses it (`desk-grab.ts`, as THE INSTAR's `instarMarkSeat`).
 */
export function wardenGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  return eyeUnder(l, x, y, field)?.seat;
}

/**
 * A press on the eye: `wardenEye` is a hold whose lift lets go; `wardenHatch`
 * is a swipe whose **lift** is the gesture, carrying how far the thumb went
 * (`touch.ts` reads the travel off the hold's origin, as THE MIRROR's does).
 */
export function wardenGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const asks = eyeUnder(l, x, y, field);
  if (asks === null) return null;
  const { target } = asks;
  const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 } as const;
  // Signed with this field's seat, whosever the eye is: the wrong one is
  // refused by the simulation, and told so in red on the eye — a press and
  // no more, holding nothing, so no move of the thumb is refused a second
  // time (`spool-grip.ts`'s knob, `sinew-handles.ts`'s handles).
  if (asks.seat !== field.seat) return { player: field.seat, command, hold: null };
  return {
    player: field.seat,
    command,
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * The ring and the dial, drawn after the rope so they stand over it, and the
 * eye's verdict over both. Read off the world, this screen's role and the
 * verdict still fading, nothing else — a frame test sets the world and gets
 * the picture.
 */
export function drawWardenGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  world: World,
  body: Creature,
  b: WardenState,
  role: ViewRole,
  beatPhase: number,
  time: number,
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const asks = wardenPhase(b.plates).asks;
  if (asks === "pull") return;
  const c = wardenGripCircle(l, body, b);
  const r = c.r * RING_MUL;
  if (asks === "hold") {
    drawEyeMark(ctx, c, r, role !== "p1", b.eyeHeld, time);
  } else if (!wardenThrown(world, b)) {
    const reach = (l.tile * cfg.wardenThrowMilli) / 1000;
    const along = wardenSwipeAlong(world, b) / 1000;
    drawWardenTrack(ctx, { x: c.x, y: c.y, r }, reach, along, role !== "p2", time);
  } else {
    // The window, off the same beat `wardenThrown` read: the dial and the door agree.
    const gone = (world.beat - b.throwBeat + beatPhase) / cfg.wardenThrowBeats;
    drawGripDial(ctx, c.x, c.y, r, 1 - clamp01(gone));
  }
  const v = verdicts.at(WARDEN_EYE_MARK);
  if (v !== null) drawVerdictRing(ctx, c.x, c.y, r, v);
}

/**
 * The eye while it asks: this seat's ring with the halo under it, or the
 * partner's turning ring and clock — and nothing once the partner's thumb
 * is down, because then the lids parting are what this seat is shown.
 */
function drawEyeMark(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  r: number,
  mine: boolean,
  held: boolean,
  time: number,
): void {
  if (mine) {
    drawMarkHalo(ctx, c.x, c.y, r, time);
    drawGripRing(ctx, c.x, c.y, r, held, time);
    return;
  }
  if (held) return;
  drawMarkTheirs(ctx, c.x, c.y, r, time);
  drawMarkWait(ctx, c.x, c.y, r, time);
}
