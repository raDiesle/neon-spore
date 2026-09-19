import {
  type Color,
  type Creature,
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainSoftAt,
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
 * **The pair's hands on the bosses of the field** — THE GORGE, THE CURTAIN,
 * THE SCUTTLE, THE HIVE — each a `Hand` (`poses-bosses-kit.ts`); THE FLEET's
 * grew to three states and a page of its own (`boss-hand-fleet.ts`).
 * Like the shot hands (`boss-hands-shots.ts`), each is the fight's own rule
 * played straight: the cannon under the thing to hit, the colour it is
 * showing, the shot when the cannon is free. What these five add is a second
 * verb beside the shot — a thumb held for the beam, the fabric carried a
 * column — and the hand does that the way the
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

/** THE CURTAIN's hem, carried `milli` **up** from where the thumb grabbed. */
const hemUp = (milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "curtainHem", on: true, fromMilli: 0, fromYMilli: -milli },
});

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
 *
 * **Pinned, the hand changes gesture**, because the fight does: a hit jams
 * the rail for `curtainPinBeats` and the shove is refused whole, so the
 * pilot's thumb goes under the hem and holds it at the top instead. The gap
 * over the core is open while it is held and shuts the tick it is not
 * (`sim/curtain-hand.ts`), so the press is sent every tick rather than once.
 */
export function curtainHandWith(core: boolean): Hand {
  return (w) => {
    const c = curtainBoss(w);
    if (c === null || c.phase === "out") return [];
    const body = curtainBody(w, c);
    const out: Press[] = [];
    if (c.phase === "pinned") {
      out.push(hemUp(w.cfg.curtainLiftMilli));
    } else if (body !== undefined) {
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
