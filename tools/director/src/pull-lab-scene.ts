import { type Point, WAVES } from "@neon-spore/content";
import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  PULL_KNOB,
  PULL_TRACK,
  PULL_TRACK_W,
  type PullTrack,
  type ViewRole,
} from "@neon-spore/render";
import { framePhase, lampreyAsks, lampreyBoss, slowing, step, type World } from "@neon-spore/sim";
import { PULL_SIZE } from "../../../packages/render/src/pull-knob.js";
import { SLOW_LIGHT } from "../../../packages/render/src/slow-intake.js";
import { PHONE } from "./pose-frame.js";
import { fresh, POSE_TPB, until } from "./pose-kit.js";
import { holdLooks, type LabFrame, pullDraws } from "./pull-lab-paint.js";
import type { LabShape } from "./pull-lab-shapes.js";
import type { LabScene } from "./pull-lab-tune.js";
import { runStageLoop, type StageLoopHandle, stageTickHz } from "./stage-loop.js";

/**
 * **The PULL LAB on a wave**: THE LAMPREY's first pull, the tow — the eel
 * come down the middle at the ship under THE SLOW, the pilot's tail and the
 * navigator's head to be pulled back along a curve. The owner, 12 October
 * 2026: *adjust "pull lab" to show the first situation in "the lamprey" where
 * players have to pull so i can see in real setup*.
 *
 * The world is the real wave, run by the simulation to the tow and drawn by
 * the shipping renderer; it runs on at THE SLOW's own rate and starts over
 * before the window shuts. Nobody in it pulls. **The seat's own handle is
 * the lab's**: where the renderer asks `PULL_TRACK` and `PULL_KNOB` for this
 * seat's channel and knob, the lab's pull is drawn instead, along the track
 * the game laid — so the drop stands exactly where the game stands its knob,
 * under whatever the game draws over it. The eel does not follow it: the
 * head and tail stay where the world has them.
 */

export type LabSeat = Extract<ViewRole, "p1" | "p2">;

/** The phone's own pixels, the size the lab's canvas is drawn in for a wave. */
export const SCENE_W = PHONE.width;
export const SCENE_H = PHONE.height;
/** Device pixels the phone is drawn at before it is laid on the lab's canvas. */
const DPR = 2;
/** Beats before the window shuts that the tow starts over: the bite is never seen. */
const BEFORE_END = 1.5;

function towWorld(): World {
  const index = WAVES.findIndex((w) => w.id === "theLamprey");
  const wave = WAVES[index];
  if (!wave?.boss) throw new Error("THE LAMPREY is not in WAVES");
  const w = fresh([], [], wave.boss, {}, index);
  until(
    w,
    "THE LAMPREY's tow",
    (x) => {
      const s = lampreyBoss(x);
      return s !== null && s.phase === "bite" && lampreyAsks(s) === "tow" && slowing(x);
    },
    POSE_TPB * 400,
  );
  return w;
}

/** What one frame of the scene is asked: the lab's pull, how loud THE SLOW is. */
export interface SceneFrame {
  /** The lab's frame; its `shape` is replaced by the one the game laid this frame. */
  lab: LabFrame;
  slow: number;
  dt: number;
}

export class LampreyScene {
  private readonly start = towWorld();
  private live: World = structuredClone(this.start);
  private stepped = false;
  private readonly loop: StageLoopHandle;
  private readonly off = document.createElement("canvas");
  private readonly renderer = new Canvas2DRenderer(this.off);
  private readonly tile: number;
  /** The seat's own track as the game laid it last frame, and where it was drawn. */
  private laid: { track: PullTrack; m: DOMMatrix } | null = null;

  /** `speed` is the lab's SPEED: the wave runs on the director's one clock, at that share. */
  constructor(
    readonly seat: LabSeat,
    speed: () => number,
  ) {
    this.renderer.resize({ ...PHONE, dpr: DPR });
    this.loop = runStageLoop({
      tickHz: () => stageTickHz(this.live),
      advance: () => this.advance(),
      paint: () => {},
      scale: (real) => real * speed(),
    });
    const stage = computeStage(PHONE);
    const l = computeLayout({ ...stage, dpr: DPR }, this.start.cfg, seat);
    this.tile = l.tile;
  }

  /** One tick of the wave; over again near the window's end. */
  private advance(): void {
    const w = this.live;
    step(w, []);
    this.stepped = true;
    const s = lampreyBoss(w);
    const over = s === null || lampreyAsks(s) !== "tow" || !slowing(w);
    if (over || w.slowToBeat - w.beat <= BEFORE_END) this.live = structuredClone(this.start);
  }

  /** The pull's shape this frame, as the game laid it, or `null` before the first is drawn. */
  shape(): LabShape | null {
    return this.laid ? this.shapeOf(this.laid.track) : null;
  }

  /** A point on the lab's canvas, as fractions of it, in the track's own pixels. */
  toTrack(fx: number, fy: number): Point | null {
    if (!this.laid) return null;
    const p = this.laid.m.inverse().transformPoint({
      x: fx * this.off.width,
      y: fy * this.off.height,
    });
    return { x: p.x, y: p.y };
  }

  paint(ctx: CanvasRenderingContext2D, f: SceneFrame): void {
    const put = holdLooks(f.lab);
    const inner = { knob: PULL_KNOB.paint, track: PULL_TRACK.paint };
    const strength = SLOW_LIGHT.strength;
    let mine: LabFrame | null = null;
    SLOW_LIGHT.strength = f.slow;
    PULL_TRACK.paint = (c, t, o) => {
      if (mine) return inner.track(c, t, o);
      this.laid = { track: t, m: c.getTransform() };
      mine = { ...f.lab, shape: this.shapeOf(t) };
      inner.track(c, t, pullDraws(mine).track);
    };
    PULL_KNOB.paint = (c, at, r, o) => {
      if (o.theirs || !mine) return inner.knob(c, at, r, o);
      const d = pullDraws(mine);
      // The records are handed the knob and channel as drawn, `PULL_SIZE` times the rule's.
      inner.knob(c, d.at, d.r * PULL_SIZE, d.knob);
    };
    try {
      const w = this.live;
      this.renderer.draw({
        world: w,
        beatPhase: framePhase(w),
        role: this.seat,
        time: w.tick / w.cfg.tickHz,
        running: true,
        dt: f.dt,
        events: this.stepped ? w.events : [],
      });
      this.stepped = false;
    } finally {
      PULL_KNOB.paint = inner.knob;
      PULL_TRACK.paint = inner.track;
      SLOW_LIGHT.strength = strength;
      put();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.off, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  dispose(): void {
    this.loop.stop();
    this.renderer.dispose();
  }

  /** The rule's shape from the channel as drawn: the game's own track, at the size its code asks. */
  private shapeOf(drawn: PullTrack): LabShape {
    const track = { ...drawn, w: drawn.w / PULL_SIZE };
    return {
      key: `lamprey-${this.seat}`,
      label: this.seat === "p2" ? "THE LAMPREY · THE HEAD" : "THE LAMPREY · THE TAIL",
      direction: this.seat === "p2" ? "path" : "down",
      like: "THE LAMPREY's tow, its first pull",
      track,
      origin: 0,
      knob: track.w / PULL_TRACK_W,
      tile: this.tile,
    };
  }
}

/** The wave the bar's ON names, from the seat it names; `null` for the empty field. */
export function sceneFor(scene: LabScene, speed: () => number): LampreyScene | null {
  if (scene === "empty") return null;
  return new LampreyScene(scene === "lamprey-p1" ? "p1" : "p2", speed);
}
