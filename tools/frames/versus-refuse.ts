/**
 * **A frozen VERSUS frame whose candidate moves nothing is refused, by name.**
 *
 * A candidate that only acts after an event — a blister's death, patched in
 * `blister:death-*` — moves nothing at a `--freeze` before that event. The page
 * then reads MOVES 0.000% and lays out without the pair's size note, `--at`
 * crops whatever lies at those coordinates, and `versus:shot` used to exit 0
 * with `wrote …` all the same. The death lane took four such frames on
 * 17 October 2026 and read them as broken candidates until the cause was
 * found. `versus-one.ts` puts the share on the row as `data-moves`; this is
 * the selector `shot.ts` refuses on, and what `versus:shot` says when it does.
 */

/** A candidate row that moves none of the frame (`versus-one.ts`'s `data-moves`). */
export const MOVES_NOTHING = '.versus-row[data-moves="0"]';

/** The exit `shot.ts` takes when the page shows what `--refuse` names. */
export const REFUSED = 3;

/** What `versus:shot` says when the frozen moment moves nothing. */
export function movesNothing(slot: string, name: string, freeze: string): string {
  return (
    `versus:shot: ${slot} · ${name} moves 0% of the frame at --freeze ${freeze} — ` +
    "the moment is before anything it patches happens, so the picture would show the " +
    "current look twice. Freeze later, or use --rate to watch it play."
  );
}
