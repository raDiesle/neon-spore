import { bindStageGauge, type StageGauge } from "./stage-gauge.js";
import { bindStagePinball, type StagePinball } from "./stage-pinball.js";
import { bindStageSnake, type StageSnake } from "./stage-snake.js";

/**
 * Every round that draws **slabs**, bound to the director's canvas at once.
 *
 * `stage-touch.ts` cannot answer a slab: it is handed a `Field`, and a slab
 * panel's buttons are in none of them. A round played on the *band* — THE
 * PULSE is the first — needs nothing here at all, because `touchDown` already
 * answers a lobe wherever it stands. So each round needs a listener of its own, and there are twelve rounds
 * coming — this is the one line `stage.ts` spends on all of them rather than
 * nine lines apiece, which is what it was already spending on the first.
 *
 * No two listeners can both fire: the simulation holds one boss at a time and
 * each of them asks whether the round running is its own. And they take the
 * same handle, which is the useful part — a round added here needs nothing
 * from `stage.ts` at all.
 *
 * **A round left out of this function is a round nobody can test**, and that
 * has now happened twice: THE GAUGE shipped without a listener and the owner
 * reported it as "i cannot test the gauge", and PINBALL shipped without one
 * and the owner reported that FIRE and SET did nothing. Both files carry a
 * warning about it, and a warning is what failed. `test/stage-rounds.test.ts`
 * is the guard that replaced them — it walks every slab of every control set
 * and fails on one no listener here answers.
 */
export function bindStageRounds(handle: StageGauge & StagePinball & StageSnake): void {
  bindStageGauge(handle);
  bindStageSnake(handle);
  bindStagePinball(handle);
}
