/**
 * The day the bundle in front of you was built.
 *
 * Both shipped apps — the game and the director — are static bundles served
 * from somewhere that has no repository behind it, so the only question a
 * person can have about one of them is *which* build they are looking at.
 * A deploy that silently served yesterday's bundle looks exactly like one
 * that worked, and that is the failure this line exists to make visible.
 *
 * `__BUILD_DATE__` is substituted by the two build scripts
 * (`apps/game/build.ts`, `tools/director/build.ts`) and by nothing else, so
 * a dev server — where the source is the answer and the date is noise —
 * finds the identifier missing and says `dev` instead of a date that would
 * not mean anything. `typeof` on an undeclared name is safe, which is what
 * lets one module cover both cases.
 */
declare const __BUILD_DATE__: string | undefined;

/** `YYYY-MM-DD` in a built bundle, `dev` under a dev server. */
export const BUILD_STAMP: string = typeof __BUILD_DATE__ === "string" ? __BUILD_DATE__ : "dev";

/** What the two apps put on the screen. */
export function buildStampText(): string {
  return BUILD_STAMP === "dev" ? "DEV BUILD" : `BUILT ${BUILD_STAMP}`;
}

/** Fills whichever `#buildStamp` the page carries. Both apps carry one. */
export function mountBuildStamp(): void {
  const el = document.getElementById("buildStamp");
  if (el) el.textContent = buildStampText();
}

/**
 * The local calendar day, for a build script to bake in. Not
 * `toISOString().slice(0, 10)`: that is UTC, and an evening build here would
 * be stamped with tomorrow — the one thing a date on a screen must not do.
 */
export function buildDateToday(now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
