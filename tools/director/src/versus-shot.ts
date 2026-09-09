/**
 * The two query parameters that make a VERSUS pair photographable
 *
 * `CLAUDE.md` says to send the owner a picture of a look, and photographing one
 * was a sweep. A pose with a `cadenceSeconds` rebuilds its world on its own
 * clock, so what is on the frame when `bun run shot` lands depends on when the
 * browser started and how long the bundle took: four pictures cost six `--wait`
 * values each, and half of those came back an empty field or a wave already
 * breaking against the hull. `creature:dart` was worse — its thrust burns for
 * one beat of a two-second replay, so it took about thirty-five shots ranked by
 * PNG file size, on the reasoning that the frame with a flame on it compresses
 * worst. That worked, and nobody should have to invent it twice.
 *
 * - **`freeze=<seconds>`** steps the pair to that point of its replay and stops
 *   it there. `pair.freeze()` rather than `setRunning(false)`, so the held frame
 *   carries no `hud.ts` "PAUSED" caption — the same call a `screenshot`
 *   candidate already makes. One `bun run shot` at any `--wait` past the settle
 *   then gives the same picture every time, and the moment is chosen from what
 *   the pose does rather than from what the browser happened to be doing.
 * - **`only=candidate|current`** mounts one side at true size, instead of a
 *   strip of both cropped down to nothing.
 *
 * An unrecognised value falls through to the running pair rather than to a
 * blank page, which is the rule the whole of `versus-app.ts` is written to: a
 * door that opens onto nothing is worse than a door that says it is locked, and
 * a *stale flag* should not be either.
 */

/** Which of the two sides to mount, or both. */
export type OnlySide = "candidate" | "current" | "both";

export interface ShotParams {
  /** Where to stop the replay, in seconds, or null to leave it running. */
  freezeSeconds: number | null;
  only: OnlySide;
}

/** The running pair, which is what every unreadable value falls through to. */
export const LIVE: ShotParams = { freezeSeconds: null, only: "both" };

/**
 * Read the two flags off a query string.
 *
 * A freeze of `0` is a real answer — the first frame — so the guard is on
 * finiteness and sign, never on truthiness. Anything else, including a negative
 * one and a word, is a flag somebody mistyped, and the page keeps moving.
 */
export function shotParams(params: URLSearchParams): ShotParams {
  const asked = params.get("freeze");
  const seconds = asked === null ? Number.NaN : Number(asked);
  const only = params.get("only");
  return {
    freezeSeconds: Number.isFinite(seconds) && seconds >= 0 ? seconds : null,
    only: only === "candidate" || only === "current" ? only : "both",
  };
}
