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

export async function bindInstall(): Promise<void> {
  registerWorker();
  bindPrompt();
}

/**
 * Already on the home screen. Both halves are needed: the standard media query
 * is what Android answers, and `navigator.standalone` is the one iOS has.
 */
function installed(): boolean {
  const legacy = (navigator as { standalone?: boolean }).standalone === true;
  return legacy || matchMedia("(display-mode: standalone)").matches;
}

function bindPrompt(): void {
  const chip = document.getElementById("installChip") as HTMLButtonElement | null;
  if (!chip) return;
  let pending: InstallPrompt | null = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    // Holding the event is what lets the offer be made where it belongs rather
    // than wherever the browser would have put its own bar.
    e.preventDefault();
    if (installed()) return;
    pending = e as InstallPrompt;
    chip.classList.add("on");
  });

  window.addEventListener("appinstalled", () => {
    pending = null;
    chip.classList.remove("on");
  });

  chip.addEventListener("click", () => {
    const prompt = pending;
    if (!prompt) return;
    // One prompt per event: the browser will not honour a second, so the offer
    // goes away whichever way the player answers.
    pending = null;
    chip.classList.remove("on");
    void prompt.prompt().catch(() => {});
  });
}

/**
 * The worker, from the built page only.
 *
 * `sw.js` is a file in `public/` that the build copies into `dist/`, so it
 * exists in the bundle that ships and does not exist under `bun --hot`, where
 * the request would 404. Registration failing is not worth a word to anyone:
 * the page it would have cached is the page already on the screen.
 */
function registerWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  // A worker only registers over https or on localhost anyway; asking first
  // keeps a needless SecurityError out of the console on a LAN address, which
  // is exactly where a second phone is pointed while this is being built.
  if (!window.isSecureContext) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
