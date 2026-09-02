import { bindStageGauge, type StageGauge } from "./stage-gauge.js";
import { bindStageSnake, type StageSnake } from "./stage-snake.js";

/**
 * Every round that is not the field, bound to the director's canvas at once.
 *
 * A round draws **slabs** instead of a band, and `stage-touch.ts` cannot
 * answer one: it is handed a `Field`, and a round's own buttons are in none of
 * them. So each round needs a listener of its own, and there are twelve rounds
 * coming — this is the one line `stage.ts` spends on all of them rather than
 * nine lines apiece, which is what it was already spending on the first.
 *
 * The two listeners cannot both fire: the simulation holds one boss at a time
 * and each of them asks whether the round running is its own. And they take
 * the same handle, which is the useful part — a round added here needs nothing
 * from `stage.ts` at all.
 */
export function bindStageRounds(handle: StageGauge & StageSnake): void {
  bindStageGauge(handle);
  bindStageSnake(handle);
}
