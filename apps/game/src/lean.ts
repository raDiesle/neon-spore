import type { Command } from "@neon-spore/sim";
import type { InputBuffer } from "./input-buffer.js";

/**
 * **The phone's own lean**, which is THE PLUMB's control: each seat holds its
 * phone level to hang its weight true (`docs/spec/bosses-choreographed.md`
 * §31, `sim/plumb-hand.ts`). The second input in the game that is not a
 * finger on the glass, and it lives beside the first (`shake.ts`).
 *
 * **What goes on the wire is `gamma`, the phone's roll left or right, in
 * thousandths of a degree** — `LevelTilt`, as §31 names it — as a drag on the
 * seat's own weight: the pilot's `plumbLevelLeft`, the navigator's
 * `plumbLevelRight`. `on: false` is a phone that has stopped being read.
 *
 * **Not every event is sent.** A browser reports orientation at up to sixty
 * a second and every one sent is a command in the lockstep buffer, so a
 * reading goes out only when it has moved `LEAN_STEP_MILLI` from the last one
 * sent. The ranges it is judged against are four to eight degrees, so half a
 * degree is finer than any of them can tell.
 *
 * **Only while a bob is on the field.** A lean at any other wave is a
 * command nothing hears, so none is sent; and a new bob — the wave started
 * again — begins with neither phone read (`freshPlumb`), so the reader forgets
 * what it sent and tells the new one at its next event.
 */

/** How far, in thousandths of a degree, a lean must move before it is sent again. */
export const LEAN_STEP_MILLI = 500;

/** The furthest a phone rolls either way, gamma's own range, and the simulation's clamp. */
const MAX_LEAN_MILLI = 90_000;

/** A gamma reading in degrees as the integer the simulation stores. */
export function leanMilli(gamma: number): number {
  return Math.max(-MAX_LEAN_MILLI, Math.min(MAX_LEAN_MILLI, Math.round(gamma * 1000)));
}

export interface LeanReader {
  /** One orientation event's gamma, in degrees. */
  read: (gamma: number) => void;
  /** The sensor has gone — the page hidden — so the seat's phone is not read. */
  lose: () => void;
}

/**
 * The reader without the page: what a reading is sent as, and when. `bob` is
 * the plumb on the field or `null`, compared by identity so a restarted wave
 * is a new bob.
 */
export function leanReader(
  push: (player: 1 | 2, command: Command) => void,
  seat: () => 1 | 2,
  bob: () => object | null,
): LeanReader {
  let sent: number | null = null;
  let heard: object | null = null;
  const target = (p: 1 | 2) => (p === 1 ? "plumbLevelLeft" : "plumbLevelRight");
  return {
    read: (gamma) => {
      const now = bob();
      if (now !== heard) sent = null;
      heard = now;
      if (now === null || !Number.isFinite(gamma)) return;
      const lean = leanMilli(gamma);
      if (sent !== null && Math.abs(lean - sent) < LEAN_STEP_MILLI) return;
      sent = lean;
      const p = seat();
      push(p, { kind: "drag", target: target(p), on: true, fromMilli: lean });
    },
    lose: () => {
      if (sent === null || heard === null || bob() !== heard) {
        sent = null;
        return;
      }
      sent = null;
      const p = seat();
      push(p, { kind: "drag", target: target(p), on: false, fromMilli: 0 });
    },
  };
}

/**
 * Listen for the phone's lean for the life of the page, as `bindShake` does.
 *
 * **iOS's permission is not asked for here**, `shake.ts`'s reason: it can
 * only be requested from a press. `askForLean` below asks.
 */
export function bindLean(buffer: InputBuffer, seat: () => 1 | 2, bob: () => object | null): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const reader = leanReader((p, c) => buffer.push(p, c), seat, bob);
  window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
    // Desktop browsers deliver one event with every field null, and so does a
    // phone whose sensor was refused: that is silence, not a lean of nought.
    if (e.gamma !== null) reader.read(e.gamma);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") reader.lose();
  });
}

/**
 * **Ask iOS for the sensor, from inside a press** — `askForMotion`'s
 * reason, for the other half of the same permission. Called from the thumb
 * lifting off the guide's READY on THE PLUMB's own wave (`briefing.ts`), so
 * the navigator, whom `askForMotion` never asks, is asked too, and only when
 * there is a lean to read. A browser with no such method is skipped and a
 * refusal ignored.
 */
export function askForLean(): void {
  const orientation = (globalThis as { DeviceOrientationEvent?: { requestPermission?: unknown } })
    .DeviceOrientationEvent;
  const ask = orientation?.requestPermission;
  if (typeof ask !== "function") return;
  try {
    void Promise.resolve(ask.call(orientation)).catch(() => {});
  } catch {
    // Refused synchronously — outside a gesture on an older WebKit.
  }
}
