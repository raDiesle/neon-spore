import { bindControlSetsTab } from "./controlsets-page.js";
import { bindGuidesTab } from "./guide-sheet.js";
import { bindSpecTab } from "./spec.js";
import { bindStyleTab } from "./style-page.js";
import { bindWordingsTab } from "./wordings-page.js";

/**
 * DOCUMENTATION's lazy rooms, bound in one place.
 *
 * Each room draws itself on the first click of its own tab and not before
 * (`style-page.ts` says why: a room nobody opens should cost nothing). All of
 * them have to be bound **before** `bindStates`, because that call replays
 * the URL's inner tab as a real click, and a room bound after it restores to
 * a blank page — CONTROLS was, and did. `main.ts` used to list the five calls
 * itself; the list moved here when WORDINGS took that file over its length
 * limit, and one call is also one fewer place for the sixth room to be added
 * in the wrong order.
 */
export function bindDocumentationRooms(): void {
  bindGuidesTab();
  bindSpecTab();
  bindStyleTab();
  bindWordingsTab();
  bindControlSetsTab();
}
