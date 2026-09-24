import {
  isMeteorKind,
  spoolBoss,
  spoolBrakeForRateMilli,
  spoolPaying,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE SPOOL played right**, for the STATES sheet: the brake held at the
 * depth this leg's rate asks for, corrected every tick, and the shield under
 * the one thing the fight throws.
 *
 * The hand is one press because the boss is one control, and what it has to
 * get right is the opposite of a handle's. A stroke is an **edge**, so a
 * handle's hand presses it from a hand that is off it and lets go in between. A brake is a **level**: the depth is carried
 * until it is changed, so this hand presses the same target every tick and
 * only the figure moves. Pressing it again at the depth it already has is
 * nothing at all (`sim/spool-hand.ts`), which is what lets a leg's new rolled
 * rate be answered on the tick it is rolled.
 *
 * **The depth is read off the rate, never worked out here.** A rate the
 * navigator is shown is turned back into a grip by `spoolBrakeForRateMilli`,
 * which is the one function in the simulation that must be **called, not
 * re-derived** for this boss (`packages/sim/test/purity.test.ts`) — a hand
 * that did the division itself would drift from the rate the line actually
 * pays out at the moment either end of the reach is retuned.
 */
type Press = Omit<TimedCommand, "tick">;

const brake = (fromYMilli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "spoolBrake", on: true, fromMilli: 0, fromYMilli },
});

export const spoolHand = (w: World): Press[] => {
  const s = spoolBoss(w);
  if (s === null) return [];
  const out: Press[] = [...rock(w)];
  if (spoolPaying(s)) out.push(brake(spoolBrakeForRateMilli(w.cfg, s.wantRateMilli)));
  return out;
};

/**
 * **THE SPOOL played wrong**, and the only way to pose the slip: the brake
 * held at whichever end of its reach is further from the depth the leg wants.
 *
 * Correct play never slips, so the state the whole fight is built to punish
 * cannot be earned by a hand that plays well. Held at an end rather than
 * simply let go, because letting go pays the line out at the fast end and a
 * leg that rolled the fast end would never leave its zone — the further end
 * is wrong by at least half the span whatever was rolled.
 */
export const spoolWrongHand = (w: World): Press[] => {
  const s = spoolBoss(w);
  if (s === null || !spoolPaying(s)) return [];
  const want = spoolBrakeForRateMilli(w.cfg, s.wantRateMilli);
  return [brake(want * 2 < w.cfg.spoolReachMilli ? w.cfg.spoolReachMilli : 0)];
};

/** The rock a slip throws, met with the shield — the fight's one ordinary hazard. */
function rock(w: World): Press[] {
  let body: { col: number; row: number } | null = null;
  for (const c of w.creatures) {
    if (isMeteorKind(c.kind) && (body === null || c.row > body.row)) body = c;
  }
  return body === null ? [] : [{ player: 2, command: { kind: "shieldCol", col: body.col } }];
}
