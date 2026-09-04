import { briefingHolds, guideHolds, guidePage, onReadyPage, type World } from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { P1_SKIN, P2_SKIN } from "./seat-skin.js";

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

/**
 * The age a page reports when nothing is counting for it: a still, a sheet, a
 * capture, any drawing with no `OpeningFx` behind it. It means "this has been
 * up for ever, so draw it finished", and every entrance and exit clamps, so a
 * fortnight of seconds lands in exactly the same place infinity did.
 *
 * It is a number rather than `Infinity` because not everything on these pages
 * fades. Something that breathes takes a sine of this, and `Math.sin(Infinity)`
 * is `NaN` — a coordinate a real canvas refuses. That cost a red
 * `frame.test.ts` the day the guide's bar grew a slime feeder whose width is a
 * sine of the page's age, and two functions grew a `Number.isFinite` guard of
 * their own before the sentinel itself was fixed.
 */
export const SETTLED_AGE = 1e6;

/**
 * How long the wave takes to arrive once the gate is crossed, in seconds.
 *
 * Exported because it is the one number a headless capture needs and cannot
 * observe: the rings are painted rather than stepped, so a tool that advances
 * the simulation and paints once a picture never gets past them. `bun run
 * frames` paints for this long before it keeps a frame
 * (`tools/frames/launch.ts`).
 */
export const LAUNCH_LIFE = 0.72;
/** A blob's whole life, in seconds. */
const BLOB_LIFE = 1.15;
/** How many a circle throws when it latches. */
const BLOB_COUNT = 22;
/** The two seats' colours, named here so the ring does not reach for a skin. */
const P1_HEX = P1_SKIN.tint;
const P2_HEX = P2_SKIN.tint;

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
  /** Seconds left of the wave arriving. 0 when nothing is arriving. */
  private launch = 0;

  reset(): void {
    this.key = "";
    this.shown = 0;
    this.blobs.length = 0;
    this.wasReady = [false, false];
    this.launch = 0;
  }

  /**
   * One frame. `key` names the page that is up — a wave, a phase, a cursor —
   * and the entrance clock restarts whenever it changes, which is what makes
   * paging back and forth replay the drop rather than arriving with the words
   * already settled.
   */
  update(dt: number, key: string): void {
    if (key !== this.key) {
      // The gate crossed: the opening is over and the wave is what comes next.
      // The owner asked for the moment to be marked — *when both are ready a
      // cool animation should appear, a nice transition to the game going to
      // happen now* — and this is where it can be seen from, because it is the
      // one place that knows the page that was up a frame ago.
      if (this.key.includes("|ready") && key === "") this.launch = LAUNCH_LIFE;
      this.key = key;
      this.shown = 0;
      // A page that is not the gate cannot have a circle on it, so nothing a
      // previous gate threw belongs on it either.
      if (!key.includes("|ready")) this.blobs.length = 0;
    }
    this.shown += dt;
    this.launch = Math.max(0, this.launch - dt);
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
    const hex = seat === 1 ? P1_HEX : P2_HEX;
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

  /** Whether the wave is still arriving, so the frame knows to ask. */
  get launching(): boolean {
    return this.launch > 0;
  }

  /**
   * The wave arriving: two rings running out from where the circles were, in
   * the two seats' own colours, and the light they leave behind.
   *
   * Over the whole frame rather than over the opening, because by the time this
   * runs there is no opening left — the gate crossed and the field is already
   * being drawn (`canvas2d.ts` calls it last). Additive, so it reads as light
   * on the field rather than as a sheet over it.
   */
  drawLaunch(ctx: CanvasRenderingContext2D, width: number, height: number, midY: number): void {
    if (this.launch <= 0) return;
    const k = 1 - this.launch / LAUNCH_LIFE;
    const reach = Math.hypot(width, height);
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";

    // The flash first, under the rings: brightest at the instant the gate went.
    ctx.globalAlpha = 0.2 * (1 - k) * (1 - k);
    ctx.fillStyle = PALETTE.hull;
    ctx.fillRect(0, 0, width, height);

    for (const [i, hex] of [P1_HEX, P2_HEX].entries()) {
      const lag = i * 0.12;
      const t = Math.max(0, Math.min(1, (k - lag) / (1 - lag)));
      if (t <= 0) continue;
      ctx.globalAlpha = 0.7 * (1 - t) * (1 - t);
      ctx.strokeStyle = hex;
      ctx.lineWidth = 14 * (1 - t) + 2;
      ctx.beginPath();
      ctx.arc(width / 2, midY, t * reach * 0.7 + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
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
