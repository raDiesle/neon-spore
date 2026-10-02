import { burgeeHeard } from "./burgee-hand.js";
import { capstanHeard } from "./capstan-hand.js";
import { cystGuarded } from "./cyst-guard.js";
import { cystHeard } from "./cyst-hand.js";
import { davitHeard } from "./davit-hand.js";
import { flueHeard } from "./flue-hand.js";
import { gallHeard } from "./gall-hand.js";
import { governorHeard } from "./governor-hand.js";
import { governorTurned } from "./governor-turn.js";
import { grindstoneHeard } from "./grindstone-hand.js";
import { halterHeard } from "./halter-hand.js";
import { lampreyHeard } from "./lamprey-hand.js";
import { mimicHeard } from "./mimic-hand.js";
import { oculusGuarded } from "./oculus-guard.js";
import { oculusHeard } from "./oculus-hand.js";
import { plumbHeard } from "./plumb-hand.js";
import { rimeGuarded } from "./rime-guard.js";
import { rimeHeard } from "./rime-hand.js";
import { seamGuarded } from "./seam-guard.js";
import { slingHeard } from "./sling-hand.js";
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
  // thumb lifts; the beats held are counted on the beat (`oculus-hand.ts`).
  for (const c of commands) oculusHeard(world, c.player, c.command);
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
  // THE GRINDSTONE's passes and clamps, the same: a flat ground clean and a
  // jaw pad lifting are both the instant (`grindstone-hand.ts`).
  for (const c of commands) grindstoneHeard(world, c.player, c.command);
  // THE CYST's taps and pinches, the same: a tap is an edge and a pinch
  // widening past shut is the instant (`cyst-hand.ts`).
  for (const c of commands) cystHeard(world, c.player, c.command);
  // Its spore, THE TRIVET's needle once a tick after the commands (`cyst-guard.ts`).
  cystGuarded(world);
  // THE DAVIT's steers and draws, the same: a steer leaving its target and a
  // draw lifting are both the instant (`davit-hand.ts`).
  for (const c of commands) davitHeard(world, c.player, c.command);
  // THE HALTER hears every command there is: any one at all is a seat's rest
  // gone, and a grip lifting is the pair coming apart (`halter-hand.ts`).
  for (const c of commands) halterHeard(world, c.player, c.command);
  // THE CAPSTAN's leans and rubs: the cradle rocking and a band cracking are
  // both the instant (`capstan-hand.ts`).
  for (const c of commands) capstanHeard(world, c.player, c.command);
  // THE GALL's pinch: coming shut and widening back are the instant (`gall-hand.ts`).
  for (const c of commands) gallHeard(world, c.player, c.command);
  // THE BURGEE's tap and draw: a freeze landing and a loose judged are the instant (`burgee-hand.ts`).
  for (const c of commands) burgeeHeard(world, c.player, c.command);
  // THE FLUE's rest and tap: every command heard, a lapse costing the taps landed (`flue-hand.ts`).
  for (const c of commands) flueHeard(world, c.player, c.command);
  // THE GOVERNOR's chords and tap, and its needle turned after them (`governor-hand.ts`, `governor-turn.ts`).
  for (const c of commands) governorHeard(world, c.player, c.command);
  governorTurned(world);
  // THE LAMPREY's jaw and teeth, a crack or a snap the instant (`lamprey-hand.ts`).
  for (const c of commands) lampreyHeard(world, c.player, c.command);
  // THE MIMIC's glyph: a sign drawn peels or is mimicked the instant it lands (`mimic-hand.ts`).
  for (const c of commands) mimicHeard(world, c.player, c.command);
}
