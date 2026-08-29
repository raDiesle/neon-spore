import { WAVES } from "@neon-spore/content";
import { ackBriefing, type World } from "@neon-spore/sim";
import { waveLabel, waveOpeningWorld, wavesWithGuides } from "./guide-waves.js";
import { frameWorld, PHONE } from "./pose-art.js";

/**
 * Every guide in the game, drawn in both roles side by side.
 *
 * Putting P1's screen and P2's screen for the same wave at the same layout,
 * next to each other, means the redacted half of one sits beside the plain
 * half of the other at the same height — the two are the same paragraph, one
 * shown and one withheld. Whether the two halves read as one instruction is
 * the same pair of frames read the other way: P1's plain "YOURS" beside P2's
 * plain "YOURS".
 *
 * Drawn at the phone's own width, uncapped, the way `scene-panel.ts` draws a
 * proposed body: a guide fitted to a thumbnail is a guide whose 11 px font and
 * word-shaped redaction blocks have been claimed to read at a size nobody will
 * actually see them at.
 */

/**
 * A world with one wave's guide up and its introduction already gone — posed
 * by starting the wave and sending the two acks the phone sends, so the state
 * on screen is one a pair can actually reach.
 */
export function guideWorld(waveIndex: number): World {
  const world = waveOpeningWorld(waveIndex);
  ackBriefing(world, 1);
  ackBriefing(world, 2);
  return world;
}

function roleFrame(waveIndex: number, role: "p1" | "p2"): HTMLElement {
  const framed = frameWorld(
    guideWorld(waveIndex),
    role,
    "full",
    PHONE.width,
    undefined,
    undefined,
    // No cap: the redaction blocks and the 11 px body text are the whole
    // question, and a cap that shrinks the guide to fit a row would be
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

function waveRow(waveIndex: number): HTMLElement {
  const wrap = document.createElement("div");

  const label = document.createElement("p");
  label.className = "note";
  label.textContent = `${waveLabel(waveIndex)} — ${WAVES[waveIndex]?.sentence ?? ""}`;
  wrap.appendChild(label);

  const row = document.createElement("div");
  row.className = "scenes";
  row.appendChild(roleFrame(waveIndex, "p1"));
  row.appendChild(roleFrame(waveIndex, "p2"));
  wrap.appendChild(row);

  return wrap;
}

/** Every wave that carries a guide, in the order a pair plays them. */
export function renderGallery(): HTMLElement {
  const root = document.createElement("div");
  for (const i of wavesWithGuides()) root.appendChild(waveRow(i));
  return root;
}
