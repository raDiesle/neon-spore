import { leadBoss, leadPassing, leadShootable, leadStill } from "./lead.js";
import { leadMet } from "./lead-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **A shot that nothing on the field stopped, leaving through the top** under
 * THE LEAD. Called by `bullets.ts` and `lance-burn.ts` beside `ledgerStruck`,
 * and a no-op unless THE LEAD is the boss.
 *
 * Its own file beside `lead-step.ts` for `ledger-shot.ts`' reason: next door
 * is the fight's **clock**, and this happens on the **tick**, where a bolt
 * leaves the field. Nothing is judged here — a bolt is put into the air
 * above the field with the beat it comes due, and the clock judges it
 * against where the body is *then*, which is the whole fight
 * (`docs/spec/bosses-choreographed.md` §11).
 *
 * **The beam is the other weapon, and it is judged now**: it stands, so
 * there is no flight to it — a beam up the body's own column on its last
 * pass is the end of it, and a beam up any column while it stands dead
 * still is the plating's answer, nothing (`leadMet` counts it against
 * `leadStillFills`). A beam while the stalk still has
 * segments to shoot is an ordinary shot with no flight: it burns the column
 * and touches nothing, because the design's beam is the answer to the last
 * segment alone, and a beam that took one earlier would make the last pass
 * a formality.
 *
 * **What it says to HARD** (`shot-out.ts`): a bolt put in flight met
 * something for now, and is asked again when it comes due (`lead-step.ts`).
 * Anything else meets the body only in the body's own column — the plating,
 * which is armour — and nothing anywhere else.
 */
export function leadStruck(world: World, b: Bullet): boolean {
  const s = leadBoss(world);
  if (s === null) return false;
  const body = b.col === s.col;
  if (b.lance) {
    if (leadPassing(s) && body) leadMet(world, s, b.col);
    return body;
  }
  const verdict = leadVerdict(world, b.col);
  if (verdict !== "flight") return verdict !== null;
  const dueBeat = world.beat + world.cfg.leadFlightBeats;
  s.flights.push({ col: b.col, dueBeat });
  world.events.push({ type: "leadFlight", col: b.col, dueBeat });
  return true;
}

/**
 * What a bolt does under THE LEAD, whatever its colour: put in flight while
 * the stalk paces with segments to shoot, judged when it comes due
 * (`"flight"`); otherwise the plating in the body's own column (`"armour"`),
 * and nothing anywhere else.
 */
export type LeadVerdict = "flight" | "armour";

/** What a bolt in `col` does under THE LEAD now. `leadStruck` acts on it, and the picture asks it too. */
export function leadVerdict(world: World, col: number): LeadVerdict | null {
  const s = leadBoss(world);
  if (s === null) return null;
  if (leadShootable(s) && !leadStill(s)) return "flight";
  return col === s.col ? "armour" : null;
}
