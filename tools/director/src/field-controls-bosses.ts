import type { FieldControlDef } from "./field-control-def.js";
import { ANTIPHON_CONTROLS } from "./field-controls-antiphon.js";
import { BALLOON_CONTROLS } from "./field-controls-balloon.js";
import { BATON_CONTROLS } from "./field-controls-baton.js";
import { CURTAIN_CONTROLS } from "./field-controls-curtain.js";
import { FILAMENT_CONTROLS } from "./field-controls-filament.js";
import { FLEET_CONTROLS } from "./field-controls-fleet.js";
import { GAUGE_CONTROLS } from "./field-controls-gauge.js";
import { GIMBAL_CONTROLS } from "./field-controls-gimbal.js";
import { GORGE_CONTROLS } from "./field-controls-gorge.js";
import { GUM_CONTROLS } from "./field-controls-gum.js";
import { HASP_CONTROLS } from "./field-controls-hasp.js";
import { HIVE_CONTROLS } from "./field-controls-hive.js";
import { INSTAR_CONTROLS } from "./field-controls-instar.js";
import { KEEL_CONTROLS } from "./field-controls-keel.js";
import { LEAD_CONTROLS } from "./field-controls-lead.js";
import { LEDGER_CONTROLS } from "./field-controls-ledger.js";
import { MANTLE_CONTROLS } from "./field-controls-mantle.js";
import { MAZE_CONTROLS } from "./field-controls-maze.js";
import { MIRROR_CONTROLS } from "./field-controls-mirror.js";
import { OCULUS_CONTROLS } from "./field-controls-oculus.js";
import { PINBALL_CONTROLS } from "./field-controls-pinball.js";
import { PULSE_CONTROLS } from "./field-controls-pulse.js";
import { QUEEN_CONTROLS } from "./field-controls-queen.js";
import { RATCHET_CONTROLS } from "./field-controls-ratchet.js";
import { SCOUT_CONTROLS } from "./field-controls-scout.js";
import { SCUTTLE_CONTROLS } from "./field-controls-scuttle.js";
import { SINEW_CONTROLS } from "./field-controls-sinew.js";
import { SNAKE_CONTROLS } from "./field-controls-snake.js";
import { SPOOL_CONTROLS } from "./field-controls-spool.js";
import { STARE_CONTROLS } from "./field-controls-stare.js";
import { SURGE_CONTROLS } from "./field-controls-surge.js";
import { TASTER_CONTROLS } from "./field-controls-taster.js";
import { THROAT_CONTROLS } from "./field-controls-throat.js";
import { UNDERTOW_CONTROLS } from "./field-controls-undertow.js";
import { VANE_CONTROLS } from "./field-controls-vane.js";
import { WARDEN_CONTROLS } from "./field-controls-warden.js";
import { WELL_CONTROLS } from "./field-controls-well.js";

/**
 * **Every boss's own rows** on the ON THE FIELD tab, in the order they were
 * built.
 *
 * The fourth cut `field-controls-page.ts` has taken, and the first along this
 * seam: the three before it moved a *kind of thing* out — the list of controls
 * set aside (`tried-controls-page.ts`), what a row is (`field-control-def.ts`),
 * how a row is drawn (`field-controls-rows.ts`). This one moves a *half of the
 * list*, and the half is the one that grows: the page keeps the handles the
 * game has always had — the grip, the push, the cannon, the maw, the shield,
 * the muzzle, the warden's tether, the lid's cord, the choir's two arrows and
 * the guide's hold — and every boss that arrives brings its row here instead.
 * One boss's handle was the one that took the page to 251 lines
 * (`packages/sim/test/limits.test.ts` is where that is a failure rather than a
 * preference).
 *
 * Spread into `FIELD_CONTROLS` in one place, between the choir's arrows and
 * THE GUIDE'S HOLD, so the tab's order is unchanged by the move.
 */
export const BOSS_FIELD_CONTROLS: readonly FieldControlDef[] = [
  // THE BALLOON's two (`field-controls-balloon.ts`), after the pilot's four handles.
  ...BALLOON_CONTROLS,
  ...GUM_CONTROLS,
  // THE SINEW's two: a pair adding into one sum, not a side each (`field-controls-sinew.ts`).
  ...SINEW_CONTROLS,
  ...SURGE_CONTROLS, // THE SURGE's one, the first taken by both seats.
  ...ANTIPHON_CONTROLS, // THE ANTIPHON's one, the first on one screen only.
  // THE INSTAR's marks, one target that is six gestures (`field-controls-instar.ts`).
  ...INSTAR_CONTROLS,
  // THE FILAMENT's line, the first that is a trace; THE BULB QUEEN's marks, whose seat is not told.
  ...FILAMENT_CONTROLS,
  ...STARE_CONTROLS, // THE STARE's lid, the first on a boss that is not its body.
  ...QUEEN_CONTROLS,
  ...BATON_CONTROLS, // THE BATON's arm, the first whose seat the beat decides.
  ...MIRROR_CONTROLS, // THE MIRROR's lobes, two gestures on one target (`field-controls-mirror.ts`).
  ...GORGE_CONTROLS, // THE GORGE's pinch and pry, one target whose seat says the gesture.
  ...MAZE_CONTROLS, // THE MAZE's string and its heart, the brace and the tear (`field-controls-maze.ts`).
  ...FLEET_CONTROLS, // THE FLEET's plume, rake and wreck, on its chart (`field-controls-fleet.ts`).
  ...GAUGE_CONTROLS, // THE GAUGE's needle under a jam and its band under a bind (`field-controls-gauge.ts`).
  ...WARDEN_CONTROLS, // THE WARDEN's thumb and swipe, its second and third hands (`field-controls-warden.ts`).
  // THE CURTAIN's hem, the one handle that exists because the other was jammed shut
  // (`field-controls-curtain.ts`).
  ...CURTAIN_CONTROLS,
  // THE LEAD's stalk and THE SCUTTLE's hanging part, the first two rows here for
  // bosses that shipped as fixtures with no handle at all: one buys the pair time,
  // the other a place (`field-controls-lead.ts`, `field-controls-scuttle.ts`).
  ...LEAD_CONTROLS,
  ...SCUTTLE_CONTROLS,
  // THE WELL's seam and THE HIVE's underside, one handle each read two ways by the
  // state rather than by the thumb — and the hive's two ways are a seat each
  // (`field-controls-well.ts`, `field-controls-hive.ts`).
  ...WELL_CONTROLS,
  ...HIVE_CONTROLS,
  // THE PULSE's bar, the first row here for an **interlude** and the only
  // control in the game that is worth nothing from one seat and everything
  // from two (`field-controls-pulse.ts`).
  ...PULSE_CONTROLS,
  // THE VANE's arm and housing, the first pair here that have to be used in
  // order — and the first that are the only way a fight can be finished at all
  // (`field-controls-vane.ts`).
  ...VANE_CONTROLS,
  // THE THROAT's ring and tube, the first pair the fight **hands out as it
  // loses**: neither exists until the pair has choked a muscle
  // (`field-controls-throat.ts`).
  ...THROAT_CONTROLS,
  // SNAKE's jaws and tail, the pair the round hands out as the pair **wins** —
  // and the first two here drawn on a thing that moves between beats
  // (`field-controls-snake.ts`).
  ...SNAKE_CONTROLS,
  // THE UNDERTOW's pin and free, the first pair here **one seat owns whole** —
  // and the free is the only control in the game that hands the other player
  // his own seat back (`field-controls-undertow.ts`).
  ...UNDERTOW_CONTROLS,
  // THE SCOUT's line and prime, the only pair in the game drawn in the same
  // place on two screens — the ship is both handles, and the round's split is
  // that neither seat is ever shown both (`field-controls-scout.ts`).
  ...SCOUT_CONTROLS,
  // PINBALL's plunger and shove, the only pair here that cannot both be on a
  // screen: one is offered through `power` and the other through `flight`, so
  // the round hands out one handle a shot (`field-controls-pinball.ts`).
  ...PINBALL_CONTROLS,
  // THE TASTER's pin, wipe and pry, the first set here that is **one hand per
  // movement**: no two of the three are ever offered together, so each gets
  // the whole crest to stand on (`field-controls-taster.ts`).
  ...TASTER_CONTROLS,
  // THE LEDGER's foot and plug, the first pair here that share **one circle**:
  // the foot is offered while the cord is still rooting and the plug from
  // `paying` on, so they are one hand on the root of the cord at two times
  // (`field-controls-ledger.ts`).
  ...LEDGER_CONTROLS,
  // THE GIMBAL's two rings, the only pair here that are **one handle gripped
  // from its two faces**: one target a seat, offered together, and the same
  // turn on them is two different turns (`field-controls-gimbal.ts`).
  ...GIMBAL_CONTROLS,
  // THE SPOOL's brake, the only row here that is **one control for one seat**
  // with no partner at all: the other half of that fight is a zone the
  // navigator reads and a word she says (`field-controls-spool.ts`).
  ...SPOOL_CONTROLS,
  // THE HASP's latch and wheel, the only pair here where **one of the two does
  // nothing at all**: his latch moves no part of the boss and her wheel only
  // answers while it is down (`field-controls-hasp.ts`).
  ...HASP_CONTROLS,
  // THE RATCHET's catch and pawl, the only pair here where **one is a hold
  // and the other a press judged by it**, once, on the tick it lands
  // (`field-controls-ratchet.ts`).
  ...RATCHET_CONTROLS,
  // THE MANTLE's two knobs and its core, the only boss here whose **both
  // screens draw both handles** (`field-controls-mantle.ts`).
  ...MANTLE_CONTROLS,
  // THE KEEL's lit joint, whose seat moves with where it sits
  // (`field-controls-keel.ts`).
  ...KEEL_CONTROLS,
  // THE OCULUS's two leaf holds, a half of the lens a seat by geometry
  // (`field-controls-oculus.ts`).
  ...OCULUS_CONTROLS,
];
