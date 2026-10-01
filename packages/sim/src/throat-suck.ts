import { removeCreature } from "./field.js";
import { isMeteorKind, livingKindForColor } from "./kinds.js";
import { takeCargo } from "./pod-intake.js";
import { openSlow } from "./slow.js";
import {
  type ThroatMode,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatRadiusMilli,
  throatSpent,
} from "./throat.js";
import { throatModeSeat } from "./throat-hand.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE THROAT's suck**, every tick: the pump eases off, and whatever is in
 * the circle round the mouth is swallowed or refused.
 *
 * On the tick and not the beat because the mouth moves with a thumb
 * (`throat-hand.ts`): a body the navigator carries the mouth over has to go
 * the moment it is inside, or the carry would not feel like the thing that
 * did it.
 *
 * **What each colour swallows** is the ordinary panel's answer to each body,
 * called and not re-derived: red and cyan take the living kind of their
 * colour (`livingKindForColor`), SHIELD takes a rock (`isMeteorKind`), SUCK
 * takes a pod and gives its cargo as the maw would (`takeCargo`). A husk is
 * never taken — it is a lie the maw is for refusing, and this mouth cannot
 * see the difference any better than the maw can.
 *
 * **A body in the wrong colour is refused and stays.** No damage, no miss on
 * the sheet: it shakes where it is (render reads `refusedId`) and the sound
 * says so once per `throatRefuseTicks`, so a body sitting in the circle is
 * one refusal and not sixty a second. It keeps falling as it was, which is
 * the whole cost of the mistake.
 */
export function stepThroatSuck(world: World): void {
  const b = throatBoss(world);
  if (b === null || b.phase !== "sucks") return;
  b.pumpMilli = Math.max(0, b.pumpMilli - world.cfg.throatPumpDecayMilli);
  const r = throatRadiusMilli(world.cfg, b);
  if (r <= 0) return;
  const r2 = r * r;
  for (const c of [...world.creatures]) {
    if (!inside(b, c.col * 1000, c.row * 1000, r2) || !suckable(c)) continue;
    if (takes(b.mode, c)) {
      removeCreature(world, c.id);
      swallowed(world, b);
    } else refuse(world, b, c.id);
    if (b.phase !== "sucks") return;
  }
  for (const p of [...world.pods]) {
    if (p.husk || !inside(b, p.colMilli, p.rowMilli, r2)) continue;
    if (b.mode !== "suck") {
      refuse(world, b, p.id);
      continue;
    }
    world.pods = world.pods.filter((q) => q.id !== p.id);
    takeCargo(world, throatMouthCol(b), p.kind);
    swallowed(world, b);
    if (b.phase !== "sucks") return;
  }
}

function inside(b: ThroatState, x: number, y: number, r2: number): boolean {
  const dx = x - b.aimXMilli;
  const dy = y - b.aimYMilli;
  return dx * dx + dy * dy <= r2;
}

/** The bodies a colour could answer at all — a boss's own parts, a span or a
 * worn shell are not this mouth's to take. */
function suckable(c: Creature): boolean {
  return (c.span ?? 1) <= 1 && c.wears === undefined;
}

/** Whether this colour swallows this body. */
export function throatTakes(mode: ThroatMode, c: Creature): boolean {
  return takes(mode, c);
}

function takes(mode: ThroatMode, c: Creature): boolean {
  switch (mode) {
    case "red":
    case "cyan":
      return c.kind === livingKindForColor(mode) && c.color === mode;
    case "shield":
      return isMeteorKind(c.kind);
    case "suck":
      return false;
  }
}

function swallowed(world: World, b: ThroatState): void {
  b.slack += 1;
  b.fedBeat = world.beat;
  const col = throatMouthCol(b);
  world.events.push({ type: "throatSwallow", col });
  if (!throatSpent(world.cfg, b)) return;
  b.phase = "everts";
  b.phaseBeat = world.beat;
  b.pumpMilli = 0;
  openSlow(world, world.cfg.throatEvertBeats, "show");
  world.events.push({ type: "throatEvert", col });
}

function refuse(world: World, b: ThroatState, id: number): void {
  if (b.refusedId === id && world.tick - b.refusedTick < world.cfg.throatRefuseTicks) return;
  b.refusedId = id;
  b.refusedTick = world.tick;
  // The refusal is the mouth's colour's, and the colour belongs to a seat.
  const player = throatModeSeat(b.mode);
  world.events.push({ type: "throatRefuse", col: throatMouthCol(b), part: b.mode, player });
}
