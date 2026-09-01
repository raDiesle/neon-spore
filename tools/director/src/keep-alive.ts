/**
 * The page telling its server that somebody still has it open.
 *
 * The director exits when nothing has spoken to it for a couple of minutes
 * (`server.ts`, `idleMs`), and that number is only safe because of this file.
 * Before it, the window was refreshed by requests alone — and a director sits
 * for long stretches making none, because a wave is read and thought about
 * rather than clicked through. So the window had to be an hour, which is not a
 * measure of anybody's attention; it is how long a *forgotten* server holds a
 * port. An agent that opens one to take a screenshot and moves on left it up
 * for the rest of the hour, and a day of those is what the owner found running.
 *
 * A beat inverts it. An open tab keeps the server up for as long as the tab is
 * open — better than the hour, which expired while somebody was still looking
 * — and a closed tab stops beating instantly, so the server goes within the
 * window. Nothing has to remember to shut it down, which is the only kind of
 * cleanup that actually happens.
 */

/**
 * Every 25 seconds. Chrome throttles timers in a hidden tab to about one a
 * minute, so the interval the *server* sees may be four times this; the
 * server's window is sized for that, and the two numbers only make sense read
 * together. A frozen or discarded tab stops beating altogether, which is the
 * right answer: nobody is looking at a tab the browser has thrown away.
 */
const BEAT_MS = 25_000;

/**
 * Start beating, unless this is the static build.
 *
 * `shipped` is the flag `shipped.ts` already reads off `/__director`, passed
 * in rather than read again: a shipped bundle is a file on a CDN with no
 * director behind it, and a beat there is a 404 every 25 seconds for as long
 * as the page is open.
 */
export function bindKeepAlive(shipped: boolean): void {
  if (shipped) return;
  const beat = (): void => {
    void fetch("/__director/beat", { cache: "no-store" }).catch(() => {
      // The server has already gone — the page is still perfectly readable,
      // and saying so in the console every 25 seconds would be the only thing
      // wrong with it.
    });
  };
  setInterval(beat, BEAT_MS);
  // Straight away on returning to the tab, rather than up to 25 seconds later:
  // a throttled background tab may have missed enough beats that the server is
  // seconds from exiting exactly as somebody looks at it again.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) beat();
  });
}
