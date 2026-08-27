import { BRIEFINGS } from "@neon-spore/content";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  subjectIndex,
  type World,
} from "@neon-spore/sim";
import { frameWorld, PHONE } from "./pose-art.js";

/**
 * Every card in `BRIEFINGS`, drawn in both roles side by side.
 *
 * This answers the first two of the three outstanding checks. Putting P1's
 * screen and P2's screen for the same subject at the same layout, next to
 * each other, means the redacted half of one card sits beside the plain half
 * of the other at the same height — the two are the same paragraph, one
 * shown and one withheld, and this is what "next to the plain half it
 * corresponds to" means once it is on a screen instead of in a sentence.
 * Question one — whether the two halves read as one instruction — is the
 * same pair of frames read the other way: P1's plain "YOURS" beside P2's
 * plain "YOURS".
 *
 * Drawn at the phone's own width, uncapped, the way `scene-panel.ts` draws a
 * proposed body: a card fitted to a thumbnail is a card whose 11 px font and
 * word-shaped redaction blocks have been claimed to read at a size nobody
 * will actually see them at.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true, hullInvulnerable: true };

/** A pod is not a creature and a boss fight is not either — see `BRIEFING_SUBJECTS`. */
const POD_SUBJECTS: ReadonlySet<BriefingId> = new Set(["mend", "purge", "ward"]);
/** The two bosses that exist, plus the mechanics that only show up inside a
 * boss fight (THE LINE is the warden's own tether, not a wave entry of its
 * own kind). */
const BOSS_SUBJECTS: ReadonlySet<BriefingId> = new Set([
  "queen",
  "warden",
  "tether",
  "mirror",
  "vane",
]);

/** Grouping is cosmetic only — a scanning aid, never fed back into the sim. */
export function categoryOf(id: BriefingId): string {
  if (id === "opening") return "THE OPENING";
  if (POD_SUBJECTS.has(id)) return "PODS";
  if (BOSS_SUBJECTS.has(id)) return "BOSSES";
  return "CREATURES";
}

/**
 * A world holding exactly one card, up, and nothing else — `drawBriefing`
 * reads only `world.brief.due[0]`, and this is that field, posed directly
 * rather than reached through `openBriefings`. Most subjects could be reached
 * the long way, by spawning the one thing that raises them; THE LINE cannot,
 * since it is a mechanic the warden fight spawns mid-run and never a wave's
 * own authored entry. Posing every subject the same way, directly, means one
 * card in the gallery is not built differently from the other eighteen.
 */
export function subjectWorld(id: BriefingId): World {
  const world = createWorld({ ...CFG }, 11);
  world.brief.due = [subjectIndex(id)];
  return world;
}

function roleFrame(id: BriefingId, role: "p1" | "p2"): HTMLElement {
  const framed = frameWorld(
    subjectWorld(id),
    role,
    "full",
    PHONE.width,
    undefined,
    undefined,
    // No cap: the redaction blocks and the 11 px body text are the whole
    // question, and a cap that shrinks the card to fit a row would be
    // answering it by making it unreadable instead.
    Number.POSITIVE_INFINITY,
  );
  const box = document.createElement("div");
  box.className = "scene";
  const shot = document.createElement("div");
  shot.className = "scene-shot";
  shot.appendChild(framed.canvas);
  box.appendChild(shot);
  const seat = document.createElement("p");
  seat.className = "seat";
  seat.textContent = role === "p1" ? "P1'S SCREEN" : "P2'S SCREEN";
  box.appendChild(seat);
  return box;
}

function subjectRow(id: BriefingId): HTMLElement {
  const card = BRIEFINGS[id];
  const wrap = document.createElement("div");

  const label = document.createElement("p");
  label.className = "note";
  label.textContent = `${id} — ${card.title}`;
  wrap.appendChild(label);

  const row = document.createElement("div");
  row.className = "scenes";
  row.appendChild(roleFrame(id, "p1"));
  row.appendChild(roleFrame(id, "p2"));
  wrap.appendChild(row);

  return wrap;
}

/** Every subject `BRIEFINGS` has, catalogue order, grouped for scanning. */
export function renderGallery(): HTMLElement {
  const root = document.createElement("div");
  let current = "";
  for (const id of BRIEFING_SUBJECTS) {
    const cat = categoryOf(id);
    if (cat !== current) {
      current = cat;
      const h2 = document.createElement("h2");
      h2.textContent = cat;
      root.appendChild(h2);
    }
    root.appendChild(subjectRow(id));
  }
  return root;
}
