import type { BalloonEvent } from "./events-balloon.js";
import type { BeatboxEvent } from "./events-beatbox.js";
import type { BlisterEvent } from "./events-blister.js";
import type { CaromEvent } from "./events-carom.js";
import type { ChoirEvent } from "./events-choir.js";
import type { ClingEvent } from "./events-cling.js";
import type { CoilEvent } from "./events-coil.js";
import type { CrawlerEvent } from "./events-crawler.js";
import type { CrystalEvent } from "./events-crystal.js";
import type { FenceEvent } from "./events-fence.js";
import type { GumEvent } from "./events-gum.js";
import type { MagnetEvent } from "./events-magnet.js";
import type { PushEvent } from "./events-push.js";
import type { StrandEvent } from "./events-strand.js";
import type { VolleyEvent } from "./events-volley.js";

/**
 * **Every creature whose events have a file of their own**, as one arm of
 * `CreatureEvent` (`events-creature.ts`).
 *
 * Each of these groups was cut out of that file when it was at its 250-line
 * limit, and each still cost it an import and a line of the union, until THE
 * BLISTER's took it to 249 and two neighbouring comments had to be shortened
 * to make room. The list is here now, so the next creature with an event of
 * its own adds its import and its arm in a file with room for both, and
 * `events-creature.ts` keeps the events that are still written out in it.
 *
 * Nothing switches over this union on its own: every consumer still switches
 * over the whole of `SimEvent`, so an event added here and handled nowhere is
 * a compile error, as it was.
 */
export type CreatureGroupEvent =
  // THE CAROM's four — the wall, the crack, the body thrown clear and the
  // canopy — are `events-carom.ts` next door, cut out when the fourth took
  // `events-creature.ts` over its limit. One arrival taken apart, rather than four
  // incidents that happen to share a creature.
  | CaromEvent
  // And THE CRYSTAL's, THE GUM's and the clingers', on the same terms
  // (`events-crystal.ts`, `events-gum.ts`, `events-cling.ts`).
  | CrystalEvent
  | GumEvent
  | ClingEvent
  // And THE VOLLEY's two — the ward that sends it back and the shell bursting
  // over the body — are `events-volley.ts`, on exactly the same terms.
  | VolleyEvent
  | PushEvent
  // And THE CRAWLER's two — the beam that takes a stripped worm and the burrow
  // when one gets in — are `events-crawler.ts`, on the same terms. Its two
  // *answers* are a plain `destroy` and a plain `deflect`.
  | CrawlerEvent
  // And THE FENCE's two — the wire going over the ship and a bolt cutting it
  // open — are `events-fence.ts`, on the same terms as the three above.
  | FenceEvent
  // And THE MAGNET's two — the plate turning a bolt away and the arch coming
  // apart when one got past it — are `events-magnet.ts`, on the same terms.
  | MagnetEvent
  // And THE COIL's two, on the same terms as the six above (`events-coil.ts`).
  | CoilEvent
  // And THE CHOIR's three, on the same terms and cut out for the same reason
  // (`events-choir.ts`) — the first group in this list that is about the
  // pilot's hands rather than about something meeting a body.
  | ChoirEvent
  // And THE BEATBOX's two, on the same terms as the six above
  // (`events-beatbox.ts`) — the second group in this list that is about a
  // player's hands rather than about something meeting a body, and the first
  // whose every event deliberately leaves out the one number the creature is
  // *about*, because both phones play a cue and only one seat may know it.
  | BeatboxEvent
  // And THE BALLOON's three, on the same terms again (`events-balloon.ts`) —
  // the three ways one body stops being what it was, which is neither a
  // gesture taken apart nor an arrival taken apart.
  | BalloonEvent
  | StrandEvent
  // And THE BLISTER's one, a blow that counted (`events-blister.ts`).
  | BlisterEvent;
