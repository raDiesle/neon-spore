/**
 * What a landing says about itself before and after it happens.
 *
 * Split out of `land.ts` when `--sweep` took that file over its length limit,
 * and the seam is the one it already had: next door is what a landing *is* —
 * whether it may go, what it will move, whether the trunk goes to `origin` —
 * and this is the wording of it. Nothing here decides anything, which is why
 * it can be read in one sitting.
 */

import type { Landing, LandState } from "./land.js";

/** The pre-flight, in the order the steps will happen. */
export function describe(state: LandState, landing: Landing): string[] {
  const lines = landing.sweepOnly
    ? [`${state.branch} → ${state.trunk}: already landed; this is the cleanup it deferred`]
    : [`${state.branch} → ${state.trunk}: ${state.ahead} to land, ${state.behind} to replay over`];
  if (landing.rebase) lines.push(`  rebase   onto ${state.trunk}`);
  if (!landing.sweepOnly) {
    lines.push("  check    bun run check");
    lines.push(
      landing.moveRef
        ? `  land     move ${state.trunk} — no worktree holds it`
        : `  land     fast-forward ${state.trunk} in ${state.trunkTree}`,
    );
  }
  if (landing.sweepOnly) lines.push(`  sweep    ${state.branch} and every spent lane`);
  if (!landing.sweeps) lines.push("  keep     the branch and every worktree stay standing");
  if (landing.mayPush) {
    lines.push(
      landing.forced || landing.moveRef
        ? `  push     origin/${state.trunk}`
        : `  push     origin/${state.trunk} — only if the sweep clears a lane away`,
    );
  }
  return [...lines, ...landing.warn.map((w) => `  ⚠ ${w}`)];
}

/**
 * The closing line of a landing, at a glance.
 *
 * It used to live in the `Stop` hook, which landed lanes itself and had
 * `systemMessage` as its one channel to the chat. The hook asks now instead of
 * landing, so the badge moved to the landing — where it reads the same however
 * the landing started, and where somebody watching from a phone sees it for a
 * landing they asked for by hand.
 */
export function badge(branch: string, trunk: string, sha: string, ahead: number): string {
  const count = ahead === 1 ? "1 commit" : `${ahead} commits`;
  return `🟢 ╺━╸ L A N D E D ! ╺━╸ ${branch} → ${trunk} @ ${sha} (${count})`;
}
