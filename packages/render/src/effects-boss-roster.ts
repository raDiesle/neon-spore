import { AntiphonFx } from "./antiphon-fx.js";
import { BossBlows } from "./boss-blows.js";
import { BossStrikeFx } from "./boss-strike-fx.js";
import { CurtainFx } from "./curtain-fx.js";
import { FilamentFx } from "./filament-fx.js";
import { FleetFx } from "./fleet-fx.js";
import { FleetGripFx } from "./fleet-grip-fx.js";
import { GimbalFx } from "./gimbal-fx.js";
import { GorgeFx } from "./gorge-fx.js";
import { HaspFx } from "./hasp-fx.js";
import { HiveFx } from "./hive-fx.js";
import { InstarFx } from "./instar-fx.js";
import { KeelFx } from "./keel-fx.js";
import { LeadFx } from "./lead-fx.js";
import { LedgerFx } from "./ledger-fx.js";
import { MantleFx } from "./mantle-fx.js";
import { MazeGripFx } from "./maze-grip-fx.js";
import { OculusFx } from "./oculus-fx.js";
import { RatchetFx } from "./ratchet-fx.js";
import { RepriseFx } from "./reprise-fx.js";
import { ScuttleFx } from "./scuttle-fx.js";
import { MirrorFx } from "./simon-fx.js";
import { SinewFx } from "./sinew-fx.js";
import { SpoolFx } from "./spool-fx.js";
import { StareFx } from "./stare-fx.js";
import { SurgeFx } from "./surge-fx.js";
import { TasterFx } from "./taster-fx.js";
import { UndertowFx } from "./undertow-fx.js";
import { WardenFx } from "./warden-fx.js";

/**
 * **The roster**: one field per boss that keeps something between frames,
 * each with the paragraph saying what that something is and why it is public.
 *
 * Cut off `effects-boss.ts` on 22 September 2026, when that page stood at 245
 * lines and THE GIMBAL still had a transient to add. The seam is the one the
 * page's own header implies: next door is **four verbs** — ingest, update,
 * draw, clear — which are four lists of one line each and grow by one line a
 * boss, and here is the roster, which grows by a field *and a paragraph*.
 * That is the half that grows fastest, and it is the half nobody reads top to
 * bottom.
 *
 * A base class rather than a second object, so every `effects.boss.<name>`
 * already written goes on resolving unchanged — twenty-one reads across
 * render/ and the tests, none of which had to move — and so `restart.test.ts`
 * still compares one `Effects` to another field by field.
 *
 * The reasoning for the fields themselves is on each field. What the whole
 * arrangement is for is still stated next door, over `BossTransients`.
 */
export class BossRoster {
  /**
   * THE MIRROR's own transients. Public: the boss is drawn as a whole ship
   * rather than as particles, and `canvas2d` reads `armed` and `intake` off
   * it to build the mirror's hull mood.
   */
  readonly mirror = new MirrorFx();
  /** THE WARDEN's one transient: the line whipping down after it is torn.
   * Public for the mirror's reason — the boss is drawn as a whole body by
   * `boss-draw.ts`, not as a handful of particles here. */
  readonly warden = new WardenFx();
  /** THE FLEET's salvoes between the muzzle and the square. Public for the
   * mirror's reason, and asked questions as well as drawn: the marks and the
   * scars check with it before calling a square spent (`fleet-fx.ts`). */
  readonly fleet = new FleetFx();
  /** THE FLEET's wound: the ring thrown off the holed square by each of the
   * five moments the flood and the wreck are made of, drawn by the boss pass
   * on the chart the wound stands on (`fleet-grip-fx.ts`, `boss-draw.ts`). */
  readonly fleetGrip = new FleetGripFx();
  /**
   * THE REPRISE's swallow: the moment the count of owed bodies went down, which
   * is the only sign either seat gets that an unseen body has entered the field.
   * Driven from the boss pass rather than fed by an event — an unseen arrival
   * deliberately pushes none — and kept here because it outlives its frame
   * (`reprise-fx.ts`).
   */
  readonly reprise = new RepriseFx();
  /** THE GORGE's beads leaving at the end, and the bursts its receipts throw
   * on the way there — read above the loop, the way the mirror's are
   * (`gorge-fx.ts`). */
  readonly gorge = new GorgeFx();
  /** THE MAZE's thumb landing on its heart or leaving it, thrown off the
   * heart by the boss pass (`maze-grip-fx.ts`, `maze-draw.ts`). */
  readonly maze = new MazeGripFx();
  /** THE CURTAIN's sheet coming down once torn, and its receipts' bursts
   * (`curtain-fx.ts`). */
  readonly curtain = new CurtainFx();
  /** THE TASTER's blades tumbling off the crest, the shiver down the fan as it
   * re-edges, and the colour each blade wore when it went (`taster-fx.ts`). */
  readonly taster = new TasterFx();
  /** THE SINEW's snap: the whip it leaves in the mass, the flash over the
   * field and the shock down the plating, and its receipts' bursts — asked
   * for the whip by the drawer (`sinew-fx.ts`, `sinew-draw.ts`). */
  readonly sinew = new SinewFx();
  /** THE LEDGER's three moments: the whip a warded return throws back up the
   * cord, the shock the ship takes from the rooting and from a return nobody
   * answered, and the flash of the tear — asked for the whip by the drawer
   * (`ledger-fx.ts`, `ledger-draw.ts`). */
  readonly ledger = new LedgerFx();
  /** THE SURGE's vent and burst: the row the bulb sinks through, the jolt
   * through the body, the jet out of the seam, and its receipts' bursts —
   * asked for the sink and the jolt by the drawer (`surge-fx.ts`,
   * `surge-draw.ts`). */
  readonly surge = new SurgeFx();
  /** THE LEAD's spring, whip and tumbling bead, and its receipts' bursts —
   * asked for the angle by the drawer every frame, and told where the stalk
   * stood (`lead-fx.ts`, `lead-draw.ts`). */
  readonly lead = new LeadFx();
  /** THE SCUTTLE's jolt and tumbling plate, and its receipts' bursts — asked
   * for the jolt by the drawer every frame, and told where the live part
   * hung (`scuttle-fx.ts`, `scuttle-draw.ts`). */
  readonly scuttle = new ScuttleFx();
  /** THE ANTIPHON's eruption, and its receipts' bursts — told the pits by
   * the drawer every frame, so what comes out of each is the shape that
   * made it (`antiphon-fx.ts`, `antiphon-draw.ts`). */
  readonly antiphon = new AntiphonFx();
  /** THE HIVE's clench and jolt, and its receipts' bursts — asked for both by
   * the drawer every frame, the bursts thrown at the underside over the
   * event's column, an opening in its colour only where the colour is drawn
   * (`hive-fx.ts`, `hive-draw.ts`). */
  readonly hive = new HiveFx();
  /** THE INSTAR's jolt, flinch and lash, and its receipts' bursts — told the
   * marks' places by the drawer every frame, so a burst lands on the part
   * the event names (`instar-fx.ts`, `instar-draw.ts`). */
  readonly instar = new InstarFx();
  /** THE STARE's one transient: the flash of a press the eye caught, on the
   * caught seat's panel over everything, drawn last of the frame by
   * `canvas2d.ts` rather than here — a flash on a button stands on the button
   * (`stare-fx.ts`). */
  readonly stare = new StareFx();
  /** THE UNDERTOW's one transient: the plate closing under a cannon slid off
   * in time, drawn on the finished ship where the bow itself is
   * (`undertow-fx.ts`, `frame-on-ship.ts`). */
  readonly undertow = new UndertowFx();
  /** THE FILAMENT's whip, dark and jolt, and its receipts' bursts — told the
   * head and the free end by the drawer every frame, so a snap bursts where
   * the line was (`filament-fx.ts`, `filament-draw.ts`). */
  readonly filament = new FilamentFx();
  /** THE GIMBAL's kick, shake and glare, and its receipts' bursts — all read
   * off the cradle's own centre, which is arithmetic over the layout rather
   * than a place the drawer has to report (`gimbal-fx.ts`, `gimbal-shape.ts`). */
  readonly gimbal = new GimbalFx();
  /** THE SPOOL's shudder, jolt and glare, and its receipts' bursts — a rib's
   * thrown where that rib stood on the casing (`spool-fx.ts`, `spool-shape.ts`). */
  readonly spool = new SpoolFx();
  /** THE HASP's dim, flare, jolt and hull shock, and its receipts' bursts —
   * each thrown only on the screens shown the half it happened to, because
   * this boss's receipts are split between the seats like its picture
   * (`hasp-fx.ts`, `view-role-clocks-c.ts`). */
  readonly hasp = new HaspFx();
  /** THE RATCHET's jolt, click and hull shock, and its receipts' bursts — a
   * set and a let-go on the catch's screens alone, a burnt tooth nowhere
   * (`ratchet-fx.ts`, `view-role-clocks-c.ts`). */
  readonly ratchet = new RatchetFx();
  /** THE MANTLE's kick, flare and hull shock, and its receipts' bursts —
   * thrown the same on both screens, like the rest of it (`mantle-fx.ts`). */
  readonly mantle = new MantleFx();
  /** THE KEEL's jolt, the snap on each seam as it locks and the hull shock,
   * and its receipts' bursts — thrown the same on both screens, and told the
   * socket's colour by the drawer (`keel-fx.ts`, `keel-draw.ts`). */
  readonly keel = new KeelFx();
  /** THE OCULUS's thud, the core's flash and the shatter's, and the hull
   * shock, and its receipts' bursts — thrown the same on both screens, and
   * told the core's colour by the drawer (`oculus-fx.ts`, `oculus-draw.ts`). */
  readonly oculus = new OculusFx();
  /** The blow for the bosses with no fx class of their own — THE THROAT,
   * THE VANE, THE CAIRN and THE BATON — asked for by each drawer
   * (`boss-blows.ts`). */
  readonly blows = new BossBlows();
  /** A boss's own blow at the hull when a window ran out, fed by
   * `ingestBreach` and drawn over the ship (`boss-strike-fx.ts`). */
  readonly strike = new BossStrikeFx();
}
