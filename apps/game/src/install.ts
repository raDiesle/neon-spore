/**
 * The home-screen shortcut, and the service worker that makes one possible.
 *
 * This game is two people holding two phones, and a phone game reached by
 * typing an address into a browser is a phone game that gets played once. An
 * icon on the home screen is the difference, and it is also what takes the
 * browser's own furniture off the screen — the address bar is thirty vertical
 * pixels of a portrait field that the hull would rather have.
 *
 * **Nothing here is load-bearing.** A browser with no service worker, no
 * install prompt and no manifest plays exactly the same game over exactly the
 * same relay; every path in this file fails quietly on purpose, because the one
 * thing worse than no shortcut is a game that will not start without one.
 */

/**
 * The event Chrome fires when it has decided the page is installable. It is not
 * in the DOM typings because it is not in the standard — Safari has nothing
 * like it, which is why the button below appears rather than always being
 * there.
 */
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export async function bindInstall(): Promise<Installer> {
  registerWorker();
  return bindPrompt();
}

/**
 * The home-screen offer, for whoever wants to make it.
 *
 * The chip over the field is the just-in-time prompt and stays; the settings
 * page is the durable place a player looks for this, and both ask the same
 * held event.
 */
export interface Installer {
  /** Whether the browser has offered, and the offer is still standing. */
  available: () => boolean;
  /** Make it. Does nothing when there is nothing to make. */
  offer: () => void;
}

/**
 * Already on the home screen. Both halves are needed: the standard media query
 * is what Android answers, and `navigator.standalone` is the one iOS has.
 */
function installed(): boolean {
  const legacy = (navigator as { standalone?: boolean }).standalone === true;
  return legacy || matchMedia("(display-mode: standalone)").matches;
}

function bindPrompt(): Installer {
  const chip = document.getElementById("installChip") as HTMLButtonElement | null;
  let pending: InstallPrompt | null = null;

  const offer = (): void => {
    const prompt = pending;
    if (!prompt) return;
    // One prompt per event: the browser will not honour a second, so the offer
    // goes away whichever way the player answers.
    pending = null;
    chip?.classList.remove("on");
    void prompt.prompt().catch(() => {});
  };

  window.addEventListener("beforeinstallprompt", (e) => {
    // Holding the event is what lets the offer be made where it belongs rather
    // than wherever the browser would have put its own bar.
    e.preventDefault();
    if (installed()) return;
    pending = e as InstallPrompt;
    chip?.classList.add("on");
  });

  window.addEventListener("appinstalled", () => {
    pending = null;
    chip?.classList.remove("on");
  });

  chip?.addEventListener("click", offer);
  return { available: () => pending !== null, offer };
}

/**
 * The worker, and only where somebody wants one.
 *
 * **Never on a local address.** Every local surface is one a person is testing
 * on — the director's `/game`, the preview on 4173, `dev:game` on 3000 — and a
 * cache that answers when the server does not is how a session ends up reading
 * a build that no longer exists. That is not a hypothesis: it happened while
 * this file was being written. The preview idled out mid-check, the worker
 * served the previous bundle, and the stale page looked exactly like a bug in
 * the code that had just replaced it. CLAUDE.md already says to ask who
 * answered before trusting a measurement; this is the same rule one layer down.
 *
 * `?pwa=1` turns it on locally for the one case that wants it — actually
 * testing the install — and `bun run deploy:game` is unaffected, which is where
 * the shortcut is for.
 */
function registerWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  // A worker only registers over https or on localhost anyway; asking first
  // keeps a needless SecurityError out of the console on a LAN address, which
  // is exactly where a second phone is pointed while this is being built.
  if (!window.isSecureContext) return;
  if (!workerWanted(location.href)) {
    void retireWorkers();
    return;
  }
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/**
 * Whether this address should have a service worker at all. Pure, so the rule
 * that keeps a cache off a testing machine can be tested like `menuRequested`.
 */
export function workerWanted(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  if (parsed.searchParams.has("pwa")) return true;
  const host = parsed.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1" && host !== "[::1]";
}

/**
 * Take away the ones already there.
 *
 * A worker registered by an earlier build outlives the change that stopped
 * registering it — it keeps control of the page until something unregisters
 * it — so a machine that has been testing this needs the old one taken off
 * rather than merely not renewed. Its caches go with it: an unregistered
 * worker stops answering, but its store stays on the disk for the next one to
 * inherit.
 */
async function retireWorkers(): Promise<void> {
  try {
    for (const reg of await navigator.serviceWorker.getRegistrations()) await reg.unregister();
    for (const name of await caches.keys()) {
      if (name.startsWith("neon-spore-")) await caches.delete(name);
    }
  } catch {
    // A browser that will not enumerate them is a browser with none to retire.
  }
}
