import type { BossState, Color, Creature } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, showsQueenShape } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawQuestionMark, innerQuestionRadius, markOutline } from "./queen-glyph.js";

/** Breath speed at full health, out of bloom. */
const BREATH_BASE = 1.5;
/** How much faster the breath speed gets by the time she is down to her last petal. */
const BREATH_LOW_HEALTH_BONUS = 2.5;
/** Multiplier while a bloom is announced but not yet open — the original "coming" tell. */
const BREATH_ANNOUNCED_MULT = 3;
/** Beats the mark takes to finish turning from one creature into the other. */
const MORPH_BEATS = 1.5;
/** How bright the tell is before the bloom has a clock on it. */
const PENDING_ALPHA = 0.45;

/**
 * One of the two marks under her middle, and the whole of the information
 * split that makes her a boss rather than a large creature.
 *
 * | | player 1 | player 2 |
 * |---|---|---|
 * | armoured | the creature that is coming, a question mark inside it | a question mark |
 * | which side is real | nothing | a pulsing ring (`drawSideHint`) |
 * | open, the real mark | revealed, no question left | revealed |
 * | open, the other one | a small armoured ball | a small armoured ball |
 *
 * The two question marks are the same statement from opposite sides. Player
 * 1's sits *inside* a creature they can already name: the shape is what is
 * coming, the glyph is the half of it they are not being told. Player 2's
 * stands *in place of* one: they know exactly which mark, and nothing at all
 * about what comes out of it.
 *
 * Neither half is worth anything alone: player 1 holds the cannon and the
 * ammunition but does not know which of the two columns to take, player 2
 * knows the column and cannot fire. Both marks are armoured until the bloom
 * opens, and only the real one ever loses its armour — which is also the
 * moment the split stops mattering, and by then it is far too late to start
 * talking.
 *
 * Armour is not a different creature. It is the *same* silhouette that is
 * coming, in rock grey, so what player 1 reads is genuinely the shape they
 * will have to shoot rather than a lid over it. It morphs when the colour
 * turns over, because the colour always turns over: consecutive blooms
 * alternate, so every change is a slick↔bulb one (`pickNextBloom`).
 */

/** True once this particular mark has opened — the real one, while she is open. */
function isRevealed(side: -1 | 1, queen: Creature, boss: BossState): boolean {
  return queen.color != null && boss.weakSide === side;
}

/** A bloom is named and has a clock on it, but has not opened yet. */
function isAnnounced(queen: Creature, boss: BossState, beat: number): boolean {
  return queen.color == null && boss.openBeat !== -1 && beat < boss.openBeat;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How far the *position* has been given away, 0..1 — the one curve both the
 * ball and the question marks ride, because they are two halves of the same
 * fact. It runs up as the bloom opens and back down once it has closed.
 *
 * A pure function of beats the sim already stores, so nothing here is
 * remembered between frames and a restart cannot carry a half-finished
 * animation into the next run. Before the first bloom has ever closed
 * (`spentSide` still 0) it is flatly 0: a wave must not open on a mark
 * already part-way through shrinking.
 */
function revealShare(boss: BossState, queen: Creature, beat: number, beatPhase: number): number {
  if (queen.color != null) return clamp01((beat - boss.openBeat + beatPhase) / MORPH_BEATS);
  if (boss.spentSide === 0) return 0;
  return 1 - clamp01((beat - boss.pickBeat + beatPhase) / MORPH_BEATS);
}

/**
 * How much of a ball this mark is right now. Only ever the one that stayed
 * shut: while a bloom is open that is whichever is not `weakSide`, and once
 * it has closed it is `spentSide`, which is the only reason the sim records
 * that at all — `weakSide` has already been redrawn for the next bloom by
 * then.
 */
export function ballShare(
  boss: BossState,
  queen: Creature,
  side: -1 | 1,
  beat: number,
  beatPhase: number,
): number {
  const shut = queen.color != null ? boss.weakSide !== side : boss.spentSide === side;
  return shut ? revealShare(boss, queen, beat, beatPhase) : 0;
}

/**
 * The colour the mark is showing and how strongly, or null for none. Split
 * out because the shell is drawn over the mark's top and both sides
 * (`drawQueen`), so the glow has to go on last, after the body, rather than
 * from inside the mark's own drawing where the shell would bury it.
 */
export function markGlow(
  l: Layout,
  side: -1 | 1,
  queen: Creature,
  boss: BossState,
  beat: number,
  beatPhase = 0,
): { hex: string; alpha: number } | null {
  if (isRevealed(side, queen, boss)) {
    return { hex: queen.color === "red" ? PALETTE.red : PALETTE.cyan, alpha: 0.16 };
  }
  // Armoured. The colour that is coming is player 1's half and player 1's
  // alone — a glow leaking onto player 2's screen would hand them both
  // halves and there would be nothing left to say.
  if (!showsQueenShape(l.role) || boss.tellColor == null) return null;
  // A mark that has balled up is spent: it keeps no claim on the colour.
  const left = 1 - ballShare(boss, queen, side, beat, beatPhase);
  if (left <= 0) return null;
  const hex = boss.tellColor === "red" ? PALETTE.red : PALETTE.cyan;
  const strength = isAnnounced(queen, boss, beat) ? 1 : PENDING_ALPHA;
  return { hex, alpha: 0.16 * strength * left };
}

/**
 * How far through the creature-to-creature morph the mark is, 0..1 — off the
 * beat the next bloom was chosen on (`boss.pickBeat`), stateless for the same
 * reason as `revealShare`.
 */
function morphShare(boss: BossState, beat: number, beatPhase: number): number {
  return clamp01((beat - boss.pickBeat + beatPhase) / MORPH_BEATS);
}

export function drawMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cx: number,
  cy: number,
  r: number,
  side: -1 | 1,
  queen: Creature,
  boss: BossState,
  beat: number,
  beatPhase: number,
  time: number,
  healthShare: number,
): void {
  const revealed = isRevealed(side, queen, boss);
  const announced = isAnnounced(queen, boss, beat);
  const ball = ballShare(boss, queen, side, beat, beatPhase);

  const phase = (queen.id % 7) * 0.9;
  const baseBreath = BREATH_BASE + (1 - healthShare) * BREATH_LOW_HEALTH_BONUS;
  const breathSpeed = announced ? baseBreath * BREATH_ANNOUNCED_MULT : baseBreath;
  const t = time * (breathSpeed / BREATH_BASE) + phase;

  // Player 2's half of the picture: what is coming is withheld, and the mark
  // says which of the two things it is withholding by not being a creature at
  // all. It gives way to the ball as the mark that stayed shut spends itself,
  // and the reveal is universal — once a mark is open it is open.
  if (!revealed && !showsQueenShape(l.role)) {
    drawQuestionMark(ctx, cx, cy, r, PALETTE.rock, t, 1 - ball);
    if (ball <= 0) return;
  }

  // `queen.color` while open, the colour that is coming while armoured. One
  // of the two is always set by the time she is on the field.
  const shown: Color = queen.color ?? boss.tellColor ?? "cyan";
  const other: Color = shown === "red" ? "cyan" : "red";
  const k = morphShare(boss, beat, beatPhase);
  const { d, norm, ryShare } = markOutline(other, shown, k, ball, t);
  const scale = r / norm;

  const pump = Math.sin(t * breathSpeed);
  const sx = 1 + pump * 0.15;
  const sy = 1 - pump * 0.15;

  const path = new Path2D(d);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * sx, scale * sy);

  const hex = shown === "red" ? PALETTE.red : PALETTE.cyan;
  const line = Math.max(1, r * 0.14) / scale;

  if (revealed) {
    // The armour is off: body and border alike, exactly a creature of that
    // colour, because that is what a shot now has to match.
    ctx.fillStyle = shown === "red" ? PALETTE.redDark : PALETTE.cyanDark;
    ctx.fill(path);
    strokeGlow(ctx, path, hex, line, 1);
  } else {
    // Still armoured: rock through and through. The colour that is coming is
    // carried on the border alone — dimmer until the bloom has a clock on it,
    // so "coming" and "coming *now*" do not read alike — and fades out
    // entirely as a spent mark balls up, which is the whole of what "stays
    // the colour of armour" means.
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill(path);
    const tell = (announced ? 1 : PENDING_ALPHA) * (1 - ball);
    if (tell > 0) {
      ctx.globalAlpha = tell;
      strokeGlow(ctx, path, hex, line, 1);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = line * 0.6;
    ctx.stroke(path);
  }

  ctx.restore();

  // Player 1's half: the creature is named, the side is not. The glyph rides
  // inside the silhouette and goes out exactly as the position comes in —
  // both off `revealShare`, because they are the same fact.
  if (showsQueenShape(l.role) && !revealed) {
    const glyph = 1 - revealShare(boss, queen, beat, beatPhase);
    drawQuestionMark(ctx, cx, cy, innerQuestionRadius(r, ryShare), PALETTE.rock, t, glyph);
  }
}
