import { VARIANTS } from "../../versus/candidates/index.js";
import { slots } from "../../versus/variant.js";
import { el } from "./dom.js";
import { bindKeepAlive } from "./keep-alive.js";
import { renderCandidate } from "./versus-one.js";
import { type Head, readHead } from "./versus-vote.js";

/**
 * `versus.html` — the page a VERSUS door opens into, and the whole of its
 * routing.
 *
 * One destination, named by the query string: `?slot=…&name=…` is one
 * candidate, live, against what the game draws today. Nothing else is a route,
 * and an unrecognised one says so on the page rather than showing an empty
 * screen — a door that opens onto nothing is worse than a door that says it is
 * locked. `?page=animations` was the second destination until 7 September
 * 2026; it now falls through to the same message as any other stale link.
 *
 * It is a page rather than a mode of the director for the reason the owner
 * gave: a comparison you opened should be the only thing the browser is
 * drawing. The editor keeps its waves, its unsaved state and its own tab; this
 * one starts with one world in it and ends when it is closed.
 *
 * It beats (`keep-alive.ts`), and that is not optional here. The dev server
 * exits when nothing has spoken to it for a couple of minutes, and a look is
 * the one page in this tool somebody sits and *watches* without clicking
 * anything — a candidate replaying every two seconds is meant to be stared at
 * for longer than the idle window. Without a beat the server would go down
 * mid-comparison, which is exactly the failure the beat was written to stop.
 */

const params = new URLSearchParams(window.location.search);
const host = document.getElementById("standalone");

if (!host) throw new Error("versus.html has no #standalone mount");

// The same flag `shipped.ts` reads, for the same one purpose it serves here:
// a static bundle has no director behind it, so a beat there is a 404 every
// 25 seconds for as long as the page is open.
void fetch("/__director")
  .then((r) => r.json())
  .then((b: { shipped?: boolean }) => b.shipped !== false)
  .catch(() => true)
  .then(bindKeepAlive);

routeCandidate(host, params.get("slot"), params.get("name"));

/** One candidate, named by its slot and its own name — the two fields
 * `versus-open.ts` writes into the link. */
function routeCandidate(mount: HTMLElement, slot: string | null, name: string | null): void {
  const open = slots(VARIANTS);
  const found = open.find((s) => s.slot === slot);
  const candidate = found?.candidates.find((c) => c.name === name);
  if (!found || !candidate) {
    document.title = "Neon Spore — VERSUS";
    mount.appendChild(el("h1", "", "NOTHING TO SHOW"));
    mount.appendChild(
      el(
        "p",
        "note",
        slot === null
          ? "This page draws one candidate look. Open it from the director's " +
              "VERSUS tab rather than by typing the address."
          : `No open candidate is called ${name} in slot ${slot}. It may have ` +
              "been adopted or removed since the link was made — the VERSUS " +
              "tab lists what is open now.",
      ),
    );
    return;
  }

  document.title = `Neon Spore — ${found.slot} · ${candidate.name}`;
  const draw = (head: Head): void => {
    mount.appendChild(renderCandidate(found, candidate, head));
  };
  readHead()
    .then(draw)
    .catch(() => draw({ head: "unknown", dirty: true }));
}
