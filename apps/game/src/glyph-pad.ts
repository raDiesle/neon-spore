import { type Layout, mimicPad } from "@neon-spore/render";
import { mimicBoss, mimicDraws, type World } from "@neon-spore/sim";
import { samplesOf } from "./coalesced.js";
import { recogniseGlyph, type StrokePoint } from "./glyph-stroke.js";
import type { InputBuffer } from "./input.js";

export interface GlyphPadOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  /** The seats this device's hand may be, the field's own (`render/desk-seat.ts` `pointerSeats`). */
  seats: () => readonly (1 | 2)[];
}

/**
 * **THE MIMIC's pad**: a stroke on the lower field, sent as the `glyph` it
 * was nearest (`glyph-stroke.ts`), signed by the seat that owes a sign.
 *
 * Bound beside the field's own listener the way `lost.ts` is, and for the
 * same reason: the pad is up only while a sign is owed, nothing else on the
 * field answers a stroke there in that window, and the band below it keeps
 * its cannon and its shield for the core. The pad is the lower half of the
 * play area (§42: "a faint drawing pad over the lower field").
 *
 * **Only a seat that owes a sign is ever signed** (`mimicDraws`): the reader
 * has no pad, so a stroke on the reader's phone sends nothing, and on the
 * test screen, which is both seats, it goes to whichever of them is drawing —
 * the pilot first in a split. The simulation would drop the reader's anyway
 * (`sim/mimic-hand.ts`); this file not sending it keeps a wrong-seat stroke
 * off the wire.
 *
 * And the desk's five: keys 1 to 5 send the five signs in `GLYPHS` order, here
 * rather than in `keys.ts`, because that rig has no world to ask who owes one.
 * With Shift, the last seat drawing rather than the first — the navigator's
 * half of a split on the test screen. The same two digits hold a seat for
 * the mouse (`render/desk-seat.ts`), so the seats here are asked with no seat
 * held: a key that says a sign is not also a hand.
 */
export function bindGlyphPad({
  canvas,
  buffer,
  world,
  layout,
  inStage,
  seats,
}: GlyphPadOptions): void {
  let stroke: { pointer: number; at: StrokePoint[] } | null = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (stroke !== null || padDrawer(world, seats()) === null) return;
    const p = inStage(e);
    if (p === null || !inPad(layout(), p)) return;
    stroke = { pointer: e.pointerId, at: [p] };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (stroke === null || e.pointerId !== stroke.pointer) return;
    for (const sample of samplesOf(e)) {
      const p = inStage(sample);
      if (p !== null) stroke.at.push(p);
    }
  });
  const lift = (e: PointerEvent, cancelled: boolean): void => {
    if (stroke === null || e.pointerId !== stroke.pointer) return;
    const at = stroke.at;
    stroke = null;
    const seat = padDrawer(world, seats());
    if (cancelled || seat === null) return;
    const sign = recogniseGlyph(at);
    if (sign >= 0) buffer.push(seat, { kind: "glyph", sign });
  };
  canvas.addEventListener("pointerup", (e) => lift(e, false));
  canvas.addEventListener("pointercancel", (e) => lift(e, true));

  window.addEventListener("keydown", (e) => {
    const sign = GLYPH_KEYS.indexOf(e.code.replace("Numpad", "Digit"));
    if (sign < 0 || e.repeat) return;
    const seat = padDrawer(world, seats(), e.shiftKey);
    if (seat !== null) buffer.push(seat, { kind: "glyph", sign });
  });
}

/** The desk's five, in `GLYPHS` order. */
const GLYPH_KEYS = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"];

/** Whether a point on the stage is on the pad: the rectangle the drawer's screen frames (`render/mimic-pad.ts`). */
export function inPad(l: Layout, p: { x: number; y: number }): boolean {
  const pad = mimicPad(l);
  return p.y >= pad.y && p.y < pad.y + pad.h && p.x >= pad.x && p.x < pad.x + pad.w;
}

/**
 * The seat a stroke from this device is signed by: the first of `seats` that
 * owes THE MIMIC a sign — the last, with `last` — or `null` with none, which
 * is every moment but a sign's window.
 */
export function padDrawer(world: World, seats: readonly (1 | 2)[], last = false): 1 | 2 | null {
  const s = mimicBoss(world);
  if (s === null) return null;
  const drawing = seats.filter((seat) => mimicDraws(s, seat));
  return (last ? drawing[drawing.length - 1] : drawing[0]) ?? null;
}
