import { FLEET_DEFAULTS, type FleetConfig } from "./config-fleet.js";
import { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
import { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
import { PULSE_DEFAULTS, type PulseConfig } from "./config-pulse.js";
import { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
import { TELL_DEFAULTS, type TellConfig } from "./config-tell.js";

export { FLEET_DEFAULTS, FLEET_SHELL_BEATS, type FleetConfig } from "./config-fleet.js";
export { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
export { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
export { PULSE_DEFAULTS, type PulseConfig } from "./config-pulse.js";
export { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
export { TELL_DEFAULTS, type TellConfig } from "./config-tell.js";

/**
 * The rounds' numbers, as one block of `SimConfig`.
 *
 * Split out of `config.ts` when THE TELL's two fields took that file over its
 * 250-line limit — a file that had been sitting on the ceiling and paying for
 * it every time a mechanic arrived (`docs/queue.md`). The seam is the one
 * `content/src/mechanics-rounds.ts` and `tools/director/src/ship-fields-round.ts`
 * already cut, and for the reason those two give: a round is a whole second
 * game with its own picture and its own panel, there are nine more of them
 * designed, and everything left next door is a dial on the field.
 *
 * It costs `config.ts` four lines a round instead of one — an import, an
 * export, a line of `extends` and a spread — and this file costs one of each.
 * The saving is not the point; keeping the barrel small enough to read in one
 * screen is.
 *
 * `SimConfig` extends `RoundConfig` rather than nesting it, exactly as it
 * extended the six separately: every call site still reads `cfg.damagePulse`,
 * and nothing outside this file learns there is a grouping at all.
 */
export interface RoundConfig
  extends GaugeConfig,
    FleetConfig,
    SnakeConfig,
    PinballConfig,
    PulseConfig,
    TellConfig {}

export const ROUND_DEFAULTS: RoundConfig = {
  ...GAUGE_DEFAULTS,
  ...FLEET_DEFAULTS,
  ...SNAKE_DEFAULTS,
  ...PINBALL_DEFAULTS,
  ...PULSE_DEFAULTS,
  ...TELL_DEFAULTS,
};
