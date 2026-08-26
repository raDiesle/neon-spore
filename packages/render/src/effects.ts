import { isMeteorKind, type PodKind, type SimEvent } from "@neon-spore/sim";
import { drawWord, POD_RECEIPT } from "./banner.js";
import { DeflectFx } from "./deflect.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { RockImpactFx } from "./rock-impact.js";
import { Sparks } from "./sparks.js";
import { rockRadius } from "./torch.js";

/** How long "DEFLECTED" stays up. Long enough to look at, short enough to miss. */
const BANNER_LIFE = 0.9;
/**
 * The swallow, end to end: the skin comes apart, then the ship lights up —
 * two movements, one timer, so the flash never arrives before the chewing.
 */
const SWALLOW_LIFE = 1.05;
const CHEW_SHARE = 0.55;
/** How long the queen shudders after losing a petal. */
const QUEEN_SHAKE_LIFE = 0.35;

/**
 * Everything transient. Effects own their own state, are fed only by
 * `SimEvent`s, and write nothing back — the world does not know they exist.
 *
 * The deflection gets the most work by a wide margin, and deliberately: it is
 * the one moment that needs both players, and docs/spec/systems.md 5.8 says a pair that cannot
 * see it worked will never learn the timing. So the rock bounces visibly out of
 * frame, a pressure wave runs outward, and the word appears.
 */
export class Effects {
  private sparks = new Sparks();
  private deflectFx = new DeflectFx();
  private rockImpactFx = new RockImpactFx();
  private blockedUntil = new Map<number, number>();
  private guardHit = 0;
  /** Counts down from `SWALLOW_LIFE` while a pod is being taken in. */
  private swallow = 0;
  /** Which kind the swallow currently running is for, for the receipt. */
  private podKind: PodKind | null = null;
  /** Counts down from `QUEEN_SHAKE_LIFE` after she loses a petal. There is only ever one queen. */
  private queenShakeUntil = 0;

  /** Per-creature grey flash after a wrong-colour hit, keyed by creature id. */
  get blocked(): ReadonlyMap<number, number> {
    return this.blockedUntil;
  }

  /** 0..1, how hard the queen is shuddering right now. */
  get queenShake(): number {
    return Math.max(0, this.queenShakeUntil / QUEEN_SHAKE_LIFE);
  }

  get deflectFlash(): number {
    return this.guardHit;
  }

  /** 0..1 while the membrane around the maw is coming apart. */
  get chew(): number {
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (this.swallow <= 0 || done > CHEW_SHARE) return 0;
    // Up fast, then held: the ship bites and keeps its mouth busy.
    return Math.min(1, done / (CHEW_SHARE * 0.3));
  }

  /** 0..1 for the light that goes through the ship once the pod is inside. */
  get charge(): number {
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (this.swallow <= 0 || done < CHEW_SHARE) return 0;
    const after = (done - CHEW_SHARE) / (1 - CHEW_SHARE);
    // A flash is all attack and no sustain: full at once, then gone.
    return Math.max(0, 1 - after) ** 1.6;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    time: number,
    creatureIdAt: (col: number, row: number) => number,
    beatSeconds: number,
  ): void {
    for (const e of events) {
      switch (e.type) {
        case "destroy": {
          const hex = e.color === "red" ? PALETTE.red : PALETTE.cyan;
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 12, hex);
          break;
        }
        case "reject": {
          const id = creatureIdAt(e.col, e.row);
          if (id) this.blockedUntil.set(id, 0.35);
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.sparkDim);
          break;
        }
        case "hole":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.rock);
          break;
        case "breach": {
          // A rock is still visibly falling when the sim resolves the hit —
          // the burst has to wait for it to actually arrive (rock-impact.ts).
          // A living creature falls one tile a beat, close enough to the hull
          // already that the same instant read as arrival before this event
          // carried `fromRow`, so it keeps firing right away.
          if (isMeteorKind(e.kind)) {
            const r = rockRadius(l, e.kind);
            // Two bursts flanking the crater rather than one on top of it —
            // sparks fly off the rim the rock just tore, not out of thin air
            // at its own centre.
            const arrive = (ax: number, ay: number): void => {
              this.burst(ax - r * 0.8, ay, 8 * e.span, PALETTE.red);
              this.burst(ax + r * 0.8, ay, 8 * e.span, PALETTE.red);
            };
            this.rockImpactFx.spawn(
              tileCX(l, e.col),
              l,
              time,
              beatSeconds,
              e.kind,
              e.fromRow,
              true,
              arrive,
            );
          } else {
            this.burst(tileCX(l, e.col), l.hullY, 16 * e.span, PALETTE.red);
          }
          break;
        }
        case "petal":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 12, PALETTE.hullRim);
          this.queenShakeUntil = QUEEN_SHAKE_LIFE;
          break;
        case "queenDown":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 24, PALETTE.red);
          break;
        case "podLoose":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 10, PALETTE.ember);
          break;
        case "podTaken": {
          // Sparks flying *inwards*: the one moment in the game where the ship
          // takes something instead of losing it.
          this.sparks.implode(tileCX(l, e.col), l.hullY, 22, PALETTE.pod, l.tile * 1.9);
          this.swallow = SWALLOW_LIFE;
          this.podKind = e.kind;
          break;
        }
        case "podLost":
          this.burst(tileCX(l, e.col), l.hullY, 12, PALETTE.sparkDim);
          break;
        case "deflect": {
          const x = tileCX(l, e.col);
          // Same lateness as a breach: the rock is still falling when the sim
          // resolves the deflect, so the bounce waits for it to arrive too.
          // `embed: false` — a deflected rock bounces (`DeflectFx`), it never
          // sinks into a crater the way a miss does.
          this.rockImpactFx.spawn(x, l, time, beatSeconds, e.kind, e.fromRow, false, (ax, ay) => {
            this.deflectFx.spawn(ax, ay, l.tile, e.span);
            this.burst(ax, ay, 26 * e.span, PALETTE.shieldRim);
            this.guardHit = BANNER_LIFE;
          });
          break;
        }
        default:
          break;
      }
    }
  }

  update(dt: number, l: Layout): void {
    this.sparks.update(dt);
    this.deflectFx.update(dt, l.tile);
    this.rockImpactFx.update(dt, l);
    for (const [id, t] of this.blockedUntil) {
      const left = t - dt;
      if (left <= 0) this.blockedUntil.delete(id);
      else this.blockedUntil.set(id, left);
    }
    this.guardHit = Math.max(0, this.guardHit - dt);
    this.swallow = Math.max(0, this.swallow - dt);
    this.queenShakeUntil = Math.max(0, this.queenShakeUntil - dt);
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D): void {
    this.deflectFx.draw(ctx);
    this.sparks.draw(ctx);
  }

  /**
   * The last step of a rock's fall, replayed until it actually reaches the
   * hull — and, for the torch, the stuck-then-drifting rock afterwards.
   * Drawn *over* the hull rather than under it like the rest of this class:
   * a rock still falling, or lodged, has to stay in front, not partly hidden
   * behind the hull's own fill. `skinAt` is the hull's real, breathing
   * surface height at an x — `hull.ts`'s own `hullSkinY` — so a stuck rock
   * rides the same motion its crater does instead of hanging at a fixed
   * height above `Layout.hullY`'s flat approximation of the surface.
   */
  drawRockImpact(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    time: number,
    skinAt: (x: number) => number,
  ): void {
    this.rockImpactFx.draw(ctx, l, time, skinAt);
  }

  /**
   * Whether a rock is still sitting in its own crater at this x — the hull
   * asks before it draws that crater at all (`craters.ts`).
   */
  rockCoversCrater(x: number, tile: number): boolean {
    return this.rockImpactFx.coversCrater(x, tile);
  }

  /** The word itself, over the hull — DEFLECTED, or a pod's one-word receipt. */
  drawBanner(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.guardHit > 0) {
      drawWord(ctx, l, "DEFLECTED", PALETTE.shieldRim, Math.min(1, this.guardHit / 0.6), 0.9);
    }
    if (this.swallow <= 0 || !this.podKind) return;
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (done < CHEW_SHARE) return; // wait for the chewing to finish first
    const after = (done - CHEW_SHARE) / (1 - CHEW_SHARE);
    const a = Math.min(1, 1 - after);
    if (a <= 0) return;
    const { text, hex } = POD_RECEIPT[this.podKind];
    drawWord(ctx, l, text, hex, a, 0.55);
  }

  private burst(x: number, y: number, n: number, hex: string): void {
    this.sparks.burst(x, y, n, hex);
  }
}
