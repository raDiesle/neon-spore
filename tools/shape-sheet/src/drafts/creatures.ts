import { POD } from "@neon-spore/content";
import type { CatalogueEntry } from "../catalogue.js";
import { cluster, glyphed, slab } from "../forms.js";
import { sac, slumped } from "../hanging.js";
import { heeled, hooked } from "../hooked.js";
import {
  CANT,
  DRIFT,
  HEAVE,
  LURCH,
  SAG,
  SHIVER,
  SLITHER,
  SWELL,
  TURN,
  TWITCH,
} from "../motions.js";
import { blob, crystal } from "../subjects.js";

/**
 * Draft creatures: one shape each for the creature ideas in
 * `docs/spec/ideas.md` that are accepted and not worked out.
 *
 * Every one of them is drawn at the *mechanic*, not at a mood. The idea store
 * describes behaviours — appears early for one player, can only be hit at zero,
 * never leaves when it reaches the hull — and a silhouette earns its place here
 * by making that behaviour legible before it happens. A creature whose picture
 * gives no warning of what it does is a creature the pair cannot talk about,
 * and talking about it is the whole game.
 *
 * None of this is a decision. Each entry names the idea it is offered to, and
 * a person hands it over — or does not.
 */
export const CREATURE_DRAFTS: CatalogueEntry[] = [
  {
    subject: cluster("ECHO", "a body and its earlier self, never quite together", {
      bodies: 2,
      radius: 30,
      spread: 2.2,
      period: 7,
      floor: 0.55,
    }),
    motion: DRIFT,
    status: "draft",
    slot: "creature",
    suggests: "Echo",
    owner:
      "the one creature the two players do not see the same: the shape is doubled so the lagging copy is a thing on screen rather than a discrepancy",
  },
  {
    subject: blob(
      "REVERB",
      { lobes: 3, depth: 0.24, wobble: 0.06, rx: 46, ry: 40, seed: 6.1 },
      "one body, arriving twice",
    ),
    motion: LURCH,
    status: "draft",
    slot: "creature",
    suggests: "Reverb",
    owner:
      "travels, stops, waits, travels again — the delay is in the motion, which is where a repeat belongs; the contour stays plain so it is not mistaken for the Echo",
  },
  {
    subject: glyphed("COUNTDOWN", "a rim of marks, one fewer each pass", 42, 42, 7, 0.9),
    motion: TWITCH,
    status: "draft",
    slot: "creature",
    suggests: "Countdown creature",
    owner:
      "the count has to be readable at 26 px, so it is cut into the outline rather than drawn inside it; the long stillness between flicks is what says it is waiting rather than idling",
  },
  {
    subject: crystal(
      "MOULT",
      { sides: 11, depth: 0.26, wobble: 0.03, seed: 12.0 },
      50,
      "11 facets · a shell under pressure",
    ),
    motion: SWELL,
    status: "draft",
    slot: "creature",
    suggests: "Moulting",
    owner:
      "faceted, because a shell is the non-living material the rock already uses; it swells and does nothing else, so the moment it splits is the only event it ever has",
  },
  {
    subject: cluster("SYMBIOSIS", "two bodies in one membrane, safe while touching", {
      bodies: 2,
      radius: 26,
      spread: 2.4,
      period: 9,
      floor: 0.12,
    }),
    motion: SHIVER,
    status: "draft",
    slot: "creature",
    suggests: "Symbiosis",
    owner:
      "vulnerable only while apart, so the window is a shape and not a timer: the membrane thins to a waist and finally parts, and both players can see the same instant coming",
  },
  {
    subject: blob(
      "SMOKE",
      { lobes: 6, depth: 0.07, wobble: 0.17, rx: 44, ry: 40, seed: 7.4 },
      "shallow lobes, a wobble deep enough to blur the edge",
    ),
    motion: DRIFT,
    status: "draft",
    slot: "creature",
    suggests: "Camouflage",
    owner:
      "the only draft whose outline is deliberately hard to fix on — it wanders rather than rocks, so aiming beside it is a decision rather than a mistake",
  },
  {
    subject: cluster("COLONY", "five small bodies sharing one skin", {
      bodies: 5,
      radius: 17,
      spread: 3.8,
      period: 11,
      floor: 0.35,
    }),
    motion: SHIVER,
    status: "draft",
    slot: "creature",
    suggests: "The Colony",
    owner:
      "reads as several things at once at any size, which is what a thing that spreads has to do; each body is small enough that losing one changes the silhouette",
  },
  {
    subject: crystal(
      "PRISM",
      { sides: 3, depth: 0.1, wobble: 0.01, seed: 2.4 },
      44,
      "3 facets · a wedge, and the angle is the mechanic",
    ),
    motion: TURN,
    status: "draft",
    slot: "creature",
    suggests: "Prism",
    owner:
      "the one draft whose rotation is not decoration: a shot leaves along the face it struck, so the face a player can see is the aim, and a triangle has no ambiguous face",
  },
  {
    subject: slab("GATE", "a bar across the lane, square-shouldered", 62, 20, 4),
    motion: HEAVE,
    status: "draft",
    slot: "creature",
    suggests: "Wave gate",
    owner:
      "flat, made and wider than its column is generous — nothing else on the field looks like an obstruction, which is the whole point of a creature that arrives and refuses to leave",
  },
  {
    subject: sac("TENDRIL", "long, hanging, boneless", 0.34, 24, 66),
    motion: SLITHER,
    status: "draft",
    slot: "creature",
    suggests: "The Colony",
    owner:
      "the Colony's root or brood fibre — taller than it is wide, so it reads against every round thing on the field, and the wave runs its length rather than around it",
  },
  {
    subject: hooked("NOTCH 1", "a barb, and the barb is the aim", 32, 30, 0.85, 5),
    motion: CANT,
    status: "draft",
    slot: "creature",
    suggests: "Notch",
    owner:
      "direction as a *feature*: one barb on an otherwise ordinary contour, pointing at the column it takes on the next accent, retracting before it comes out the other side so the body commits rather than popping between poses. Unmistakable at card size, and the thing most likely to disappear at 26 px — which is what variant 2 is for",
  },
  {
    subject: heeled("NOTCH 2", "no barb — the whole mass leans", 33, 31, 0.42, 5),
    motion: CANT,
    status: "draft",
    slot: "creature",
    suggests: "Notch",
    owner:
      "the same commitment on the same beats, said with the whole body instead: fat on the leading side, lean behind, nothing small enough to be lost at creature size. Its risk is the opposite one — the bulb already sways and the slick already tilts, so a lopsided blob may read as one more of those rather than as a claim about the next column",
  },
  {
    subject: sac("HUSK 1", "the pod's contour, its mass gone to the bottom", 0.3, POD.rx, POD.ry, {
      lobes: POD.lobes,
      depth: POD.depth,
      wobble: POD.wobble,
      seed: POD.seed,
    }),
    motion: SAG,
    status: "draft",
    slot: "creature",
    suggests: "Husk",
    owner:
      "the quiet answer: the POD card's own lobes, depth, wobble and seed with the mass moved down and nothing else touched, so every difference on the page is the sag. It changes a proportion and no landmark, which is why an eye may have nothing to point at",
  },
  {
    subject: slumped(
      "HUSK 2",
      "the same sag, and one shoulder fallen in",
      0.3,
      0.26,
      POD.rx,
      POD.ry,
      { lobes: POD.lobes, depth: POD.depth, wobble: POD.wobble, seed: POD.seed },
    ),
    motion: SAG,
    status: "draft",
    slot: "creature",
    suggests: "Husk",
    owner:
      "the loud answer: the same sag with a dent cut where an intact body has a crown, off-centre so it reads as damage rather than as a shape the thing was built with. Far easier to see — and that is the risk, because a husk legible while it still hangs is one nobody ever has to gamble on",
  },
];
