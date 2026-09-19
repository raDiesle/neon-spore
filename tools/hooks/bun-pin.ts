/**
 * The bun this repository is pinned to, and what to say to a session running
 * an older one.
 *
 * **Why one file for both the hook and the landing.** A bun below the pin is
 * a trap with a fifteen-minute fuse: `bun install` ignores a `bun.lock` it
 * cannot read and rewrites it, `bun run check:fast` is green on every test,
 * and `bun run land` gets through the rebase and dies in the frozen install
 * with *Unknown lockfile version* — naming neither `.bun-version` nor what to
 * do. On 14 September 2026 a lane on the owner's own machine (bun 1.3.8
 * against a pin of 1.4.2) lost its landing minutes finding the way through.
 * `session-start.ts` was written against exactly that trap and protected only
 * the web image; the landing had no check at all. Both read this now, so the
 * comparison and the advice are said once.
 *
 * **What it pins is `.bun-version` and not a number of its own** — see
 * `WANTED`, which used to be a literal one minor ahead of the file and could
 * not be re-derived by anybody who found the two disagreeing.
 */

import { readFileSync } from "node:fs";

/**
 * The bun this repo is pinned to, **read out of `.bun-version`** rather than
 * written here.
 *
 * It used to be a literal, `1.4.2`, while `.bun-version` said `1.4.0`, and the
 * two had no way of noticing each other. The owner settled which on 9 September
 * 2026 — **1.4.2** — and the file was raised to meet the hook rather than the
 * hook lowered to meet the file: a pin says which toolchain this repository is
 * developed on, not the oldest one that still passes.
 *
 * So this is derived and there is no second number to raise. `.bun-version` is
 * the one file to edit; `package.json`, the workflow, the hook and the landing
 * all read it, and `tools/test/bun-version.test.ts` holds every reader in step.
 *
 * **A checkout this cannot read is a no-op, not a crash.** `0.0.0` is older
 * than any bun there has ever been, so `needsUpgrade` returns false, nothing
 * refuses and nothing pins — which is the right answer when the thing that
 * says what to pin is missing.
 */
export const WANTED = pinnedBun();

function pinnedBun(): string {
  try {
    const at = new URL("../../.bun-version", import.meta.url);
    const said = readFileSync(at, "utf8").trim();
    return /^\d+\.\d+\.\d+$/.test(said) ? said : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/**
 * Whether `current` is older than `wanted`, by numeric version parts. A
 * pre-release suffix (`1.4.2-canary`) is treated as its release — the callers
 * only need "is this bun too old", and a canary of the wanted version is not.
 */
export function needsUpgrade(current: string, wanted: string): boolean {
  const parts = (v: string): number[] =>
    v
      .split("-")[0]!
      .split(".")
      .map((n) => Number.parseInt(n, 10) || 0);
  const c = parts(current);
  const w = parts(wanted);
  for (let i = 0; i < Math.max(c.length, w.length); i++) {
    const a = c[i] ?? 0;
    const b = w[i] ?? 0;
    if (a !== b) return a < b;
  }
  return false;
}

/** Where the advice below puts the pinned bun: a directory the npm registry
 * can fill on any platform, kept out of the tree and out of `$PATH` until the
 * line that names it. */
export const PIN_DIR = "~/.cache/neon-spore-bun";

/**
 * The way through, for a machine whose bun is below the pin: the two commands
 * that got the 14 September lane landed, verbatim, so nobody rediscovers them.
 * The npm registry rather than `bun upgrade` because the registry ships every
 * version as `bun@<exact>` and the upgrade ships whatever is latest today.
 */
export function pinAdvice(wanted: string): string[] {
  return [
    `npm install bun@${wanted} --prefix ${PIN_DIR}`,
    `PATH=${PIN_DIR}/node_modules/.bin:$PATH bun run land`,
  ];
}

/**
 * What a session on a bun below the pin is told, or `null` when the bun it
 * runs is new enough. `running` is `Bun.version` at every caller; it is a
 * parameter so the lines can be held by a test on a machine whose bun is fine.
 */
export function belowPin(running: string, wanted: string): string[] | null {
  if (!needsUpgrade(running, wanted)) return null;
  const [install, land] = pinAdvice(wanted);
  return [
    `bun ${running} is below the ${wanted} this repository is pinned to (.bun-version)`,
    "  it cannot read bun.lock: install ignores the lockfile and rewrites it, the check is green, and the landing's frozen install dies on it",
    `  the way through:  ${install}`,
    `                    ${land}`,
  ];
}

/**
 * What `bun run check` and `bun run land` each print and stop on when the
 * bun running *them* is below the pin, or `null` when it is fine.
 *
 * **The comparison this repeats is `belowPin`'s; what is new is `verb`.** A
 * shell whose plain `bun` resolves to the image's own, not the one
 * `session-start.ts` pinned into `PATH`, was the trap on 19 September 2026: a
 * continued session with `$CLAUDE_ENV_FILE` unread ran `bun run check` under
 * 1.3.11 and it reported 35 real failures with nothing saying which bun
 * produced them, because `tools/check/run.ts` asked nothing about its own
 * version — only `bun run land` did (`toolchain.ts`'s `oldBunRefusal`, which
 * now calls this). `verb` is what stops — "checked", "moved" — so the two
 * callers can each say what nothing of theirs happened, off the one
 * comparison, rather than the check silently passing under the wrong binary.
 */
export function pinRefusal(running: string, wanted: string, verb: string): string[] | null {
  const said = belowPin(running, wanted);
  if (said === null) return null;
  const [first, ...rest] = said;
  return [`✗ ${first}; nothing was ${verb}`, ...rest];
}
