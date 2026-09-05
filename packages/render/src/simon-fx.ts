import {
  MIRROR_LEAD_BEATS,
  type MirrorPhase,
  type MirrorState,
  type MirrorStep,
  type MirrorVerdictReason,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { mirrorHullY } from "./mirror.js";
import { PALETTE } from "./palette.js";
import { GhostShots } from "./simon-ghost.js";
import { stepHex } from "./simon-glyph.js";
import {
  ANSWER_FLASH,
  drawListenClock,
  drawListenRow,
  drawShowRow,
  rowSlots,
} from "./simon-row.js";
import { VerdictFx } from "./simon-verdict.js";

/**
 * Everything transient about THE MIRROR: how long its shield stays lit for a
 * step it just performed, the shots it drops while performing one, the chain
 * of glyphs above the field, and the two seconds after a round is settled.
 *
 * None of it is read back, and none of it is in the world — the world knows
 * which step was performed and which was answered, and that is all either
 * device needs to agree on.
 */

/** How long a performed gesture keeps the mirror's own lobe lit, in seconds. */
const GESTURE_LIFE = 0.55;
/** How long YOUR TURN stands once the controls come back. */
const TURN_LIFE = 1.3;

export class MirrorFx {
  /** Seconds left of the mirror's own shield being held open. */
  private armedFor = 0;
  /** The same for its maw. */
  private intakeFor = 0;
  /** The shots it drops while demonstrating — see `simon-ghost.ts`. */
  private ghosts = new GhostShots();
  /** The steps performed so far this round, in order. */
  private chain: MirrorStep[] = [];
  /** The settled round on its way into whichever ship earned it. */
  private verdict = new VerdictFx();
  /** Where the row was last drawn, so a verdict can throw it from there. */
  private rowY = 0;
  /** A verdict heard but not yet launched — see `draw`. */
  private pending: { right: boolean; reason: MirrorVerdictReason } | null = null;
  /** Seconds left of the green flare on the step just answered. */
  private answerFlash = 0;
  /** Seconds left of YOUR TURN, set the moment the pair gets the controls. */
  private turnFor = 0;
  /** The phase last drawn, so the turn handover can be noticed. */
  private lastPhase: MirrorPhase | null = null;

  /** 0..1 towards the mirror's shield being held open, for its hull's mood. */
  get armed(): number {
    return Math.min(1, this.armedFor / (GESTURE_LIFE * 0.6));
  }

  /** The same for its maw. */
  get intake(): number {
    return Math.min(1, this.intakeFor / (GESTURE_LIFE * 0.6));
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "mirrorShow") {
        if (e.index === 1) this.chain = [];
        this.chain.push(e.step);
        this.perform(e.step, e.col);
      }
      if (e.type === "mirrorEcho") this.answerFlash = ANSWER_FLASH;
      if (e.type === "mirrorVerdict") this.pending = { right: e.right, reason: e.reason };
      if (e.type === "mirrorDown") this.verdict.clear();
    }
  }

  /** The mirror doing the thing: its own lobe answers, and a shot leaves it. */
  private perform(step: MirrorStep, col: number): void {
    if (step === "guard") this.armedFor = GESTURE_LIFE;
    if (step === "intake") this.intakeFor = GESTURE_LIFE;
    if (step === "fireRed" || step === "fireCyan") {
      this.ghosts.spawn(col, stepHex(step));
    }
  }

  update(dt: number): void {
    this.armedFor = Math.max(0, this.armedFor - dt);
    this.intakeFor = Math.max(0, this.intakeFor - dt);
    this.verdict.update(dt);
    this.answerFlash = Math.max(0, this.answerFlash - dt);
    this.turnFor = Math.max(0, this.turnFor - dt);
    this.ghosts.update(dt);
  }

  clear(): void {
    this.armedFor = 0;
    this.intakeFor = 0;
    this.ghosts.clear();
    this.chain = [];
    this.verdict.clear();
    this.pending = null;
    this.rowY = 0;
    this.answerFlash = 0;
    this.turnFor = 0;
    this.lastPhase = null;
  }

  /** The shots it drops while demonstrating. Under the hull, like every other. */
  drawGhosts(ctx: CanvasRenderingContext2D, l: Layout, cfg: SimConfig): void {
    this.ghosts.draw(ctx, l, cfg);
  }

  /**
   * The sequence, over the field. While it is being performed the pair sees
   * the glyphs; the moment it is their turn the glyphs go and only the count
   * stays. That is the whole game — a sequence still on screen while it is
   * being repeated is not a memory test, it is reading aloud.
   *
   * `mirrorHullY` is passed in rather than computed here because a verdict
   * throws the glyphs at one hull or the other, and only the caller knows
   * where the mirror is standing.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    cfg: SimConfig,
    m: MirrorState,
    beat: number,
    beatPhase: number,
  ): void {
    const mirrorY = mirrorHullY(l, cfg);
    this.rowY = mirrorY + l.tile * 2.2;
    const steps = m.rounds[m.round] ?? [];

    // The beat the controls come back is the beat the pair has to be told
    // about, and a phase change is the only place that is knowable.
    if (this.lastPhase !== m.phase) {
      if (m.phase === "listen") this.turnFor = TURN_LIFE;
      this.lastPhase = m.phase;
    }

    // A verdict arrives on the beat the phase turns over, so it is launched
    // here, from the row the glyphs were last drawn on, rather than in
    // `ingest` — which has no layout and so no idea where anything is.
    if (this.pending !== null) {
      const { right, reason } = this.pending;
      this.pending = null;
      const slots = rowSlots(l, this.chain.length);
      this.verdict.start(
        this.chain.map((step, i) => ({ step, x: slots.x0 + i * slots.gap, r: slots.r })),
        right,
        reason,
        this.rowY,
        right ? mirrorY : l.hullY,
      );
    }

    if (m.phase === "lead") {
      drawShowRow(ctx, l, this.rowY, steps, 0);
      this.drawCountdown(ctx, l, m, beat, beatPhase);
    }
    if (m.phase === "show") drawShowRow(ctx, l, this.rowY, steps, m.shown);
    if (m.phase === "listen") {
      drawListenRow(ctx, l, this.rowY, steps, m.matched, this.answerFlash);
      const elapsed = beat - m.phaseBeat + beatPhase;
      drawListenClock(ctx, l, this.rowY + l.tile * 1.5, steps.length, elapsed);
      this.drawTurn(ctx, l);
    }

    this.verdict.drawEdges(ctx, l);
    this.verdict.drawFlights(ctx, l);
    this.verdict.drawWord(ctx, l);
  }

  /**
   * Three, two, one. A sequence that simply began was one the pair had already
   * missed the first step of by the time they noticed it had — the count-in is
   * the beat they get to stop talking on.
   */
  private drawCountdown(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    m: MirrorState,
    beat: number,
    beatPhase: number,
  ): void {
    const left = MIRROR_LEAD_BEATS - (beat - m.phaseBeat);
    if (left < 1 || left > MIRROR_LEAD_BEATS) return;
    // Struck on the beat and settling: big at the moment it lands, then still.
    const scale = 1 + 0.35 * (1 - Math.min(1, beatPhase * 3)) ** 2;
    ctx.save();
    ctx.globalAlpha = Math.max(0.35, 1 - beatPhase * 0.5);
    ctx.textAlign = "center";
    ctx.translate(l.width / 2, l.playHeight * 0.58);
    ctx.scale(scale, scale);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 46px "Courier New",monospace';
    ctx.fillText(String(left), 0, 0);
    ctx.font = '700 10px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("WATCH — CONTROLS LOCKED", 0, 22);
    ctx.restore();
    ctx.textAlign = "left";
  }

  /** The handover, said once: the controls are theirs again. */
  private drawTurn(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.turnFor <= 0) return;
    const a = Math.min(1, this.turnFor / 0.35);
    const y = l.playHeight * 0.58;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = '700 26px "Courier New",monospace';
    const half = ctx.measureText("YOUR TURN").width / 2 + 14;
    ctx.fillStyle = "rgba(7,4,15,.78)";
    ctx.fillRect(l.width / 2 - half, y - 24, half * 2, 34);
    ctx.fillStyle = PALETTE.good;
    ctx.fillText("YOUR TURN", l.width / 2, y);
    ctx.restore();
    ctx.textAlign = "left";
  }
}
