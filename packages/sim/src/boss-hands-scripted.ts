import { bastionHeard } from "./bastion-hand.js";
import { bastionGuarded } from "./bastion-shot.js";
import { capstanHeard } from "./capstan-hand.js";
import { flueRolled } from "./flue-step.js";
import { gallHeard } from "./gall-hand.js";
import { governorHeard } from "./governor-hand.js";
import { governorTurned } from "./governor-turn.js";
import { lampreyHeard } from "./lamprey-hand.js";
import { latchHeard } from "./latch-hand.js";
import { mimicHeard } from "./mimic-hand.js";
import { oculusGuarded } from "./oculus-guard.js";
import { oculusHeard } from "./oculus-hand.js";
import { oculusCounted } from "./oculus-level.js";
import { plumbHeard } from "./plumb-hand.js";
import { rimeGuarded } from "./rime-guard.js";
import { rimeHeard } from "./rime-hand.js";
import { seamGuarded } from "./seam-guard.js";
import { slingHeard } from "./sling-hand.js";
import { trapezeHeard } from "./trapeze-hand.js";
import { trapezeSwung } from "./trapeze-step.js";
import { trivetGuarded } from "./trivet-guard.js";
import { trivetHeard } from "./trivet-hand.js";
import type { TimedCommand } from "./types.js";
import { viseGuarded } from "./vise-guard.js";
import { viseHeard } from "./vise-hand.js";
import type { World } from "./world.js";

/**
 * **The scripted bosses' hands, read on the tick** — THE SEAM and every boss
 * after it that installs a script and nothing else (`wave-boss-scripted.ts`'s
 * `SCRIPTED_KINDS`), cut out of `boss-hands.ts` when THE LAMPREY took that
 * page to its 250-line limit. Called once from there, at the place the block
 * stood; the order between them does not matter, for one boss is installed at
 * a time. The next scripted boss adds its line here, at the end.
 */
export function scriptedHandsHeard(world: World, commands: readonly TimedCommand[]): void {
  // THE SEAM's shield, once a tick after the commands: no handle of its
  // own, only the guard and the plate read against its lit step (`seam-guard.ts`).
  seamGuarded(world);
  // THE OCULUS's two leaves, on the tick because a slip is the instant a
  // thumb lifts (`oculus-hand.ts`); and its pair counted and judged on the
  // tick too, every tick both thumbs are down being worth one (`oculus-level.ts`).
  for (const c of commands) oculusHeard(world, c.player, c.command);
  oculusCounted(world);
  // Its glare, THE SEAM's shield once a tick after the commands (`oculus-guard.ts`).
  oculusGuarded(world);
  // THE VISE's two gaps, on the tick for the same reason: a slip is the
  // instant a gap widens back past shut (`vise-hand.ts`).
  for (const c of commands) viseHeard(world, c.player, c.command);
  // Its bite, THE SEAM's shield once a tick after the commands (`vise-guard.ts`).
  viseGuarded(world);
  // THE RIME's two wipes, on the tick because a half wiped to nought is
  // answered then, before the beat's regrowth could undo it (`rime-hand.ts`);
  // and its shield, THE SEAM's once a tick after the commands (`rime-guard.ts`).
  for (const c of commands) rimeHeard(world, c.player, c.command);
  rimeGuarded(world);
  // THE TRIVET's pads, on the tick for the same reason: a slip is the instant
  // a pad of the lit chord lifts (`trivet-hand.ts`).
  for (const c of commands) trivetHeard(world, c.player, c.command);
  // Its needle, THE SEAM's shield once a tick after the commands (`trivet-guard.ts`).
  trivetGuarded(world);
  // THE PLUMB's leans, the same: a drift is the instant a lean leaves range (`plumb-hand.ts`).
  for (const c of commands) plumbHeard(world, c.player, c.command);
  // THE SLING's draws, the same: a draw is judged the instant it lifts
  // (`sling-hand.ts`).
  for (const c of commands) slingHeard(world, c.player, c.command);
  // THE CAPSTAN's leans and rubs: the cradle rocking and a band cracking are
  // both the instant (`capstan-hand.ts`).
  for (const c of commands) capstanHeard(world, c.player, c.command);
  // THE GALL's taps and pull, judged at the lift (`gall-hand.ts`).
  for (const c of commands) gallHeard(world, c.player, c.command);
  // THE TRAPEZE's swipes and lock, judged the instant they lift or land (`trapeze-hand.ts`),
  // and its swing moved after them, so a bolt meets the alien where it is (`trapeze-step.ts`).
  for (const c of commands) trapezeHeard(world, c.player, c.command);
  trapezeSwung(world);
  // THE FLUE hears no command of its own; its ember runs on the tick, so a
  // shot is met where it really is (`flue-step.ts`).
  flueRolled(world);
  // THE GOVERNOR's chords and tap, and its needle turned after them (`governor-hand.ts`, `governor-turn.ts`).
  for (const c of commands) governorHeard(world, c.player, c.command);
  governorTurned(world);
  // THE LAMPREY's jaw and teeth, a crack or a snap the instant (`lamprey-hand.ts`).
  for (const c of commands) lampreyHeard(world, c.player, c.command);
  // THE MIMIC's glyph: a sign drawn peels or is mimicked the instant it lands (`mimic-hand.ts`).
  for (const c of commands) mimicHeard(world, c.player, c.command);
  // THE LATCH's grips: a lift is judged the instant it lands, against the other grip (`latch-hand.ts`).
  for (const c of commands) latchHeard(world, c.player, c.command);
  // THE BASTION's plates and rim, on the tick because a plate tears the instant it is out far
  // enough (`bastion-hand.ts`); and its lattice, THE SEAM's shield once a tick after them.
  for (const c of commands) bastionHeard(world, c.player, c.command);
  bastionGuarded(world);
}
