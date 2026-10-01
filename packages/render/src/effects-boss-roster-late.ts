import { BurgeeFx } from "./burgee-fx.js";
import { CapstanFx } from "./capstan-fx.js";
import { CystFx } from "./cyst-fx.js";
import { DavitVerdicts } from "./davit-verdicts.js";
import { RoundMarks } from "./effects-round-marks.js";
import { FlueFx } from "./flue-fx.js";
import { GallFx } from "./gall-fx.js";
import { GovernorFx } from "./governor-fx.js";
import { GrindstoneFx } from "./grindstone-fx.js";
import { HalterVerdicts } from "./halter-verdicts.js";
import { PlumbFx } from "./plumb-fx.js";
import { SeamFx } from "./seam-fx.js";
import { SlingFx } from "./sling-fx.js";
import { TrivetFx } from "./trivet-fx.js";

/**
 * **The roster's late pairs**: the fields of the bosses `boss-draw-clocks-d.ts`
 * draws, from THE SLING on — cut off `effects-boss-roster.ts` on 29 September
 * 2026, when that page stood at 249 lines and THE GOVERNOR had a field to add
 * — and THE SEAM's, drawn a page earlier, whose fx came with its hands after.
 *
 * The seam is the drawer's own page: every boss here is drawn next door to
 * the others, and the next pair appends here. A base class of the roster for
 * the roster's own reason — every `effects.boss.flue` already written goes on
 * resolving, and `restart.test.ts` still compares one `Effects` to another
 * field by field.
 */
export class LateRoster extends RoundMarks {
  /** THE SLING's painted draw over a cord loosed true (`sling-fx.ts`). */
  readonly sling = new SlingFx();
  /** THE DAVIT's marks' verdicts on a touch — it throws nothing else that
   * outlives a frame yet, so it has no fx of its own (`davit-verdicts.ts`). */
  readonly davit = new DavitVerdicts();
  /** THE HALTER's marks' verdicts on a touch — nothing else of it outlives a
   * frame, so it has no fx of its own (`halter-verdicts.ts`). */
  readonly halter = new HalterVerdicts();
  /** THE TRIVET's thud, the clamps' flare, the hub's flash and the collapse's,
   * the hull shock, and its receipts' bursts — thrown the same on both
   * screens, and told the hub's colour by the drawer (`trivet-fx.ts`,
   * `trivet-draw.ts`). */
  readonly trivet = new TrivetFx();
  /** THE PLUMB's settle ringing a glass, a drift's jolt, the core's hit and
   * the free swing's release, and its receipts' bursts — thrown the same on
   * both screens, and told the core's colour by the drawer (`plumb-fx.ts`,
   * `plumb-draw.ts`). */
  readonly plumb = new PlumbFx();
  /** THE CYST's thud, the sprung flanks, the core's flash and the split's,
   * and its receipts' bursts — thrown the same on both screens, and told the
   * core's colour by the drawer (`cyst-fx.ts`, `cyst-draw.ts`). */
  readonly cyst = new CystFx();
  /** THE GRINDSTONE's grit, a flat's clean flash, the caliper's flare and
   * thud, the axle's flash and the snap free's, the hull shock, and its
   * receipts' bursts — thrown the same on both screens, and told the axle's
   * colour by the drawer (`grindstone-fx.ts`, `grindstone-draw.ts`). */
  readonly grindstone = new GrindstoneFx();
  /** THE CAPSTAN's scrub and bright ring off a band, the thud of a window
   * let run, the core's flash and the spent drum's, and its receipts' bursts
   * — thrown the same on both screens, and told the core's colour by the
   * drawer (`capstan-fx.ts`, `capstan-draw.ts`). */
  readonly capstan = new CapstanFx();
  /** THE GALL's flare, shudder and bulge on the nodule, the ghost a close
   * leaves on the point it jumped off, the seam's lips tearing, the root's
   * flash, and its receipts' bursts — thrown the same on both screens, and
   * told the root's colour by the drawer (`gall-fx.ts`, `gall-draw.ts`). */
  readonly gall = new GallFx();
  /** THE BURGEE's flag where it is drawn, eased toward the simulation's
   * place so a freeze slows it rather than snapping it, and the limp
   * flutter a swipe that caught nothing leaves (`burgee-fx.ts`). */
  readonly burgee = new BurgeeFx();
  /** THE FLUE's tick through the slot for every tap, a vent notch's flare,
   * the damper's thud, the core's flash, the hull shock, and its receipts'
   * bursts — thrown the same on both screens, and told the core's colour by
   * the drawer (`flue-fx.ts`, `flue-draw.ts`). */
  readonly flue = new FlueFx();
  /** THE GOVERNOR's flash on the rim for every tap, a skid's scrape, the
   * hub's flash, the hull shock, its receipts' bursts and its marks' verdicts
   * on a touch — thrown the same on both screens, and told the needle and the
   * hub's colour by the drawer (`governor-fx.ts`, `governor-draw.ts`). */
  readonly governor = new GovernorFx();
  /** THE SEAM's click down the plating as a point seals, the grit's spark
   * on the shield, the reseal's flash, the split's shudder, its receipts'
   * bursts and its marks' verdicts on a touch — thrown the same on both
   * screens, and told where the crack's mark and the rock stand by the
   * drawer (`seam-fx.ts`, `seam-draw.ts`). */
  readonly seam = new SeamFx();
}
