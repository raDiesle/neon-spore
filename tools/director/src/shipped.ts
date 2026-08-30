import { mountBuildStamp } from "../../build-stamp.js";

/**
 * The two things the *build* decides about the director, rather than the
 * session running it: which bundle this is, and whether there is a repository
 * behind it.
 *
 * Both used to sit at the top of `main.ts`, which is a file about wiring
 * panels together. They are neither, and `main.ts` is at its line limit.
 */
export function bindShipped(): void {
  mountBuildStamp();

  // A shipped build has no write route — hide what would fail rather than
  // offer it; a route that cannot be reached at all reads the same way.
  void fetch("/__director")
    .then((r) => r.json())
    .then((b: { shipped?: boolean }) => b.shipped !== false)
    .catch(() => true)
    .then((shipped) => {
      if (!shipped) return;
      for (const id of ["save", "checksOpen", "mainMenuLink"])
        document.getElementById(id)?.setAttribute("hidden", "");
      document.getElementById("shippedNote")?.removeAttribute("hidden");
    });
}
