import {
  type BatonBead,
  type BatonState,
  batonBeadRowMilli,
  batonLaunchable,
  batonLocked,
  batonMayStrip,
  type World,
} from "@neon-spore/sim";
import { beadPoint } from "./baton-bead-draw.js";
import { socketPoint } from "./baton-socket-draw.js";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import type { Layout } from "./layout.js";

/**
 * **THE BATON's `passing`** — the second half of page nine, and the readings'
 * first cut *within* a boss.
 *
 * The twenty-three pages `a` to `w` are one boss each. This one is not: page
 * nine's four stages are four different pairs of thumbs and `passing` is the
 * longest of them on its own — three words, a fourth on whichever seat the
 * beat locked out, and the `shotAt` that picks the bead a shot is about. It
 * came here so the page it left could take the guide lines still queued
 * against this boss without going over the ceiling; the switch and the other
 * three stages stayed (`boss-cue-read-i.ts`).
 */

/**
 * The bead a shot is about: the lowest one in the air that has not been
 * struck this flight. The lowest, because that is the one a bolt reaches
 * first and so the one the simulation will spend her shot on
 * (`sim/baton-press.ts`, `beadAlong`).
 */
function shotAt(world: World, b: BatonState): BatonBead | null {
  let pick: BatonBead | null = null;
  let low = -1;
  for (const bead of b.beads) {
    if (!bead.flying || bead.struck) continue;
    const milli = batonBeadRowMilli(world.cfg, b, bead, world.tick);
    if (milli <= low) continue;
    pick = bead;
    low = milli;
  }
  return pick;
}

/**
 * The arm's own beat.
 *
 * Three words, and the order they are in is what each costs to miss. The
 * flight is a window three beats wide and a bead nobody met lands back where
 * it left; the bead sitting in its socket is on a clock twice as long
 * (`batonTurnBeats`). So the flight outranks the socket on the pilot's screen
 * as well as the navigator's.
 *
 **Nothing stands on his cannon.** Her bolt goes up the column the cannon
 * is standing in (`sim/bullets.ts`), so a flight he is not under is a flight
 * she cannot meet; until 5 October 2026 a `MOVE` on the cannon said so, and
 * then the owner, 5 October 2026: *we do not need to show helper to "move" for
 * cannon to shoot* — her `FIRE`
 * on the bead is the place, and which column is the sentence they say.
 *
 * **`FIRE` does not wait for him.** It stands on the bead for as long as one
 * is in the air unstruck, whether or not the cannon is under it — THE VANE's
 * rule, for THE VANE's reason: the cannon is not drawn on her screen
 * (`showsCannon`), so a word that waited for it would hand her the one thing
 * he has to say out loud.
 *
 * Neither word says a colour. The bead wears the colour that takes it and
 * both screens are shown it (`baton-bead-draw.ts`); what the cue may not do
 * is name it, because `FIRE RED` is the pair's own sentence said for them.
 */
export function batonPassingCues(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  const cfg = world.cfg;
  const out: BossCue[] = [];
  const flying = shotAt(world, b);
  if (flying !== null) {
    if (!batonLocked(b, 2, world.beat)) {
      const { x, y } = beadPoint(l, cfg, b, flying, world.tick);
      out.push(markAt(2, "PRESS", "FIRE", x, y, l, 45 + flying.socket));
    }
  }
  // `TAP` on the sitting bead for whichever seat is free to send it — both
  // since 6 October 2026 (`sim/baton-press.ts` `batonLaunch`). His first, so
  // on the desk's both-seats screen the word stays where it always stood.
  const sitting = batonLaunchable(cfg, b);
  if (sitting !== null)
    for (const seat of [1, 2] as const) {
      if (batonLocked(b, seat, world.beat)) continue;
      const { x, y } = beadPoint(l, cfg, b, sitting, world.tick);
      const mark = markAt(seat, "PRESS", "TAP", x, y, l, 48 + sitting.socket + (seat - 1) * 20);
      out.push({ ...mark, why: "TO LAUNCH IT" });
    }
  // **`TAP` / `TO STRIP IT` is the locked seat's, and it is last.** A shell coming away is
  // the only thing on this field that seat may touch, and it is also the least
  // urgent thing on the screen: a rock is warded, and a handover missed is a
  // socket back. The mark is drawn on whichever of them the beat locked out,
  // which is what makes it move from phone to phone as the turn does — and on
  // a beat neither of them acted in, nobody is locked and nobody is asked.
  for (const seat of [1, 2] as const) {
    if (!batonMayStrip(b, seat, world.beat)) continue;
    const at = socketPoint(l, cfg, b, b.swellSocket);
    out.push({ ...markAt(seat, "PRESS", "TAP", at.x, at.y, l, 90 + seat), why: "TO STRIP IT" });
  }
  return out;
}
