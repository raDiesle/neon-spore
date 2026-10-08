import {
  type BastionState,
  bastionBoss,
  bastionCharging,
  bastionGone,
  bastionGunAngle,
  bastionLitStep,
  bastionNext,
  bastionPieceCol,
  bastionPieceCount,
  bastionPlateOf,
  bastionPlateWay,
  bastionTarget,
  type Color,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE BASTION played right**, for the autopilot, a shell at a time:
 *
 * - **The plates**: each seat takes hold of its own next plate, carries it
 *   out along the plate's way past the tear, and lifts.
 * - **The ring**: the pilot turns the moon by its rim, the short way, until
 *   the next gun still on is at the front; then the cannon under the middle
 *   and the navigator fires the gun's colour. The rim is still while a bolt
 *   climbs, so the gun it was fired at is the gun it meets.
 * - **The lattice**: the navigator carries the shield under the charging
 *   node and the pilot raises it — THE SEAM's shield (`boss-hands-seam.ts`).
 * - **The port**: the pilot slides the cannon under it, and the navigator
 *   fires; either colour is taken, so cyan.
 *
 * **A drag a third of a beat**, THE LATCH's reason (`boss-hands-latch.ts`):
 * the rim and the plates are carried from where the simulation last heard
 * them, and a hand that sent again before that landed would send twice.
 */
type Press = Omit<TimedCommand, "tick">;

export const bastionHand = (w: World): Press[] => {
  const s = bastionBoss(w);
  const step = s === null ? null : bastionLitStep(s);
  if (s === null || step === null) return [];
  if (step.layer === "lattice") return shield(w, s);
  if (step.layer === "port") return shoot(w);
  const paced = w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) === 0;
  if (step.layer === "plates") return paced ? [...plate(w, s, 0), ...plate(w, s, 1)] : [];
  if (w.bullets.length > 0 || w.charge !== null) return [];
  const turn = paced ? spin(w, s) : [];
  return turn.length > 0 ? turn : shoot(w);
};

function plate(w: World, s: BastionState, seat: 0 | 1): Press[] {
  const target = seat === 0 ? "bastionPlateLeft" : "bastionPlateRight";
  const player = seat === 0 ? 1 : 2;
  const i = bastionPlateOf(s, seat);
  if (i < 0) return [];
  if (!s.down[seat]) return [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
  if (s.tore[seat]) return [{ player, command: { kind: "drag", target, on: false, fromMilli: 0 } }];
  const [wx, wy] = bastionPlateWay(i);
  const far = w.cfg.bastionPullMilli + 300;
  const fromMilli = Math.round((wx * far) / 1000);
  const fromYMilli = Math.round((wy * far) / 1000);
  return [{ player, command: { kind: "drag", target, on: true, fromMilli, fromYMilli } }];
}

/**
 * The rim carried towards the next gun still on, at most a quarter turn a
 * message so the short way round is never in doubt; let go once it is there.
 */
function spin(w: World, s: BastionState): Press[] {
  const step = bastionLitStep(s);
  if (step === null) return [];
  const count = bastionPieceCount(step);
  let gun = -1;
  for (let i = 0; i < count && gun < 0; i++) if (!bastionGone(s, i)) gun = i;
  if (gun < 0) return [];
  const turn = 360_000;
  let off = bastionGunAngle(s, gun, count);
  if (off > turn / 2) off -= turn;
  if (Math.abs(off) <= w.cfg.bastionFrontMilli / 2) {
    return s.spinning ? [rim(false, 0)] : [];
  }
  if (!s.spinning) return [rim(true, 0)];
  const delta = Math.max(-turn / 4, Math.min(turn / 4, -off));
  const moved = Math.round((delta * 6283 * w.cfg.bastionRimMilli) / (turn * 1000));
  return [rim(true, s.spinAtMilli + moved)];
}

function rim(on: boolean, fromMilli: number): Press {
  return { player: 1, command: { kind: "drag", target: "bastionSpin", on, fromMilli } };
}

function shoot(w: World): Press[] {
  const target = bastionTarget(w);
  if (target === null) return [];
  const color: Color = target.color === "either" ? "cyan" : target.color;
  const aim: Press = { player: 1, command: { kind: "cannonCol", col: target.col } };
  if (w.cannonCol !== target.col || onTheWay(w) > 0) return [aim];
  return [aim, { player: 2, command: { kind: "fire", color } }];
}

/** Bolts in the muzzle or climbing: one at a time, so none is left over for the next piece. */
function onTheWay(w: World): number {
  return (w.charge === null ? 0 : 1) + w.bullets.length;
}

function shield(w: World, s: BastionState): Press[] {
  if (!bastionCharging(s)) return [];
  const col = bastionPieceCol(w, s, bastionNext(s));
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
