import type { FieldControlDef } from "./field-control-def.js";
import { ANTIPHON_CONTROLS } from "./field-controls-antiphon.js";
import { BALLOON_CONTROLS } from "./field-controls-balloon.js";
import { BATON_CONTROLS } from "./field-controls-baton.js";
import { CANDLE_CONTROLS } from "./field-controls-candle.js";
import { CURTAIN_CONTROLS } from "./field-controls-curtain.js";
import { DIASTOLE_CONTROLS } from "./field-controls-diastole.js";
import { FILAMENT_CONTROLS } from "./field-controls-filament.js";
import { FLEET_CONTROLS } from "./field-controls-fleet.js";
import { GAUGE_CONTROLS } from "./field-controls-gauge.js";
import { GORGE_CONTROLS } from "./field-controls-gorge.js";
import { GUM_CONTROLS } from "./field-controls-gum.js";
import { HIVE_CONTROLS } from "./field-controls-hive.js";
import { INSTAR_CONTROLS } from "./field-controls-instar.js";
import { LEAD_CONTROLS } from "./field-controls-lead.js";
import { MAZE_CONTROLS } from "./field-controls-maze.js";
import { MIRROR_CONTROLS } from "./field-controls-mirror.js";
import { ORRERY_CONTROLS } from "./field-controls-orrery.js";
import { PULSE_CONTROLS } from "./field-controls-pulse.js";
import { QUEEN_CONTROLS } from "./field-controls-queen.js";
import { SCUTTLE_CONTROLS } from "./field-controls-scuttle.js";
import { SINEW_CONTROLS } from "./field-controls-sinew.js";
import { STARE_CONTROLS } from "./field-controls-stare.js";
import { SURGE_CONTROLS } from "./field-controls-surge.js";
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
 * THE CANDLE's wick was the one that took the page to 251 lines
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
  // THE ORRERY's ring: a whole orbit rather than a circle on a body (`field-controls-orrery.ts`).
  ...ORRERY_CONTROLS,
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
  ...DIASTOLE_CONTROLS, // THE DIASTOLE's clamp, the second whose seat is not told.
  ...BATON_CONTROLS, // THE BATON's arm, the first whose seat the beat decides.
  ...MIRROR_CONTROLS, // THE MIRROR's lobes, two gestures on one target (`field-controls-mirror.ts`).
  ...GORGE_CONTROLS, // THE GORGE's pinch and pry, one target whose seat says the gesture.
  ...MAZE_CONTROLS, // THE MAZE's string and its heart, the brace and the tear (`field-controls-maze.ts`).
  ...FLEET_CONTROLS, // THE FLEET's plume, rake and wreck, on its chart (`field-controls-fleet.ts`).
  ...GAUGE_CONTROLS, // THE GAUGE's needle under a jam and its band under a bind (`field-controls-gauge.ts`).
  ...WARDEN_CONTROLS, // THE WARDEN's thumb and swipe, its second and third hands (`field-controls-warden.ts`).
  ...CANDLE_CONTROLS, // THE CANDLE's wick, the one handle taken hold of in the dark (`field-controls-candle.ts`).
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
];
