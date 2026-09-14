import { type Creature, veilArmourPhase, type World } from "@neon-spore/sim";
import { drawCaromCrust } from "./carom.js";
import { drawChute } from "./chute.js";
import { claspResonance, drawClaspShield } from "./clasp.js";
import { coilCharge, drawCoilDome, showsCoilCharge } from "./coil.js";
import type { Layout } from "./layout.js";
import { drawRecoilCage } from "./recoil.js";
import { drawVeerClown } from "./veer-clown.js";
import { drawVeilCloud, showsVeilCore } from "./veil.js";
import { drawVolleyShell } from "./volley.js";

/**
 * **What is laid over a body after the body is drawn** — a cloud, a rider, a
 * crust, a canopy, a shell, a cage, a dome, a membrane — one `if` per
 * creature that wears something, each an addition to whatever the table in
 * `creature-body.ts` drew and never a substitute for it. `creatures.ts`
 * calls this once per body, inside the perspective transform the body was
 * drawn in, so a covering grows and sits exactly as its body does.
 *
 * Its own file because this run is the part of the creature pass that grows:
 * the exclusive choice became a table the day a plain `if` severed the chain
 * it used to be, and what was left is one paragraph and one line for every
 * covering since. The next one goes here, and `creatures.ts` stays the walk.
 */
export function drawOverBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  beatPhase: number,
  near: number,
  /** The turn the body took this beat — the recoil's cage is lit in its colour. */
  turn: number,
  claspImage: CanvasImageSource | null,
): void {
  // The weather over that body, on both screens and identical on both — the
  // clasp's arrangement below, one creature earlier in the pass.
  if (c.kind === "veil") {
    const seen = showsVeilCore(l);
    const open = veilArmourPhase(world, c);
    drawVeilCloud(ctx, l, world.cfg, c, x, y, time, beats, near, open, seen);
  }
  // And THE CAROM's crust, on the same terms and for the same reason: it is
  // a shell around a body rather than a substitute for one, so `wornKind`
  // has already drawn the slick or the bulb burning inside it. Both screens
  // get the whole of it — nothing about a carom is split — so there is no
  // gate, only a draw of its own. Nothing is drawn for the rock it becomes:
  // by then `c.kind` is `meteor` and `drawMeteor`, through the table, has it.
  // THE VEER's rider, over the stone `drawMeteor` put down and outside the
  // frame that stone spins in: a face that rolled with the rock would be a
  // face carved into it (`veer-clown.ts`). Down here with the other things
  // laid *over* a body rather than beside the rock draw itself, which is the
  // seam `creature-body.ts` now holds: the exclusive choice is a table, and
  // everything here is an addition to whatever that table drew.
  if (c.kind === "veer") drawVeerClown(ctx, l, world.cfg, c, x, y, time, beatPhase);
  if (c.kind === "carom") drawCaromCrust(ctx, l, world.cfg, c, x, y, time, beatPhase, near);
  // And the body that came out of one: the same living draw above, with a
  // column of fire under it while it is still climbing and a canopy over it
  // once it has turned round (`chute.ts`). Both screens get the whole of it,
  // so there is no gate — only a draw of its own.
  if (c.kind === "chute") drawChute(ctx, l, world, c, x, y, time, beatPhase, near);
  // And THE VOLLEY's shell, on exactly the same terms: plating around a body
  // rather than a substitute for one, so `wornKind` has already drawn the
  // slick or the bulb sealed inside it. Both screens get the whole of it —
  // nothing about a volley is split — so there is no gate. Nothing is drawn
  // once the last plate goes: by then `c.kind` is the body's own and
  // `drawLiving` above has it (`volley.ts`).
  if (c.kind === "volley") drawVolleyShell(ctx, l, world.cfg, c, x, y, time, beatPhase, near);
  // And THE RECOIL's cage, on the same terms and for the same reason: it is
  // a frame around a body rather than a substitute for one, so `wornKind`
  // has already drawn the slick or the bulb inside it in whichever colour
  // this bounce left it. Both screens get the whole of it — nothing about a
  // recoil is split — so there is no gate. The last argument is the turn the
  // body took, because the cage is lit in the body's colour (`recoil.ts`).
  if (c.kind === "recoil") drawRecoilCage(ctx, l, world, c, x, y, time, near, turn);
  // The clasp's shield goes on *after* the body, because it is a membrane
  // around one and not a substitute for one — `wornKind` has already drawn
  // the slick or the bulb inside, in its own colour, which is what player 2
  // has to be able to read through it (`clasp.ts`).
  // And THE COIL's, on exactly the same terms one creature along: a membrane
  // around a **rock** rather than around a body, so `drawMeteor` has already
  // put the thing inside it down. What is different is the charge — how far
  // the bolt from the last dome to fail has come — and that is passed as
  // zero on player 2's screen, because which dome opens next is the one fact
  // this creature keeps from the seat that can move the plate (`coil.ts`).
  if (c.kind === "coil") {
    const charge = showsCoilCharge(l) ? coilCharge(world.cfg, world, c, beatPhase) : 0;
    drawCoilDome(ctx, l, world, c, x, y, time, near, charge, claspImage);
  }
  if (c.kind === "clasp") {
    drawClaspShield(
      ctx,
      l,
      world.cfg,
      x,
      y,
      time,
      near,
      claspResonance(world.shieldCol, c.col),
      claspImage,
    );
  }
}
