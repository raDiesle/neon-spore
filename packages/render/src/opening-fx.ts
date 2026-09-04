import { briefingHolds, guideHolds, guidePage, onReadyPage, type World } from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The two things a wave's opening remembers between frames: how long the page
 * that is up has been up, and the blobs a READY throws off.
 *
 * Everything else about an opening is drawn straight off the world, which is
 * why there was nothing here before pages existed. These two are clocks, and a
 * clock cannot be read out of a world that is deliberately standing still.
 *
 * It lives on `Effects` and is cleared by `Effects.reset()` — CLAUDE.md's rule
 * for anything in `render/` that outlives a frame, and `test/restart.test.ts`
 * is what enforces it. A restart builds a fresh world whose `tick` starts at 0
 * again, and an entrance animation half-played against the last run's clock is
 * exactly the class of ghost that rule exists to stop.
 */

/** A blob's whole life, in seconds. */
const BLOB_LIFE = 1.15;
/** How many a circle throws when it latches. */
const BLOB_COUNT = 22;

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  age: number;
  hex: string;
}

export class OpeningFx {
  /** Which page is up, as a string nobody reads: only a change matters. */
  private key = "";
  /** Seconds the page that is up has been up. Drives the text's entrance. */
  private shown = 0;
  private blobs: Blob[] = [];
  /** Whether each seat's circle was full last frame, so a latch is an edge. */
  private wasReady: [boolean, boolean] = [false, false];

  reset(): void {
    this.key = "";
    this.shown = 0;
    this.blobs.length = 0;
    this.wasReady = [false, false];
  }

  /**
   * One frame. `key` names the page that is up — a wave, a phase, a cursor —
   * and the entrance clock restarts whenever it changes, which is what makes
   * paging back and forth replay the drop rather than arriving with the words
   * already settled.
   */
  update(dt: number, key: string): void {
    if (key !== this.key) {
      this.key = key;
      this.shown = 0;
      // A page that is not the gate cannot have a circle on it, so nothing a
      // previous gate threw belongs on it either.
      if (!key.includes("|ready")) this.blobs.length = 0;
    }
    this.shown += dt;
    for (const b of this.blobs) {
      b.age += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // Thrown out in every direction, then pulled down: the whole of what
      // makes it read as something spat rather than something exploded.
      b.vy += 1100 * dt;
      b.vx *= 1 - 1.6 * dt;
    }
    this.blobs = this.blobs.filter((b) => b.age < BLOB_LIFE);
  }

  /** Seconds the page that is up has been up. The entrance and the exit of
   * everything drawn on it are read off this one number (`wave-intro.ts`). */
  get age(): number {
    return this.shown;
  }

  /**
   * One seat's circle, every frame, with where it is drawn. The blobs are
   * thrown on the frame it fills and never again: `ready` is a latch, so the
   * edge is the event and the level is not.
   */
  noteReady(seat: 1 | 2, ready: boolean, x: number, y: number, r: number): void {
    const i = seat - 1;
    if (ready && !this.wasReady[i]) this.spit(x, y, r, seat);
    this.wasReady[i] = ready;
  }

  private spit(x: number, y: number, r: number, seat: 1 | 2): void {
    const hex = seat === 1 ? PALETTE.hull : PALETTE.cyan;
    for (let i = 0; i < BLOB_COUNT; i++) {
      // Fanned by index rather than by a random number: a burst that comes out
      // the same every time is one somebody can look at twice, and `render` has
      // no seeded stream of its own to reach for.
      const a = (i / BLOB_COUNT) * Math.PI * 2 + (seat === 1 ? 0.2 : 0.5);
      const speed = 150 + ((i * 37) % 110);
      this.blobs.push({
        x: x + Math.cos(a) * r * 0.7,
        y: y + Math.sin(a) * r * 0.7,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 90,
        r: 3 + ((i * 13) % 5),
        age: 0,
        hex,
      });
    }
  }

  /**
   * What was thrown, still falling. Drawn over the gate rather than under it:
   * the point of it is that pressing READY does something loud, and something
   * loud behind the button it came out of is something nobody sees.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.blobs) {
      const k = b.age / BLOB_LIFE;
      ctx.globalAlpha = Math.max(0, 1 - k * k);
      ctx.fillStyle = b.hex;
      ctx.beginPath();
      // Stretched along the way it is going, so a blob falling reads as a drop
      // rather than as a dot that happens to have moved.
      const stretch = 1 + Math.min(1.4, Math.abs(b.vy) / 700);
      ctx.ellipse(b.x, b.y, b.r, b.r * stretch, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Which page of a wave's opening is up, as a string nobody reads: `OpeningFx`
 * only ever compares it with the last one, and restarts its clocks when it
 * changes. A wave, whether the guide or the introduction is standing, and how
 * far this seat has read — the three things that make one page a different page
 * from the last, and the reason paging back replays the drop rather than
 * arriving with the words already settled.
 */
export function openingKey(world: World, role: ViewRole): string {
  if (!briefingHolds(world)) return "";
  const seat: 1 | 2 = role === "p2" ? 2 : 1;
  if (!guideHolds(world)) return `${world.wave}|intro`;
  const page = guidePage(world, seat);
  return `${world.wave}|${page}${onReadyPage(world, seat) ? "|ready" : ""}`;
}
