import type { InputBuffer } from "./input-buffer.js";

/**
 * **The phone being shaken**, which is THE CHOIR's own control and the only
 * input in this game that is not a finger on the glass.
 *
 * **There is no reliable way to ask whether a device can report one**, and
 * that is why nothing here tries. `"DeviceMotionEvent" in window` is true in
 * desktop Chrome and Firefox, where no accelerometer exists and no event ever
 * fires; iOS 13 and later gate the whole thing behind
 * `DeviceMotionEvent.requestPermission()`, which must be called from a user
 * gesture and can be refused; a refusal, a missing sensor and a page served
 * over plain `http` are the same silence. Some browsers deliver the event with
 * every field `null`. A feature check that answered "yes" to all of those
 * would be worse than no check at all — it would hide the arrows from a pilot
 * whose phone was never going to answer.
 *
 * So the game **offers both, always**: this listener, and the two arrows drawn
 * against the walls of the field (`render/choir-arrows.ts`). Whichever the
 * pilot's hands and their phone can manage is the one they use, and neither is
 * hidden on the strength of a guess. That is the owner's own decision, taken
 * when the question was put to him.
 *
 * **What it sends is one flat command with nothing on it.** How hard a phone
 * was moved is decided here, because this is the only side of the wire that
 * has the numbers; a threshold crossed on one device is a fact the other must
 * simply be told (`sim/command-types.ts`). And it is always player 1's: the
 * pilot is the seat that owns the gesture, and `choirArrowHeard` refuses seat
 * 2 outright for the same reason (`sim/choir-gesture.ts`).
 */

/**
 * How much the reading has to change, in m/s², before it counts as a shake.
 *
 * It is a **change** and not a magnitude, because `accelerationIncludingGravity`
 * is the only field every browser fills in and it reads about 9.8 on a phone
 * lying perfectly still. A threshold on the magnitude would fire on gravity
 * alone; the difference between one sample and the next is nought for a phone
 * at rest whichever way up it is.
 *
 * Eighteen is a deliberate shove. A phone carried across a room does not reach
 * it, and neither does a thumb landing hard on the glass — the pilot has to
 * mean it, which is the whole of what makes this a gesture rather than a
 * misfire waiting to happen.
 */
const THRESHOLD = 18;

/**
 * Seconds after one shake before another can be sent.
 *
 * A real shake is several samples over the threshold in a row, so without this
 * one gesture would send a dozen commands into the lockstep buffer. Long
 * enough to cover the whole motion, short enough that a second membrane
 * arriving straight after the first can be answered.
 */
const COOLDOWN = 0.8;

/**
 * Listen for the device being shaken and push a `shake` when it is.
 *
 * It is bound for the life of the page, the way the keyboard is: the buffer it
 * writes into outlives every wave and every link session, and a `shake` sent
 * at a field with no membrane on it does nothing at all (`choirShaken`).
 *
 * **iOS's permission is not asked for here**, and that is deliberate rather
 * than an omission: it can only be requested from inside a user gesture, and
 * this function is called while the game is starting up. The arrows work
 * without it, so a phone that never grants it is a phone that plays the
 * creature the other way — which is exactly what the arrows are for.
 */
export function bindShake(buffer: InputBuffer): void {
  if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return;
  let last: { x: number; y: number; z: number } | null = null;
  let quiet = 0;
  const onMotion = (e: DeviceMotionEvent): void => {
    // `acceleration` has gravity taken out and is the better reading, but it
    // is null on a good many Android browsers. The one every device fills in
    // is the other, and comparing consecutive samples makes gravity cancel.
    const a = e.acceleration ?? e.accelerationIncludingGravity;
    if (a === null || a.x === null || a.y === null || a.z === null) return;
    const now = { x: a.x, y: a.y, z: a.z };
    const was = last;
    last = now;
    // The interval is the event's own where it has one: browsers deliver
    // motion at anything from 15 to 60 Hz, and a cooldown counted in events
    // would be four times as long on the slowest of them.
    quiet = Math.max(0, quiet - (e.interval > 0 ? e.interval / 1000 : 1 / 60));
    if (was === null || quiet > 0) return;
    const moved = Math.abs(now.x - was.x) + Math.abs(now.y - was.y) + Math.abs(now.z - was.z);
    if (moved < THRESHOLD) return;
    quiet = COOLDOWN;
    buffer.push(1, { kind: "shake" });
  };
  window.addEventListener("devicemotion", onMotion);
}
