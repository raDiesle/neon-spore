import {
  type Color,
  type Creature,
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainSoftAt,
  gorgeBoss,
  gorgeBottom,
  gorgeColOf,
  gorgeDue,
  gorgeOffers,
  gorgePhase,
  gorgeRowOf,
  gorgeSated,
  gorgeTapSeat,
  type ScuttleState,
  scuttleBoss,
  scuttlePartCol,
  scuttleShootable,
  scuttleSwingable,
  scuttleSwingCol,
  scuttleWinding,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { fieldHand } from "./autopilot-field-hand.js";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the bosses of the field** — THE GORGE, THE CURTAIN,
 * THE SCUTTLE — each a `Hand` (`hand.ts`); THE FLEET's grew to
 * three states and a page of its own (`boss-hand-fleet.ts`), and THE HIVE's
 * to two thumbs and `boss-hand-hive.ts`.
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

/** A press of the pilot's thumb on bubble `id` of THE GORGE's ring: one tap. */
const tap = (id: number): Press => ({
  player: gorgeTapSeat,
  command: { kind: "drag", target: "gorgeLobe", on: true, fromMilli: 0, fromYMilli: 0, id },
});

/**
 * THE GORGE: each bubble wants so many shots of a colour, or of both, and a
 * wrong one takes a shot back out (`gorgeStruck`) — so the hand never fires
 * one. It feeds the bubble due: on a row in any order the first still
 * wanting, on an ordered row the next in the order, on a ring the bottom one
 * (`gorgeDue`) once the ring has turned it there, tapping it open first, a
 * press a tick, for `gorgeOpenTaps` (`gorge-hand.ts`). A bubble wanting both takes its reds first.
 *
 * **The wave's own bodies come first** once one is below the bubbles: the
 * five levels outlast the wave's rocks and slimes, and a shot up a column
 * under a bubble would be met by the bubble before the body above it — so
 * the pair answers what has got past, the field's way (`fieldHand`), and
 * goes back to feeding. Between levels and once it is out, only the field.
 */
export const gorgeHand: Hand = (w) => {
  const g = gorgeBoss(w);
  if (g === null) return [];
  const phase = gorgePhase(g);
  const past = w.creatures.some((c) => c.row > gorgeRowOf(w.cfg, g));
  if (past || (phase !== "row" && phase !== "ring")) return fieldHand(w);
  // On a ring only the bottom bubble is ever shot: the hand waits under it
  // for the one due to turn round.
  const i =
    phase === "ring"
      ? gorgeBottom(g)
      : g.intakes.findIndex((k, n) => !gorgeSated(k) && gorgeDue(g, n));
  const k = g.intakes[i];
  const col = gorgeColOf(w.cfg, g, i);
  if (k === undefined || col < 0) return [];
  if (w.cannonCol !== col) return [aim(col)];
  if (gorgeSated(k) || !gorgeDue(g, i)) return [];
  if (gorgeOffers(g, w.cfg, gorgeTapSeat).includes(i)) return [tap(i)];
  return free(w) ? [fire(k.gotRed < k.needRed ? "red" : "cyan")] : [];
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

/** The pilot's thumb on hanging part `id`, carried `milli` along the frame. */
const hangingPart = (id: number, milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "scuttlePart", on: true, fromMilli: milli, id },
});

/**
 * The pilot takes hold of the oldest hanging part and carries it a column,
 * once a cycle (`sim/scuttle-hand.ts`). Two ticks on purpose: the grab is a
 * state of its own before any carry is worth anything, and a hand that sent
 * both at once would never put the world in it. The direction is whichever
 * one is not off the end of the frame, since a carry that cannot move is not
 * spent and would be sent again for ever.
 */
function swingPart(w: World, s: ScuttleState): Press[] {
  const id = s.loose[0];
  if (id === undefined || !scuttleSwingable(s)) return [];
  if (s.held !== id) return [hangingPart(id, 0)];
  const dir = scuttleSwingCol(s, w.cfg, id, 1) === scuttlePartCol(s, w.cfg, id) ? -1 : 1;
  return [hangingPart(id, dir * w.cfg.scuttleSwingMilli)];
}

/**
 * THE SCUTTLE: the live part's colour up the column it hangs over while it
 * is there to shoot (`scuttleStruck`) — the column it was carried to, if the
 * pilot carried it (`scuttlePartCol`); winding the last one back, only the
 * lance lands, so the thumb goes down over the socket and lifts once spent.
 */
export const scuttleHand: Hand = (w) => {
  const s = scuttleBoss(w);
  if (s === null || s.downBeat >= 0 || s.live < 0) return [];
  const out: Press[] = swingPart(w, s);
  const col = scuttlePartCol(s, w.cfg, s.live);
  if (w.cannonCol !== col) return [...out, aim(col)];
  if (scuttleWinding(s)) {
    if (w.prime?.spent) return [...out, thumb(false, w.prime.color)];
    return w.prime === null ? [...out, thumb(true, s.parts[s.live]?.color ?? "red")] : out;
  }
  if (!scuttleShootable(s)) return out;
  return free(w) ? [...out, fire(s.parts[s.live]?.color ?? "red")] : out;
};
