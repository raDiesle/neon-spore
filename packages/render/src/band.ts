import { type ControlSet, controlSetForWave, setControls } from "@neon-spore/content";
import { mirrorHoldsControls, type World } from "@neon-spore/sim";
import { drawStripFor } from "./band-channel.js";
import { drawLobe } from "./band-control.js";
import { drawBandGround } from "./band-ground.js";
import { chamberPath, drawSeamFlesh, drawSeamSpill, seamTop } from "./band-seam.js";
import { drawDrips, drawFeeders } from "./band-slime.js";
import { bandLobes, type Layout, showsCannon, showsShield } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The control band. Two strips over the full width, each snapping to column
 * centres, plus the trigger and the two colours.
 *
 * The split is the game: player 1 slides the cannon and triggers the shield,
 * player 2 slides the shield and fires. Neither can carry a defence alone, and
 * the band shows that by never giving one player both halves of anything.
 *
 * **What is on it is the wave's decision, not this file's.** The wave names a
 * control set — the whole panel, both players, and never a combination — and
 * `packages/content/src/control-sets.ts` says what is in it. This file walks
 * that list. It does not know that the lance exists, only that a set may
 * contain a lobe called `lance` and that `layout.ts` has somewhere to put it.
 * That is what makes a panel something a person can be shown and argued with
 * rather than something implied by the order of the `if`s down here.
 *
 * A screen only draws the half it owns. The test view owns both, which is why
 * the five buttons have to fit beside each other at all.
 *
 * It is drawn on the canvas rather than in the DOM because every element is
 * per-column and has to line up with the grid exactly — see docs/decisions.md.
 *
 * **What it is made of is next door.** The plate used to be a `fillRect` and a
 * ruled line; it is the chamber under the hull now — `band-ground.ts` for the
 * tissue, `band-seam.ts` for the membrane it hangs from and the slime that
 * runs off it, `lobe-shell.ts` for the socket every control stands in. This
 * file still only decides *what is on the panel and where*.
 *
 * **All of it is the seat’s colour**, and that is one lookup here rather than
 * a decision in each of the five: `seatSkin(l.role)` is read once and handed
 * down, so the chamber, the light off the membrane, the slime and the feeders
 * cannot disagree about whose ship this is (`seat-skin.ts`).
 */
/**
 * Which panel a caller means. Its own function because two passes need the
 * answer now — the band itself, and the hover drawn over it (`hover.ts`) — and
 * a second copy of the fallback is exactly the kind of re-derivation CLAUDE.md
 * bans: a rule is called, never spelled out again.
 */
export function bandControlSet(controls: ControlSet | undefined, wave: number): ControlSet {
  return controls === undefined ? controlSetForWave(wave) : controls;
}

export function drawBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  armed: boolean,
  open: boolean,
  time: number,
  controls?: ControlSet,
): void {
  // A boss can take the controls away (`mirrorHoldsControls`). When it has,
  // the band is drawn dead and says so: a control that quietly does nothing
  // is indistinguishable from a control that is broken.
  const locked = mirrorHoldsControls(world);
  // `world.wave` is an index, and `controlSetForWave` reads it against the
  // shipped `WAVES` — correct for the phone, where the two always agree, and
  // wrong for a host playing a wave that is not in that array (the director's
  // own draft). `controls` is how such a host says which panel it actually
  // means; left unset, this falls back to the old inference, which is exactly
  // the game's behaviour today. Not `??`: that spelling is the pattern
  // `purity.test.ts` reserves for a *re-derivation* of `controlSetForWave`'s
  // own default, and this is a call to it, not a copy of it.
  const set = bandControlSet(controls, world.wave);
  const skin = seatSkin(l.role);
  const chamber = chamberPath(l, time);
  ctx.save();
  // The chamber, cut to the membrane above it — so the tissue is bounded by a
  // contour rather than by the top of a rectangle. Nothing traces that
  // contour: the ship’s flesh above it and the chamber’s first colour below
  // are the same colour, which is what makes the join invisible rather than
  // merely soft (`band-seam.ts`).
  drawSeamFlesh(ctx, l, skin);
  ctx.save();
  ctx.clip(chamber);
  drawBandGround(ctx, l, seamTop(l), skin);
  drawSeamSpill(ctx, l, skin);
  drawFeeders(ctx, l, feeders(l, set), time, skin);
  ctx.restore();
  drawDrips(ctx, l, time, skin);

  ctx.font = '9px "Courier New",monospace';
  ctx.textAlign = "center";

  if (showsCannon(l.role)) drawHalf(ctx, l, world, set, 1, armed, open);
  if (showsShield(l.role)) drawHalf(ctx, l, world, set, 2, armed, open);

  ctx.restore();
  if (locked) drawLock(ctx, l);
  ctx.textAlign = "left";
}

/**
 * Where a feeder from the membrane has to reach: every control this screen
 * carries, asked of the same `bandLobes` that draws and answers them, so a
 * tendril can never run to a button that is not there.
 */
function feeders(l: Layout, set: ControlSet): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const player of [1, 2] as const) {
    for (const lobe of bandLobes(l, set, player)) {
      out.push({ x: lobe.circle.x, y: lobe.circle.y - lobe.circle.r * 1.1 });
    }
  }
  return out;
}

/**
 * One seat's half of the panel, in the order the set lists it.
 *
 * `armed` and `open` are handed down rather than read here for the reason they
 * always were: they are windows the host is counting, not world state.
 */
function drawHalf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  player: 1 | 2,
  armed: boolean,
  open: boolean,
): void {
  for (const c of setControls(set, player)) {
    if (c.form === "strip") drawStripFor(ctx, l, world, c);
  }
  // The lobes come from `bandLobes` rather than from named fields of the
  // layout, and `touchDown` asks it the same question with the same set — so
  // there is one answer to "where is this button", not two that have to agree.
  for (const lobe of bandLobes(l, set, player)) {
    drawLobe(ctx, l, lobe.circle, lobe.control, world, armed, open);
  }
}

/*
 * **The panel does not say its own name, and it used to.** A named plate hung
 * on the seam whenever the wave was played on anything but the ordinary panel,
 * on the argument that a set is a whole panel and the surest way for that to
 * read wrong is for it to read as the usual band with something swapped in.
 *
 * The owner watched it over player 2's plate and said plainly: *do not show the
 * panel name or variant in the game.* He is right, and the standard ladder is
 * why. A rung is not a variant the pair is meant to notice — it is the panel
 * they have, and the whole of what the ladder is for is that the buttons they
 * hold are the ones the wave asks for and nothing announces the ones that are
 * missing. A label naming STANDARD 2 tells a player there is a STANDARD 3, which
 * is a fact about the game's construction and not about the wave in front of
 * them. Which panel a wave is played on is answered where that question is
 * actually asked: the CONTROLS page in the menu, and the director's own PANELS
 * tab (`tools/director/src/controlsets-page.ts`).
 */

/**
 * The band, put out.
 *
 * A scrim over the finished drawing rather than an alpha set before it: every
 * button in here reaches for `halo` or `reticle`, and both of those set
 * `globalAlpha` outright. Canvas alpha does not multiply, so anything set up
 * front is simply overwritten by the first child that has an opinion — which
 * is why the strips dimmed and the buttons did not.
 */
function drawLock(ctx: CanvasRenderingContext2D, l: Layout): void {
  const y = l.bandTop + l.bandHeight / 2;
  ctx.save();
  ctx.fillStyle = "rgba(7,4,15,.78)";
  ctx.fillRect(0, seamTop(l), l.width, l.bandTop + l.bandHeight - seamTop(l));
  ctx.fillStyle = "rgba(7,4,15,.72)";
  ctx.fillRect(0, y - 15, l.width, 30);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y - 15);
  ctx.lineTo(l.width, y - 15);
  ctx.moveTo(0, y + 15);
  ctx.lineTo(l.width, y + 15);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.red;
  ctx.font = '700 12px "Courier New",monospace';
  ctx.fillText("LOCKED — WATCH", l.width / 2, y + 4);
  ctx.restore();
  ctx.textAlign = "left";
}
