import { controlSetForWave } from "@neon-spore/content";
import {
  bandLobes,
  Canvas2DRenderer,
  type Circle,
  computeLayout,
  computeStage,
  drawnCol,
  drawnRow,
  type Layout,
  tileCX,
  tileCY,
} from "@neon-spore/render";
import { type Creature, framePhase, occupiesCol } from "@neon-spore/sim";
import { PHONE } from "./pose-frame.js";
import { askedBody, beatsLeft, ShieldRun, windowBeats } from "./shield-lab-run.js";
import { runStageLoop, type StageLoopHandle, stageTickHz } from "./stage-loop.js";

/**
 * **THE SHIELD LAB's field, drawn** (`shield-lab.ts`): the run
 * (`shield-lab-run.ts`) drawn by the shipping renderer, once as player 1's
 * phone and once as player 2's, side by side — the shield is a job split
 * across them. Player 2 slides it into the column (`shield`, the strip),
 * player 1 presses SHIELD on the moment (`guard`, the button), and a helper
 * for it has to speak to both screens.
 */

export type Seat = "p1" | "p2";
export const SEATS: readonly Seat[] = ["p1", "p2"];

/** The device pixels a phone is drawn at before it is laid on the lab's canvas. */
const DPR = 2;
/** Space between the two phones, in the phone's own pixels. */
export const GAP = 24;
/** The lab canvas, in phone pixels: two phones and the gap. */
export const SCENE_W = PHONE.width * 2 + GAP;
export const SCENE_H = PHONE.height;
/** How fast the lab's dome follows its column, per second — near enough the renderer's own chain. */
const DOME_EASE = 14;

/**
 * **What the shield is asked for this frame**: the lowest rock still to be
 * answered, where it is drawn, and how long until the beat it reaches the
 * shield's row. `beatsLeft` reaches 0 on that beat — the press must land in
 * the window before it.
 */
export interface ShieldAsk {
  body: Creature;
  /** The body's centre as drawn, and its radius, in the phone's CSS pixels. */
  x: number;
  y: number;
  r: number;
  /** The column the shield has to stand in, and its centre. */
  col: number;
  colX: number;
  /** Whether the shield stands in it now. */
  under: boolean;
  beatsLeft: number;
  windowBeats: number;
  /** The first of its kind on this run of the field. */
  first: boolean;
}

/** One phone as the lab draws it: the layout, where the dome and the two controls stand. */
export interface SeatFrame {
  seat: Seat;
  l: Layout;
  /** The dome's centre on the hull, eased toward its column. */
  domeX: number;
  domeY: number;
  /** Player 1's SHIELD button, on P1's screen. */
  button: Circle | null;
  /** Player 2's strip, on P2's screen: its row and the knob's x. */
  strip: { x: number; y: number } | null;
}

export class ShieldScene {
  readonly run = new ShieldRun();
  private readonly set = controlSetForWave(this.run.wave);
  private readonly offs = new Map<Seat, HTMLCanvasElement>();
  private readonly renderers = new Map<Seat, Canvas2DRenderer>();
  private stepped = false;
  private domeCol = this.run.world.shieldCol;
  private readonly loop: StageLoopHandle;

  /** The field runs on the director's one clock (`stage-loop.ts`), at the lab's SPEED, AUTO's hands on it when asked. */
  constructor(auto: () => boolean, speed: () => number) {
    this.loop = runStageLoop({
      tickHz: () => stageTickHz(this.run.world),
      advance: () => {
        this.run.tick(auto());
        this.stepped = true;
      },
      paint: (dt) => {
        this.domeCol += (this.run.world.shieldCol - this.domeCol) * Math.min(1, dt * DOME_EASE);
      },
      scale: (real) => real * speed(),
    });
    for (const seat of SEATS) {
      const off = document.createElement("canvas");
      const r = new Canvas2DRenderer(off);
      r.resize({ ...PHONE, dpr: DPR });
      this.offs.set(seat, off);
      this.renderers.set(seat, r);
    }
  }

  /** The phone's layout and what stands on it. */
  frameOf(seat: Seat): SeatFrame {
    const w = this.run.world;
    const stage = computeStage(PHONE);
    const l = computeLayout({ width: stage.width, height: stage.height, dpr: DPR }, w.cfg, seat);
    const guard = bandLobes(l, this.set, 1).find((b) => b.control.id === "guard");
    return {
      seat,
      l,
      domeX: tileCX(l, this.domeCol),
      domeY: l.hullY - l.tile * 0.34,
      button: seat === "p1" ? (guard?.circle ?? null) : null,
      strip: seat === "p2" ? { x: tileCX(l, w.shieldCol), y: l.shieldStrip.y } : null,
    };
  }

  /** What the shield is asked this frame, or null with nothing on its way. */
  ask(l: Layout): ShieldAsk | null {
    const w = this.run.world;
    const c = askedBody(w);
    if (!c) return null;
    const phase = framePhase(w);
    return {
      body: c,
      x: tileCX(l, drawnCol(c, phase)),
      y: tileCY(l, drawnRow(c, phase)),
      r: l.tile * 0.45,
      col: c.col,
      colX: tileCX(l, c.col),
      under: occupiesCol(c, w.shieldCol),
      beatsLeft: beatsLeft(w, c),
      windowBeats: windowBeats(w),
      first: this.run.first(c),
    };
  }

  /** One phone, drawn by the renderer and then by `over` in the phone's CSS pixels, laid on the lab's canvas. */
  paint(
    ctx: CanvasRenderingContext2D,
    seat: Seat,
    dt: number,
    over: (c: CanvasRenderingContext2D, f: SeatFrame) => void,
  ): void {
    const off = this.offs.get(seat);
    const r = this.renderers.get(seat);
    if (!off || !r) return;
    const w = this.run.world;
    r.draw({
      world: w,
      beatPhase: framePhase(w),
      role: seat,
      time: w.tick / w.cfg.tickHz,
      running: true,
      dt,
      events: this.stepped ? w.events : [],
    });
    const c = off.getContext("2d");
    if (c) {
      const stage = computeStage(PHONE);
      c.save();
      c.setTransform(DPR, 0, 0, DPR, stage.left * DPR, stage.top * DPR);
      over(c, this.frameOf(seat));
      c.restore();
    }
    const x = seat === "p1" ? 0 : PHONE.width + GAP;
    const k = ctx.canvas.width / SCENE_W;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, x * k, 0, PHONE.width * k, PHONE.height * k);
  }

  /** Both phones drawn: the events of the last ticks are spent on this frame. */
  painted(): void {
    this.stepped = false;
  }

  dispose(): void {
    this.loop.stop();
    for (const r of this.renderers.values()) r.dispose();
  }
}
