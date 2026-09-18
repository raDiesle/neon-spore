import {
  type Color,
  type Creature,
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainSoftAt,
  fleetOnBoard,
  fleetRows,
  fleetShipAt,
  fleetStruck,
  gorgeBoss,
  gorgeFull,
  gorgePhase,
  hiveBoss,
  hiveOpen,
  isMeteorKind,
  occupiesCol,
  scuttleBoss,
  scuttleShootable,
  scuttleSocketCol,
  scuttleWinding,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the bosses of the field** — THE FLEET, THE GORGE, THE
 * CURTAIN, THE SCUTTLE, THE HIVE — each a `Hand` (`poses-bosses-kit.ts`).
 * Like the shot hands (`boss-hands-shots.ts`), each is the fight's own rule
 * played straight: the cannon under the thing to hit, the colour it is
 * showing, the shot when the cannon is free. What these five add is a second
 * verb beside the shot — the sights walked a square, a thumb held for the
 * beam, the fabric carried a column — and the hand does that the way the
 * pair does, one press a tick, reading the field for where it has got to.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const thumb = (on: boolean, color: Color): Press => ({
  player: 2,
  command: { kind: "prime", on, color },
});

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE FLEET: the navigator walks the sights a square a tick toward the
 * nearest square of a ship not yet fired at, and the pilot's salvo goes the
 * tick they stand on it. The pair cannot see the ships and plays this by
 * calling squares; the hand reads them, because what it is posing is a hit
 * and a sinking, not the search.
 */
export const fleetHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "fleet") return [];
  let best: { col: number; row: number } | null = null;
  for (let row = 0; row < fleetRows(w.cfg); row++) {
    for (let col = 0; col < w.cfg.cols; col++) {
      if (!fleetOnBoard(w.cfg, col, row) || fleetShipAt(b.ships, col, row) === -1) continue;
      if (fleetStruck(w, b, col, row)) continue;
      const d = Math.abs(col - b.aimCol) + Math.abs(row - b.aimRow);
      if (best === null || d < Math.abs(best.col - b.aimCol) + Math.abs(best.row - b.aimRow))
        best = { col, row };
    }
  }
  if (best === null) return [];
  const dcol = Math.sign(best.col - b.aimCol) as -1 | 0 | 1;
  const drow = Math.sign(best.row - b.aimRow) as -1 | 0 | 1;
  if (dcol !== 0 || drow !== 0) return [{ player: 2, command: { kind: "aim", dcol, drow } }];
  return [{ player: 1, command: { kind: "salvo" } }];
};

/** THE GORGE's intakes, outermost first: the order the sack is pierced in. */
const GORGE_ORDER = [0, 6, 1, 5, 2, 4, 3];

/** A thumb on intake `id` of THE GORGE: the pinch is player 1's, the pry player 2's. */
const lobe = (player: 1 | 2, on: boolean, id: number): Press => ({
  player,
  command: { kind: "drag", target: "gorgeLobe", on, fromMilli: 0, fromYMilli: 0, id },
});

/**
 * THE GORGE: an intake fills with its own colour, four beads, and the next
 * shot of that colour ruptures it (`gorgeStruck`) — so the hand feeds the
 * outermost unpierced intake its colour until it goes, pinching it the tick
 * it comes full so the vent waits (`gorge-hand.ts`), and moves in. Gorged,
 * the mouth takes only the lance in its colour under the pry, and the pry is
 * a window shorter than two fills: the thumb goes over the colour first,
 * then the pry, and both lift once spent (`gorge-pry.ts`).
 */
export const gorgeHand: Hand = (w) => {
  const g = gorgeBoss(w);
  if (g === null || g.outBeat >= 0) return [];
  if (gorgePhase(g, w.cfg) === "gorged") {
    const mouth = g.intakes[g.mouth];
    if (mouth === undefined || mouth.color === null) return [];
    // A pry thrown off spat a bead: the thumb comes off a short mouth, and
    // goes back on with the fill, after the thumb is on the colour.
    if (!gorgeFull(mouth, w.cfg)) return g.pry < 0 ? [] : [lobe(2, false, g.mouth)];
    const col = g.col + g.mouth;
    if (w.cannonCol !== col) return [aim(col)];
    if (w.prime?.spent) return [thumb(false, w.prime.color), lobe(2, false, g.mouth)];
    if (w.prime === null) return [thumb(true, mouth.color)];
    return g.pry < 0 ? [lobe(2, true, g.mouth)] : [];
  }
  const i = GORGE_ORDER.find((k) => g.intakes[k]?.ruptured === false);
  if (i === undefined) return [];
  const k = g.intakes[i];
  if (k !== undefined && gorgeFull(k, w.cfg) && g.pinch < 0) return [lobe(1, true, i)];
  const col = g.col + i;
  if (w.cannonCol !== col) return [aim(col)];
  return free(w) ? [fire(k?.color ?? "red")] : [];
};

/**
 * THE CURTAIN: the pilot's hand on the fabric, carried the way that clears
 * the core soonest — one more tile than the carry has spent, every tick, so
 * the fabric steps a column each time the pause lets it (`carryGrips`). The
 * navigator's bolt takes a soft lobe while the core is covered, and the
 * core's own colour up its column once it is bare (`curtainStruck`). With
 * `core` false the navigator leaves the bare core alone and keeps to the
 * lobes: every core hit drops a lobe as well, so a hand that took the core
 * would put it out before the fabric was bare — the tear is the pilot's
 * shove with nothing left to shove (`curtainTorn`).
 */
export function curtainHandWith(core: boolean): Hand {
  return (w) => {
    const c = curtainBoss(w);
    if (c === null || c.outBeat >= 0) return [];
    const body = curtainBody(w, c);
    const out: Press[] = [];
    if (body !== undefined) {
      const dir = shoveDir(w, c, body);
      const spent = w.pushP1?.cols ?? 0;
      out.push({ player: 1, command: { kind: "grip", id: body.id } });
      out.push({
        player: 1,
        command: {
          kind: "drag",
          target: "gripBody",
          on: true,
          fromMilli: (spent + dir) * w.cfg.gripPushMilli,
          id: body.id,
        },
      });
    }
    if (core && curtainCoreBare(w, c)) {
      out.push(aim(c.coreCol));
      if (free(w) && w.cannonCol === c.coreCol) out.push(fire(c.coreColor));
      return out;
    }
    if (body === undefined) return out;
    let soft = -1;
    for (let col = 0; col < w.cfg.cols; col++) {
      if (!curtainSoftAt(body, c, col)) continue;
      if (soft < 0 || Math.abs(col - w.cannonCol) < Math.abs(soft - w.cannonCol)) soft = col;
    }
    if (soft < 0) return out;
    out.push(aim(soft));
    if (free(w) && w.cannonCol === soft) out.push(fire("red"));
    return out;
  };
}

export const curtainHand: Hand = curtainHandWith(true);

/**
 * Which way the fabric goes: the way that clears the core soonest — unless a
 * standing lobe has been carried off the field, where no bolt reaches it,
 * in which case back toward the field (`curtainReach` lets the fabric hang
 * past either wall).
 */
function shoveDir(w: World, c: CurtainState, body: Creature): 1 | -1 {
  const standing = c.lobes.flatMap((up, i) => (up ? [body.col + i] : []));
  if (standing.some((col) => col < 0)) return 1;
  if (standing.some((col) => col >= w.cfg.cols)) return -1;
  return c.coreCol - body.col < c.lobes.length / 2 ? 1 : -1;
}

/**
 * THE SCUTTLE: the live socket's colour up the live socket's column while
 * a part is there to shoot (`scuttleStruck`); winding the last one back,
 * only the lance lands, so the thumb goes down over the socket and lifts
 * once spent.
 */
export const scuttleHand: Hand = (w) => {
  const s = scuttleBoss(w);
  if (s === null || s.downBeat >= 0 || s.live < 0) return [];
  const col = scuttleSocketCol(w.cfg, s.live);
  if (w.cannonCol !== col) return [aim(col)];
  if (scuttleWinding(s)) {
    if (w.prime?.spent) return [thumb(false, w.prime.color)];
    return w.prime === null ? [thumb(true, s.parts[s.live]?.color ?? "red")] : [];
  }
  if (!scuttleShootable(s)) return [];
  return free(w) ? [fire(s.parts[s.live]?.color ?? "red")] : [];
};

/**
 * THE HIVE: an open breach's colour up its column seals it (`hiveStruck`).
 * The spill down a column eats a bolt (`hole`) and the beam stops at a rock
 * (`burnColumn`), so the hand takes the first open breach whose column is
 * clear of rocks, the way the pair picks the cell nothing is falling from.
 * Sealed cells are left alone: a bolt into one provokes the next opening.
 */
export const hiveHand: Hand = (w) => {
  const s = hiveBoss(w);
  if (s === null || s.downBeat >= 0) return [];
  for (let i = 0; i < s.opened; i++) {
    if (!hiveOpen(s, i)) continue;
    const col = s.cols[i] ?? 0;
    if (w.creatures.some((c) => isMeteorKind(c.kind) && occupiesCol(c, col))) continue;
    if (w.cannonCol !== col) return [aim(col)];
    return free(w) ? [fire(s.colors[i] ?? "red")] : [];
  }
  return [];
};
