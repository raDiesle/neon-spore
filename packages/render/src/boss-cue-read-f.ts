import {
  type WardenState,
  type World,
  wardenEyeOpen,
  wardenHandleMilli,
  wardenHatchMilli,
  wardenPhase,
  wardenTether,
  wardenThrown,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldPoint } from "./handle-draw.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { wardenEyeCircle } from "./warden.js";
import { wardenGripCircle } from "./warden-grip.js";

/**
 * **What the bosses with a handle on the field are asking for** — page six of
 * the readings, opened for THE WARDEN.
 *
 * The five pages before this one mark a body, a lobe, a socket or a door. This
 * one marks a thing a hand is *already holding*, and that changes what may be
 * said: a handle draws its own word while nobody has it — `PULL` to the seat
 * whose it is and `P1'S` to the other (`handle-draw.ts`) — so a cue that
 * repeated it would be the four-pictures-for-one-idea mistake `target-lock.ts`
 * records the owner ending. What the picture does *not* say is what happens
 * after the grab, and that is the whole of this page.
 */

/** THE CHOIR's frame, in tiles: the size of this mark wherever it stands. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

/**
 * THE WARDEN. One hand that must not let go and one shot through what it
 * holds open, and the field says both halves without saying either seat's
 * answer.
 *
 * **Hers first, because her window shuts.** `PRESS` / `FIRE` on the pupil
 * while the eye is open and this line has not taken its hit — the pupil is
 * drawn on every screen (there is no `showsWarden` anything: the split here is
 * the verbs and not the picture), and the mark stands on the hole rather than
 * on a column, so it travels with the eye as the eye drifts. The colour is
 * never said. The rim carries it all cycle, in front of both of them
 * (`wardenColor`), and a word that named it would be the field answering the
 * one question this boss asks twice a cycle.
 *
 * **His second, and only after the grab.** While the hand is on the rope and
 * the line is not yet taut it is `CARRY` / `PULL`, on the handle wherever he
 * has carried it; once it is taut it is `HOLD`, which is the word and the kind
 * at once, because what the fight wants then is a hand that does nothing.
 * Nothing at all while the rope hangs free: `drawTether` draws `PULL` on it
 * itself in that state, loudly, and stops the moment a hand lands — so the two
 * of them are one word between them, never two at once.
 *
 * And nothing on either seat once `eyeSpent`: the opening has taken its hit,
 * holding it costs him a hand for nothing, and a second shot into it is a
 * bolt she needed for the next line.
 *
 * **The other two phases, one word each** (`warden-grip.ts`). Under NARROW
 * the lids are hers: `HOLD` on the shut eye while a line hangs and her thumb
 * is not down, on top of whatever his rope is asking — two seats, two marks,
 * the one time this page says two things at once, because the eye needs both
 * hands before it shows. Under GLARE there is no rope and the hatch is his
 * swipe: `SWIPE` on it until it is thrown, then hers is `FIRE` for three
 * beats and nothing is his, because the window is theirs to count.
 */
export function wardenCues(
  l: Layout,
  world: World,
  b: WardenState,
  skinY: SurfaceY,
): readonly BossCue[] {
  if (b.eyeSpent) return [];
  const out: BossCue[] = [];
  const open = wardenEyeOpen(world, b);
  const body = world.creatures.find((c) => c.id === b.creatureId);
  const asks = wardenPhase(b.plates).asks;

  if (open && body !== undefined) {
    const eye = wardenEyeCircle(l, body, b, wardenHatchMilli(world, b) / 1000);
    out.push(markAt(2, "PRESS", "FIRE", eye.x, eye.y, l, 69));
  } else if (body !== undefined) {
    const eye = wardenGripCircle(l, body, b);
    if (asks === "hold" && !b.eyeHeld && wardenTether(world) !== null) {
      out.push(markAt(2, "HOLD", "HOLD", eye.x, eye.y, l, 82));
    }
    if (asks === "throw" && !wardenThrown(world, b)) {
      out.push(markAt(1, "CARRY", "SWIPE", eye.x, eye.y, l, 83));
    }
  }

  if (b.pulling) {
    const head = fieldPoint(l, wardenHandleMilli(world, b));
    // **On the hand, down to the skin and no further.** The rope hangs with
    // seven tiles of field under it and six above (`bosses.md` §11.4), so the
    // pull that reaches taut is the downward one and the handle finishes the
    // gesture *on the ship* — where the field, drawn before the hull, would be
    // plating over the mark entirely.
    //
    // It used to stop `HULL_LIFT` — 1.7 tiles — clear of the skin, so that the
    // verb hung under the frame still had somewhere readable to land. That was
    // the same question `cueWordY` now answers for every boss at once: a word
    // that would be written into the membrane is written above the mark
    // instead (`BossCue.wordFloor`, `render/test/boss-cue-hull.test.ts`). With
    // the word looked after, lifting the mark is a frame floating a tile and a
    // half off the hand it is naming, so it comes back down to the hull line
    // where the other eight bosses park theirs.
    const y = Math.min(head.y, skinY(head.x));
    out.push(
      open
        ? markAt(1, "HOLD", "HOLD", head.x, y, l, 70)
        : markAt(1, "CARRY", "PULL", head.x, y, l, 71),
    );
  }
  return out;
}
