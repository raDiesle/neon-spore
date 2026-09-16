/**
 * The GET route that only reads a document off disk — the study of games that
 * are not this one — split out of `server.ts` the same way
 * `backlog-api.ts` and `notes-api.ts` were, and for a sharper reason than
 * tidiness. `docs/spec/` was read here too, whole, for the sheet's own SPEC
 * room; the owner took that room off on 14 September 2026 and the reader went
 * with the page it was the only reader for.
 *
 * `build.ts` bakes these same answers into `dist/api/`, so it needs the
 * readers. It used to import them from `server.ts`, and importing that file
 * *runs* it: a port is claimed and `Bun.serve` binds it at module scope. The
 * build then wrote `dist/`, printed its lines, and never exited — a director
 * was listening behind it, holding the event loop open until the idle timer
 * fired an hour later. `bun run build` hung there, after all its output, which
 * is the worst place for a hang to be: it looks finished.
 *
 * So a reader lives here, where nothing binds anything, and both sides import
 * it. Nothing outside a server may import `server.ts`.
 */

const partyGamesFile = new URL("../../../docs/party-games.md", import.meta.url);

/**
 * `docs/party-games.md`, whole — served rather than parsed into entries
 * because its argument is prose, and a parse would drop the half that took the
 * reading. The study of games that are not this one, read off Mario Party and
 * Rayman Raving Rabbids for the shape of a round; its verdict table is its
 * argument.
 */
export async function readPartyGamesText(): Promise<string> {
  return await Bun.file(partyGamesFile).text();
}

/**
 * The routes that answer with one document's whole text, as a table.
 *
 * `server.ts` serves these and `build.ts` bakes them, and the two lists were
 * written out by hand on both sides. They drifted: the comment above one
 * study's route in `server.ts` described another's, and each new study had to
 * be added in two places that nothing held together. One table read by both
 * cannot disagree with itself, and the next study is one line here.
 *
 * One entry. TOWER DEFENCE, CLAUDE VS CHATGPT and BORROWED were tabs here
 * until the owner took them off the sheet, the last of them on 16 September
 * 2026; `docs/tower-defence.md` and `docs/borrowed.md` stay in the repository
 * — the first cited by half of `tools/shape-sheet` and read there — because a
 * study that is no longer a page is still a reading somebody did. PARTY GAMES
 * is here because the owner put it here: the six rounds it feeds are on this
 * sheet already, and the study should be read beside them.
 *
 * Keyed by the path the client already fetches, so `build.ts` bakes to
 * `dist/<path>` by dropping the leading slash and nothing else.
 */
export const DOC_ROUTES: Record<string, () => Promise<string>> = {
  "/api/party-games": readPartyGamesText,
};
