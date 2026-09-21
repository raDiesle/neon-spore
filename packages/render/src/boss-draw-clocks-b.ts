import type { World } from "@neon-spore/sim";
import { drawAntiphon } from "./antiphon-draw.js";
import type { Effects } from "./effects.js";
import { drawFilament } from "./filament-draw.js";
import { drawHive } from "./hive-draw.js";
import { drawHiveGrip } from "./hive-grip.js";
import { drawInstar } from "./instar-draw.js";
import type { Layout } from "./layout.js";
import { drawLead } from "./lead-draw.js";
import { drawLeadGrip } from "./lead-grip.js";
import { drawLedger } from "./ledger-draw.js";
import type { ViewState } from "./renderer.js";
import { drawScuttle } from "./scuttle-draw.js";
import { drawScuttleGrip } from "./scuttle-grip.js";
import { drawSinew } from "./sinew-draw.js";
import { drawStare } from "./stare-draw.js";
import { drawSurge } from "./surge-draw.js";

/**
 * **The clock bosses, drawn — page two**: the ones whose picture keeps
 * something that outlives a frame.
 *
 * Cut from `boss-draw-clocks.ts` on 17 September 2026, when THE HIVE's arm
 * had put that page at 239 lines, along the seam the bosses themselves have:
 * every one of these hangs over the top of the field with nothing of itself
 * on the grid, like the nine on the first page, and every one of them takes
 * one more thing — its own field of `effects.boss` (`effects-boss.ts`), the
 * whip, the jolt or the eruption the simulation made one tick of and the
 * picture lets settle over the frames after. The first page draws off the
 * world alone; this one is handed the transients too, and is the half that
 * grows, because every boss since THE SINEW has had one.
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
export const FX_KINDS = [
  "sinew",
  "ledger",
  "surge",
  "lead",
  "scuttle",
  "antiphon",
  "hive",
  "instar",
  "stare",
  "filament",
] as const;

export type FxBoss = Extract<Installed, { kind: (typeof FX_KINDS)[number] }>;

/** Whether this is one of them — a guard, for `isClockBoss`'s reason next door. */
export function isFxBoss(boss: Installed): boss is FxBoss {
  return (FX_KINDS as readonly string[]).includes(boss.kind);
}

export function drawFxBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: FxBoss,
  /** Whichever of `effects.boss` is this boss's (`effects-boss.ts`). */
  effects: Effects,
): void {
  const { world } = view;
  const { beat } = world;
  const { beatPhase, time } = view;

  // THE SINEW: a tendon from the top edge down to a mass, with a handle on
  // each side of the mass — one per seat — and the strain band across the
  // tendon read by seat. What outlives a frame — the snap's whip and its
  // flash — is `effects.boss.sinew` (`sinew-draw.ts`, `sinew-fx.ts`).
  if (boss.kind === "sinew") {
    drawSinew(ctx, l, world, boss, beat, beatPhase, time, effects.boss.sinew);
    return;
  }

  // THE LEDGER: a tall split body high in the field on one thick cord running
  // down into the ship's own plating, and the field is drawn *through* it the
  // way THE THROAT's gullet is. Both screens see the body, the seam and the
  // cord — and only the navigator's sees where the cord is rooted, which is
  // this boss's whole split (`ledger-draw.ts`, `view-role-clocks.ts`). What
  // outlives a frame — the whip back up the cord, the shock through the hull,
  // the flash of the tear — is `effects.boss.ledger` (`ledger-fx.ts`).
  if (boss.kind === "ledger") {
    drawLedger(ctx, l, world, boss, beat, beatPhase, time, effects.boss.ledger);
    return;
  }

  // THE SURGE: a ribbed bulb hung over the middle of the field with a seam
  // round its equator, a grip mark on each flank for the two thumbs that
  // share it, and the gauge along the seam read by seat — the notches on
  // the pilot's screen, the pressure on the navigator's. What outlives a
  // frame — the sink after a vent, the jolt of a burst, the jet — is
  // `effects.boss.surge` (`surge-draw.ts`, `surge-fx.ts`).
  if (boss.kind === "surge") {
    drawSurge(ctx, l, world, boss, beat, beatPhase, time, effects.boss.surge);
    return;
  }

  // THE LEAD: a ridge across the top of the field above row 0 with a stalk of
  // beads pacing along it, and the shots hanging in the air over it until they
  // are judged. Not a clock — a *place* — but it hangs over the field with
  // nothing of itself on the grid, like every arm here. The stalk stands at
  // its column on the navigator's screen and in the middle of the pilot's,
  // where it leans instead, which is the whole split. What outlives a frame —
  // the spring the lean rides, the whip, the bead that tumbles off — is
  // `effects.boss.lead` (`lead-draw.ts`, `lead-fx.ts`).
  if (boss.kind === "lead") {
    drawLead(ctx, l, world, boss, beat, beatPhase, time, effects.boss.lead);
    // The ring on the stalk's organ, over the body rather than inside it: the
    // one movement of this fight a thumb may reach into, and the navigator's
    // alone (`lead-grip.ts`). It draws nothing outside the still.
    drawLeadGrip(ctx, l, world.cfg, boss, beat, beatPhase, time);
    return;
  }

  // THE SCUTTLE: a slab of a frame over the top of the field plated with its
  // parts, the loose ones sliding out of their sockets on threads over the
  // cadence. The sockets — plated or open, the count — are on the pilot's
  // screen; the live part in its colour and the lock on the column of the
  // next throw are on the navigator's, which is the whole split. What
  // outlives a frame — the jolt of a throw, the plate that tumbles off on a
  // strike — is `effects.boss.scuttle` (`scuttle-draw.ts`, `scuttle-fx.ts`).
  if (boss.kind === "scuttle") {
    drawScuttle(ctx, l, world, boss, beat, beatPhase, time, effects.boss.scuttle);
    // The rings on the hanging parts, the pilot's alone: he is the seat shown
    // every one of them uncoloured, so a ring on each says which may still be
    // carried and nothing about which is live (`scuttle-grip.ts`).
    drawScuttleGrip(ctx, l, world.cfg, boss, beat, beatPhase, time);
    return;
  }

  // THE ANTIPHON: a smooth body over the top of the field, pitted with the
  // shapes already named, the organ it has grown under its middle on the
  // pilot's screen and the whole rail under its columns on the navigator's,
  // which is the whole split. What outlives a frame — the eruption of every
  // pit — is `effects.boss.antiphon` (`antiphon-draw.ts`, `antiphon-fx.ts`).
  if (boss.kind === "antiphon") {
    drawAntiphon(ctx, l, world, boss, beat, beatPhase, time, effects.boss.antiphon);
    return;
  }

  // THE HIVE: a waxen mass over the top of the field with a site in every
  // lobe of its underside. The breach's colour is on the pilot's screen, the
  // swell of the next site on the navigator's. What outlives a frame — the
  // clench of a wrong colour, the jolt of a seal — is `effects.boss.hive`
  // (`hive-draw.ts`, `hive-fx.ts`).
  if (boss.kind === "hive") {
    drawHive(ctx, l, world, boss, beat, beatPhase, time, effects.boss.hive);
    // The ring after the body, over the wax it is on: the clenched underside
    // on his screen, a swelling lobe on hers (`hive-grip.ts`).
    drawHiveGrip(ctx, l, world.cfg, boss, beat, beatPhase, time);
    return;
  }

  // THE INSTAR: a larva hung head-down over the field on a chain of plates,
  // morphing pose by pose into the thing the script's next marks undo. Both
  // screens see the same body; the split is whose thumb each mark wants
  // (`view-role-clocks-b.ts`). What outlives a frame — the jolt of a landing,
  // the flinch at a wrong thumb, the lash of a strike — is
  // `effects.boss.instar` (`instar-draw.ts`, `instar-fx.ts`).
  if (boss.kind === "instar") {
    drawInstar(ctx, l, world, boss, beat, beatPhase, time, effects.boss.instar);
    return;
  }

  // THE STARE: a cowled eye over the middle of the top edge, seen edge-on
  // while it looks elsewhere and coming round to square over the seven beats
  // of its tell, with the count under it. The seat it has chosen is named on
  // the other seat's screen alone, and the gaze falls on the watched seat's
  // field once the look lands (`view-role-clocks-b.ts`). What outlives a
  // frame — the flash of a press it caught — is `effects.boss.stare`
  // (`stare-draw.ts`, `stare-fx.ts`).
  if (boss.kind === "stare") {
    drawStare(ctx, l, world, boss, beat, beatPhase, time, effects.boss.stare);
    return;
  }

  // THE FILAMENT: a bundle over the top of the field, one filament of it
  // hanging down the field as a line of tiles lit from the free end as far
  // as the pilot's thumb has drawn it. The path ahead is on his screen, the
  // lit run behind on hers, and the gap on neither (`view-role-clocks-b.ts`).
  // What outlives a frame — the whip of a snap, the dark of a gap, the jolt
  // of a pull — is `effects.boss.filament` (`filament-draw.ts`, `filament-fx.ts`).
  drawFilament(ctx, l, world, boss, beat, beatPhase, time, effects.boss.filament);
}
