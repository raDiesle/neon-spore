/**
 * **Every boss's shot, asked rather than acted on** — the `…Verdict` each
 * boss's `…Struck` acts on, which the picture asks where a bolt stops
 * (`render/bolt-stop.ts`), and `CoreVerdict`, the four words eleven of them
 * share (`core-verdict.ts`).
 *
 * Cut out of `boss-surface-clocks-e.ts` on 5 October 2026, when every verdict
 * a bolt-stop lane added was one more line on a page ten lines off its limit.
 * One line a boss, in alphabetical order; a new verdict goes in its place
 * here. `boss-surface-clocks-e.ts` re-exports this page, so nothing reaching
 * for a name through `@neon-spore/sim` knows it moved.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

export { capstanVerdict } from "./capstan-shot.js";
export { CORE_KINDS, coreRowMilli } from "./core-along.js";
export type { CoreVerdict } from "./core-verdict.js";
export { curtainVerdict } from "./curtain-shot.js";
export { gallVerdict } from "./gall-shot.js";
export { gimbalVerdict } from "./gimbal-shot.js";
export { governorVerdict } from "./governor-shot.js";
export { HASP_BOLT_FROM_MILLI, haspBoltMilli, haspVerdict } from "./hasp-shot.js";
export { hiveVerdict, hiveWallVerdict } from "./hive-shot.js";
export { KEEL_ROCK_FROM_MILLI, keelRockMilli, keelVerdict } from "./keel-shot.js";
export { type LeadVerdict, leadVerdict } from "./lead-shot.js";
export { ledgerVerdict } from "./ledger-shot.js";
export { MANTLE_SPARK_FROM_MILLI, mantleSparkMilli, mantleVerdict } from "./mantle-shot.js";
export { oculusVerdict } from "./oculus-shot.js";
export { plumbVerdict } from "./plumb-shot.js";
export { RATCHET_BOLT_FROM_MILLI, ratchetBoltMilli, ratchetVerdict } from "./ratchet-shot.js";
export { scuttleVerdict } from "./scuttle-shot.js";
export { slingVerdict } from "./sling-shot.js";
export { stareVerdict } from "./stare-shot.js";
export { tasterVerdict } from "./taster-shot.js";
export { trapezeAim } from "./trapeze-shot.js";
export { VALVE_SPARK_FROM_MILLI, valveSparkMilli, valveVerdict } from "./valve-shot.js";
export { VISE_SEED_MILLI, viseVerdict } from "./vise-shot.js";
