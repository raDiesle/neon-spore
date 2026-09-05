import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { ChuteCutFx } from "./chute-cut.js";
import { ClaspBreakFx } from "./clasp-break.js";
import { ClaspStrikeFx } from "./clasp-strike.js";
import { GhostReleaseFx } from "./ghost-release.js";
import type { Layout } from "./layout.js";
import { LureVanishFx } from "./lure-vanish.js";
import { RecoilCageBreakFx } from "./recoil-cage-break.js";
import { RecoilVentFx } from "./recoil-vent.js";
import { RindShedFx } from "./rind-shed.js";
import { VeilTearFx } from "./veil-tear.js";

/**
 * The transients that belong to **one body** and outlive the moment that made
 * them by less than a beat: a lure folding to a point, the ward's bolts
 * reaching up a column, a clasp's shield blinking out, a veil's cloud tearing
 * open on the body inside it, a ghost letting go and climbing out of the top
 * of the field, a layer coming off a rind, a recoil's cage failing, a chute's
 * canopy cut off the body it was carrying.
 *
 * Split out of `effects.ts` when the second one arrived and that file went
 * over its 250-line limit — the same reason `effects-spark.ts` and
 * `effects-breach.ts` sit beside it. The seam is not merely a place to cut:
 * everything else `Effects` holds is either a property of the ship (the maw's
 * echo, the guard's banner), a property of a boss, or a particle system shared
 * by the whole field. These are none of those. Each is a short picture of one
 * creature's last moment, spawned from one event, drawn under the hull, and
 * dropped on a restart — four verbs they agree on completely, which is what
 * makes one object out of six.
 *
 * **Two draw calls, not one.** A lure is gone, so its picture is frozen at the
 * place it was and needs nothing but a canvas — and so is a torn veil, for the
 * same reason and by the same test. The two clasp transients and the rind's
 * shed skin are about a body that is still falling and have to be redrawn
 * around wherever it is this frame, so they take the layout, the world and the
 * beat phase. That is the seam, and it is the reason the split is a signature
 * difference rather than a filing preference.
 *
 * All six are *pure render*: nothing here is ever read back into a world, and
 * nothing in a world can be recovered from it. Four of them draw a body the
 * simulation has already finished with; the two that do not — a clasp's shield
 * and a rind's skin — draw something that came *off* a body still falling,
 * which is the same promise from the other side.
 */
export class BodyTransients {
  private lureVanish = new LureVanishFx();
  private claspBreak = new ClaspBreakFx();
  private claspStrike = new ClaspStrikeFx();
  private veilTear = new VeilTearFx();
  private ghostRelease = new GhostReleaseFx();
  private rindShed = new RindShedFx();
  private recoilVent = new RecoilVentFx();
  private recoilCageBreak = new RecoilCageBreakFx();
  private chuteCut = new ChuteCutFx();

  /** `time` is the wall clock the contour wobble is sampled at — the husk
   * freezes the outline the body had on the frame the layer came off. */
  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    time: number,
  ): void {
    this.lureVanish.ingest(events, l);
    this.claspBreak.ingest(events, cfg, beatSeconds);
    this.claspStrike.ingest(events);
    this.veilTear.ingest(events, l);
    this.ghostRelease.ingest(events, l);
    this.rindShed.ingest(events, time);
    // Sized off the tile the shot arrived in rather than off the body, which
    // the bounce has already moved two rows out of it (`recoil-vent.ts`).
    this.recoilVent.ingest(events, l, cfg);
    // And the frame itself failing, on the bounce that spends the last one.
    this.recoilCageBreak.ingest(events, l, cfg);
    // A canopy cut off the body it was carrying — the one transient here that
    // is two gestures rather than one (`chute-cut.ts`).
    this.chuteCut.ingest(events, l);
  }

  update(dt: number): void {
    this.lureVanish.update(dt);
    this.claspBreak.update(dt);
    this.claspStrike.update(dt);
    this.veilTear.update(dt);
    this.ghostRelease.update(dt);
    this.rindShed.update(dt);
    this.recoilVent.update(dt);
    this.recoilCageBreak.update(dt);
    this.chuteCut.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.lureVanish.draw(ctx);
    // A cloud tearing open, frozen where it happened for the same reason the
    // lure's fold is: the body is gone from the world by the time this draws,
    // so there is nothing left to redraw it around.
    this.veilTear.draw(ctx);
    // A ghost climbing out of the top of the field, frozen to nothing but a
    // canvas for the same reason: the body is gone from the world by the time
    // this draws, and where it is going is the picture rather than the world.
    this.ghostRelease.draw(ctx);
    // A recoil's cage coming apart, frozen on the tile the shot landed in for
    // the same reason: the frame is debris the instant it fails, and the body
    // it was around has already gone two rows and a lane away from it.
    this.recoilCageBreak.draw(ctx);
    // A chute coming apart, frozen on the tile the shot met it in for the same
    // reason: the body is gone from the world before this draws, and where its
    // two halves go is the picture rather than the world.
    this.chuteCut.draw(ctx);
  }

  /** The four that are drawn around a body the world still has. */
  drawOnBodies(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    // The strike first, the shell coming apart over it: the bolt arrives and
    // then the thing it hit fails, which is the order the pair caused.
    this.claspStrike.draw(ctx, l, world, beatPhase);
    this.claspBreak.draw(ctx, l, world, beatPhase);
    // And a rind's skin, thrown off a body that is one size smaller than it
    // was a frame ago and still coming.
    this.rindShed.draw(ctx, l, world, beatPhase);
    // And the jet a recoil vented downward out of the tile it was struck in,
    // with a wake of embers reaching up to wherever the body is now.
    this.recoilVent.draw(ctx, l, world, beatPhase);
  }

  /**
   * For a restart. `world.nextId` starts again at 0 with a new world, so a
   * transient left standing here would be read by the next run as its own
   * body's — the rule `Effects.reset()` exists for, and which
   * `restart.test.ts` fails on if a new field is added and not cleared.
   */
  clear(): void {
    this.lureVanish.clear();
    this.claspBreak.clear();
    this.claspStrike.clear();
    this.veilTear.clear();
    this.ghostRelease.clear();
    this.rindShed.clear();
    this.recoilVent.clear();
    this.recoilCageBreak.clear();
    this.chuteCut.clear();
  }
}
