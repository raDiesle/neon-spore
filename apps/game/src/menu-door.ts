/**
 * Whether a URL opens on the menu or goes straight to the field.
 *
 * The menu used to be behind `?menu`, because a tester opens the game a hundred
 * times a day to look at one wave and a title screen in front of that is a tap
 * nobody asked for. That reasoning still holds — it is just no longer the
 * majority case. Somebody who opens the address is a player, and a player who
 * lands straight on a field with no seat, no room and no way to reach either
 * has been dropped into the middle of a game.
 *
 * So the default is inverted and the escape hatch is kept: `?play` goes
 * straight to the field, which is what `tools/frames` drives and what a tester
 * opening one wave wants. Everything else — the plain address, the director's
 * `/game?menu=1` link, a room link — lands on the menu.
 *
 * **What it skips is the opening, and not the menu itself.** It bound no menu
 * at all until 17 September 2026, and the ☰ in the corner is the whole of the
 * way out of a field on a phone — so that road was a door that locked behind
 * whoever walked through it, and it was the road a tester walks. `shell.ts`
 * binds the menu either way now and reads this to decide only whether to put
 * an intro, a name and a front page in front of the field.
 *
 * Its own file because it is the one part of `menu.ts` with no DOM and no
 * closure in it, and that file reached its length limit the day the front page
 * became four rows. `menu.ts` re-exports it, so `apps/game/test/menu.test.ts`
 * and every caller still reach it there.
 */
const PLAY_PARAM = "play";

/** Pure, so the rule that decides the front door can be tested. */
export function opensOnMenu(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  if (parsed.searchParams.has(PLAY_PARAM)) return false;
  return parsed.hash.replace(/^#/, "") !== PLAY_PARAM;
}
