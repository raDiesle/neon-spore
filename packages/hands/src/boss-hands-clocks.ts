import {
  type Color,
  type LeadState,
  leadBoss,
  leadGrippable,
  leadHolding,
  leadLead,
  leadPassDir,
  leadStill,
  leadWalk,
  ledgerBoss,
  ledgerLetThrough,
  ledgerNext,
  ledgerPhase,
  ledgerSeamCol,
  otherColor,
  type SimConfig,
  spentOver,
  type TimedCommand,
  tasterBoss,
  tasterLifted,
  tasterPhase,
  tasterPried,
  tasterWindow,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the bosses that keep a ledger of their own** — THE
 * TASTER, THE LEDGER, THE LEAD — each a `Hand` (`hand.ts`).
 * These three are not answered by a shot but by *which* shot, or by none:
 * the fan grows toward the colour the pair leans on and breaks to the
 * other; the cord bills every bolt once it whips, and the plate answers the
 * bill; the body reads the beat a bolt was pressed on and is where the
 * pair's sum says. So each hand keeps the count the pair keeps — off the
 * ship's own ledger (`spentOver`) and the boss's own readers, never a clock
 * of its own — and presses, or holds off, on what the count says.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const trigger = (): Press => ({ player: 1, command: { kind: "guard" } });
const ward = (col: number): Press => ({ player: 2, command: { kind: "shieldCol", col } });
const thumb = (on: boolean, color: Color): Press => ({
  player: 2,
  command: { kind: "prime", on, color },
});
/** THE TASTER's interlock, hauled all the way apart by the pilot (`sim/taster-hand.ts`). */
const pry = (cfg: SimConfig): Press => ({
  player: 1,
  command: {
    kind: "drag",
    target: "tasterLock",
    on: true,
    fromMilli: 0,
    fromYMilli: cfg.tasterPryMilli,
  },
});

/** THE LEAD's stalk, taken by the navigator while the body stands still (`sim/lead-hand.ts`). */
const stalk = (on: boolean): Press => ({
  player: 2,
  command: { kind: "drag", target: "leadStalk", on, fromMilli: 0, fromYMilli: 0 },
});

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;
/** The first tick of a beat, where a fill has to start to finish on one. */
const onBeat = (w: World): boolean => w.tick % ticksPerBeat(w.cfg) === 0;

/**
 * THE TASTER: a set blade breaks to the colour opposite its edge, so the
 * hand shoots the nearest standing edged blade with the other colour
 * (`tasterStruck`). Hurrying, the crest re-edges to the lean until it is
 * cut through — four bolts into a shorn column (`tasterLifted`). Closed,
 * only a beam in the colour the pair has spent *least* of opens it, judged
 * after the beam's own spend: the hand fires the majority colour into the
 * crest until the margin is safe, then hauls the interlock apart and holds
 * the minority down inside the same tick. The two go together because the
 * window is `tasterPryBeats` and the fill is `lancePrimeBeats`, and starting
 * the fill after the haul is the only order that lands inside it. The margin
 * is one more than the beams still owed (`tasterPryFills`), because each
 * beam's own spend narrows it by one and the last must still find it leaning.
 */
export const tasterHand: Hand = (w) => {
  const t = tasterBoss(w);
  if (t === null || t.outBeat >= 0) return [];
  const phase = tasterPhase(t, w.cfg);
  if (w.prime?.spent) return [thumb(false, w.prime.color)];
  if (phase === "closed") {
    const col = t.col + t.blades.findIndex((b) => b.shorn);
    if (w.cannonCol !== col) return [aim(col)];
    const red = spentOver(w, tasterWindow(t, w.cfg), "red");
    const cyan = spentOver(w, tasterWindow(t, w.cfg), "cyan");
    const hi: Color = red >= cyan ? "red" : "cyan";
    if (Math.abs(red - cyan) > w.cfg.tasterPryFills - t.pryFills) {
      const out: Press[] = [];
      // Again if the window shut with nothing in it: the fan locks back over
      // the body and the haul is simply made afresh (`taster-step.ts`).
      if (!tasterPried(t, w.beat, w.cfg)) out.push(pry(w.cfg));
      if (w.prime === null) out.push(thumb(true, otherColor(hi)));
      return out;
    }
    return free(w) ? [fire(hi)] : [];
  }
  if (phase === "hurrying" && !tasterLifted(t)) {
    const col = t.col + t.blades.findIndex((b) => b.shorn);
    if (w.cannonCol !== col) return [aim(col)];
    return free(w) ? [fire("red")] : [];
  }
  let best = -1;
  for (let i = 0; i < t.blades.length; i++) {
    const b = t.blades[i];
    if (b === undefined || b.shorn || b.edge === null) continue;
    if (best < 0 || Math.abs(t.col + i - w.cannonCol) < Math.abs(t.col + best - w.cannonCol))
      best = i;
  }
  if (best < 0) return [];
  const col = t.col + best;
  if (w.cannonCol !== col) return [aim(col)];
  const edge = t.blades[best]?.edge ?? "red";
  return free(w) ? [fire(otherColor(edge))] : [];
};

/**
 * THE LEDGER: the plate stands on the socket and the trigger is pressed
 * the beat a return lands, so every bill is answered (`ledgerWard`) — and
 * the socket walks after each, so the plate follows it. The seam takes the
 * colour it wants up its column while the cord is quiet; whipping, every
 * bolt bills a return, so the hand shoots only when no bead is on the way.
 * The last return is let through: the plate steps off the socket and the
 * trigger stays up (`ledgerLetThrough`).
 */
export const ledgerHand: Hand = (w) => {
  const t = ledgerBoss(w);
  if (t === null || t.outBeat >= 0) return [];
  const cfg = w.cfg;
  if (ledgerLetThrough(t)) return [ward((t.socket + 2) % cfg.cols)];
  const out: Press[] = [ward(t.socket)];
  const next = ledgerNext(t);
  if (next !== null && next.beat - w.beat <= 1) out.push(trigger());
  if (ledgerPhase(t, cfg, w.beat) === "rooting" || t.beads.length > 0 || !free(w)) return out;
  const seam = ledgerSeamCol(t, cfg);
  // The fourth hit's bead is billed at the muzzle, and a return warded while
  // the cord whips widens the seam by itself — so the last hit is any bolt
  // into the plating, refused but billed, and the plate does the rest.
  const col = t.seam < cfg.ledgerSeamHits - 1 ? seam : seam + 1;
  if (w.cannonCol !== col) {
    out.push(aim(col));
    return out;
  }
  out.push(fire(t.want));
  return out;
};

/**
 * THE LEAD: the pair's sum — the cannon in the column the body will be in
 * when a bolt pressed on this beat is judged (`leadLead`), and the bolt the
 * tick after the cannon has stepped there, which is the same beat. Still,
 * the body takes only a beam standing in its column on a pass beat, so the
 * cannon goes to the column that pass starts from, the thumb goes down
 * `lancePrimeBeats` before it, and lifts once spent. `late` is which pass
 * beat the beam stands on: the first (0) is the fight played straight; a
 * later one poses the pass itself, which the beam on the first beat would
 * end before it showed. A beam short of `leadStillFills` stops the body dead
 * where it met it, a whole new still, and the same reading answers it again.
 */
export function leadHandLate(late: number): Hand {
  return (w) => {
    const s = leadBoss(w);
    if (s === null || s.downBeat >= 0) return [];
    if (w.prime?.spent) return [thumb(false, w.prime.color)];
    if (leadStill(s)) {
      const col = leadPassCol(s, w.cfg, late);
      if (w.cannonCol !== col) return [aim(col)];
      if (w.prime !== null || !onBeat(w)) return [];
      const stands = s.stillBeat + w.cfg.leadStillBeats + 1 + late;
      return w.beat + w.cfg.lancePrimeBeats === stands ? [thumb(true, "red")] : [];
    }
    // Passing, the cannon stays where the still put it: a step would spill the fill.
    if (s.passBeat >= 0) return [];
    const col = leadLead(s, w.cfg);
    if (w.cannonCol !== col) return [aim(col)];
    return free(w) && !onBeat(w) ? [fire("red")] : [];
  };
}

/** The column the body starts its `late`-th pass beat from — a column that pass goes through. */
function leadPassCol(s: LeadState, cfg: SimConfig, late: number): number {
  let at = { col: s.col, dir: leadPassDir(s.col, cfg) };
  for (let i = 0; i < late; i++) at = leadWalk(at.col, at.dir, cfg.leadPassCols, cfg);
  return at.col;
}

export const leadHand: Hand = leadHandLate(0);

/**
 * THE LEAD with the still held open: the same fight with the navigator's
 * thumb on the stalk, which is the one state of this boss a hand may reach
 * into at all (`sim/lead-hand.ts`).
 *
 * One press and no second: `leadHeard` writes `heldBeat` the tick the thumb
 * lands, and a hand that pressed again every tick would be writing a fresh
 * beat over it and holding a fuse that never burns down. So the stalk is
 * taken while it is on offer and nothing is said after — the thumb is down
 * until she lifts it or `leadHoldBeats` tears it out of her.
 *
 * The cannon goes where the pass will start from meanwhile, which is the
 * whole point of the beats she is buying, and the fill is left to the pose
 * that is about the fill (`leadHandLate`): a prime started here would end the
 * fight before the hold had shown.
 */
export const leadHoldHand: Hand = (w) => {
  const s = leadBoss(w);
  if (s === null || s.downBeat >= 0) return [];
  if (leadGrippable(s)) return [stalk(true)];
  if (!leadHolding(s)) return leadHand(w);
  const col = leadPassCol(s, w.cfg, 0);
  return w.cannonCol === col ? [] : [aim(col)];
};
