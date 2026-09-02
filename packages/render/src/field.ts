import { showsRadar } from "@neon-spore/content";
import { bodyCenterCol, isMeteorKind, spanOf, type World } from "@neon-spore/sim";
import { drawBackdrop } from "./backdrop.js";
import { needsComms } from "./comms.js";
import { drawEyeGlyph } from "./comms-glyphs.js";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { type Layout, tileCX } from "./layout.js";
import { drawRadarLureMark } from "./lure-alarm.js";
import { PALETTE } from "./palette.js";
import { drawRadarVeilMark } from "./veil-question.js";

/**
 * The field itself: the background, its depth, the cannon's column marker,
 * and the radar strip along the top edge.
 *
 * docs/spec/systems.md 5.8 asks for grid lines and crossing points that light
 * up on every beat and fade, because the pulse is the thing both players share
 * across a voice delay. That lattice is written and switched off — see
 * `SHOW_TILE_GRID`.
 */
/** Depends only on `l.width` and `l.playHeight` — one gradient per layout,
 * not one per frame. */
const backgroundSlot = gradientSlot<CanvasGradient>();

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  wave: number,
  time: number,
): void {
  const g = slotGradient(ctx, backgroundSlot, `${l.width},${l.playHeight}`, () => {
    const grad = ctx.createRadialGradient(
      l.width / 2,
      l.playHeight * 0.2,
      10,
      l.width / 2,
      l.playHeight * 0.2,
      Math.max(l.width, l.playHeight),
    );
    grad.addColorStop(0, "#1D1547");
    grad.addColorStop(1, "#08060F");
    return grad;
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, l.height);
  drawBackdrop(ctx, l, wave, time);
}

/**
 * The tile lattice is off. It reads as decoration today: nothing in the game
 * asks a player to name a coordinate, so the lines only compete with the
 * silhouettes. Flip this back on when a mechanic needs a player to call out a
 * square — a catapult shot aimed at a column and a row — and the grid becomes
 * the thing being read out loud rather than a texture behind it.
 *
 * The cannon's column marker below is not part of it and stays.
 */
const SHOW_TILE_GRID = false;

/**
 * `flash` is 1 on the beat and decays to 0 before the next one. It is derived
 * from `beatPhase`, never stored — the simulation has no notion of a fade.
 */
/** Depends only on `l.gridTop` and `l.gridHeight` — the same gradient at
 * every column, so it is keyed on neither `cannonCol` nor `flash`. */
const cannonColumnSlot = gradientSlot<CanvasGradient>();

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cannonCol: number,
  flash: number,
  beatPhase: number,
): void {
  if (SHOW_TILE_GRID) drawTiles(ctx, l, flash);

  drawBeatSweep(ctx, l, beatPhase);

  // The cannon's own column, straight up. Spec 5.8: this is the only path
  // marker left in the field — everything else is read off the radar.
  const x = tileCX(l, cannonCol);
  const cg = slotGradient(ctx, cannonColumnSlot, `${l.gridTop},${l.gridHeight}`, () => {
    const grad = ctx.createLinearGradient(0, l.gridTop, 0, l.gridTop + l.gridHeight);
    grad.addColorStop(0, "rgba(47,224,240,0)");
    grad.addColorStop(1, "rgba(47,224,240,.16)");
    return grad;
  });
  ctx.fillStyle = cg;
  ctx.fillRect(x - l.tile / 2, l.gridTop, l.tile, l.gridHeight);
}

/**
 * The beat itself, travelling: a soft band starts at the very top of the grid
 * on the beat and crosses down to the hull over the beat's length, fading as
 * it goes. `backdrop.ts` hangs its horizon near the top of this same span, so
 * the pulse reads as passing *over* it rather than the horizon sitting on top
 * of the grid as a second, static layer — `beatPhase` alone drives it, so it
 * never drifts out of step between the two screens the way a wall clock would.
 */
function drawBeatSweep(ctx: CanvasRenderingContext2D, l: Layout, beatPhase: number): void {
  if (l.gridHeight <= 0 || l.width <= 0) return;
  const alpha = (1 - beatPhase) * 0.1;
  if (alpha <= 0.002) return;
  const y = l.gridTop + beatPhase * l.gridHeight;
  const half = Math.max(1, l.tile * 0.6);
  const g = ctx.createLinearGradient(0, y - half, 0, y + half);
  g.addColorStop(0, "rgba(164,147,232,0)");
  g.addColorStop(0.5, `rgba(164,147,232,${alpha})`);
  g.addColorStop(1, "rgba(164,147,232,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y - half, l.width, half * 2);
}

/** Lines on every tile edge, brighter crossings, both pulsing on the beat. */
function drawTiles(ctx: CanvasRenderingContext2D, l: Layout, flash: number): void {
  ctx.strokeStyle = `rgba(124,107,196,${0.07 + 0.3 * flash})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= l.cols; c++) {
    const x = l.gridLeft + c * l.tile;
    ctx.moveTo(x, l.gridTop);
    ctx.lineTo(x, l.gridTop + l.gridHeight);
  }
  for (let r = 0; r <= l.rows; r++) {
    const y = l.gridTop + r * l.tile;
    ctx.moveTo(l.gridLeft, y);
    ctx.lineTo(l.gridLeft + l.gridWidth, y);
  }
  ctx.stroke();

  // The crossing points are the places everything snaps to, so they carry the
  // pulse more strongly than the lines do.
  ctx.fillStyle = `rgba(164,147,232,${0.18 + 0.5 * flash})`;
  const s = 1.2 + 1.6 * flash;
  for (let c = 0; c <= l.cols; c++) {
    for (let r = 0; r <= l.rows; r++) {
      ctx.fillRect(l.gridLeft + c * l.tile - s / 2, l.gridTop + r * l.tile - s / 2, s, s);
    }
  }
}

/**
 * Radar: arrivals only, along the top edge, in the colour of the thing that is
 * coming. Height encodes order — the closer to the edge, the sooner. There are
 * deliberately no trajectory lines inside the field, not even for meteors
 * (docs/spec/systems.md 5.8), because reading the field out loud is the game.
 *
 * The dart is the one exception and it is not a loophole: its column *expires*
 * while you are saying it, so `dart-path.ts` draws where it is going — on one
 * screen only, and never the screen holding the cannon that has to be there.
 */
export function drawRadar(ctx: CanvasRenderingContext2D, l: Layout, world: World, time = 0): void {
  const lead = world.cfg.radarLead;
  ctx.save();
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i]!;
    if (!showsRadar(l.role, q.kind)) continue;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;

    // A veil borrows no colour, and this is the one place it could have. Its
    // queue entry carries none — the body inside is rolled when it enters the
    // field — so the ternary below would have fallen through to cyan and made
    // the strip announce a colour that is right half the time. `PALETTE.dim`
    // is this game's "nothing to say about this", and `drawRadarVeilMark`
    // puts the question mark on top of it.
    const hex =
      q.kind === "veil"
        ? PALETTE.dim
        : isMeteorKind(q.kind)
          ? PALETTE.rock
          : q.color === "red"
            ? PALETTE.red
            : PALETTE.cyan;
    // `q.col` is a wide kind's leftmost column (see `spanCenterCol` in
    // sim/types.ts) — the blip itself is drawn at the visual centre.
    const x = tileCX(l, bodyCenterCol(q, q.col));
    // How wide the thing being warned about actually is. Asked of the entry
    // rather than of its kind: the torch is no longer the only two-tile rock,
    // and a blip drawn one tile wide over a rock that covers two is a warning
    // that names the wrong number of columns out loud.
    const span = spanOf(q);
    const y = l.gridTop - 7 - inBeats * ((l.radarHeight - 12) / lead);
    const a = Math.max(0.18, 1 - inBeats / (lead + 1));
    const s = 5 + 4 * (1 - inBeats / (lead + 1));

    if (span > 1) {
      // As wide as the shape it warns about, and pulsing — the blip on the
      // strip that is never mistaken for a single-tile rock.
      const pulse = 0.7 + 0.3 * Math.sin(time * 6);
      const spread = (l.tile * (span - 0.4)) / 2;
      ctx.globalAlpha = a * pulse;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 1.15);
      ctx.lineTo(x - spread, y - s * 0.55);
      ctx.lineTo(x + spread, y - s * 0.55);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.lineTo(x - s * 0.85, y - s * 0.55);
      ctx.lineTo(x + s * 0.85, y - s * 0.55);
      ctx.closePath();
      ctx.fill();
    }

    // Player 2's alarm, over the blip and never instead of it: the blip's
    // colour is still what has to be said out loud so that player 1 knows
    // which body is meant. Player 1's strip cannot carry this at all — it
    // shows `guard` kinds only, and a lure is an `aim` kind like the two
    // bodies it wears (`showsRadar` above is the whole gate).
    drawRadarLureMark(ctx, l, q.kind, x, y);

    // And the one blip that is not a colour at all. A veil's queue entry
    // carries none — the body inside is rolled when it enters the field — so
    // the tint above fell through to cyan, which would have been a confident
    // announcement that is right half the time. `drawRadarVeilMark` paints a
    // question mark over it instead. docs/spec/systems.md 5.2 asked for this
    // shape by name.
    drawRadarVeilMark(ctx, q.kind, x, y, a);

    // And the mark that is not about this creature at all but about the two of
    // them: an eye over every blip whose secret is split across the screens.
    // The siren in the corner (`siren.ts`) says a call is on; this says which
    // blip it is about, which is the half a corner instrument cannot carry.
    // `comms.ts` owns the roster, so a creature joining it lights up here
    // without this file learning its name.
    if (needsComms(q.kind)) drawEyeGlyph(ctx, x, y - s - 7, 5.6, PALETTE.text, a * 0.9);

    // About to enter: mark the edge of its column.
    if (inBeats <= 0) {
      const width = span > 1 ? l.tile * (span - 0.4) : l.tile * 0.72;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(x - width / 2, l.gridTop - 2.5, width, 2.5);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
