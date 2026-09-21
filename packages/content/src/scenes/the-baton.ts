import type { GuideScene } from "../scene-types.js";

/**
 * THE BATON's rehearsal: a launch nobody answers, then three handovers.
 *
 * The arm unfolds a socket a beat for eleven beats (`batonSockets`) and the
 * bead sits in the top socket from beat 11 on. Player 1 pulls the trigger and
 * the bead is in the air for three beats; the first time nobody shoots and it
 * lands back where it was, which is a rule worth a page of its own. Then the
 * pair passes it: player 2 puts a shot of its colour through it while it
 * flies, it lands a socket down, the socket it left goes dark, the colour
 * flips, and the seat that acted is grey for the beat after. A page cannot
 * split a launch from its shot — the shot leaves 50 ticks after the trigger,
 * so it crosses the bead a third of the way down its flight and lands with 40
 * ticks to spare (`batonLandTick`) — so each handover is one page, said from
 * the seat whose part is new on it.
 *
 * The cannon is not moved: it starts in the middle lane, which is the arm's
 * column, and the arm does not swing until four sockets are dark, which this
 * film never reaches. A bead left sitting two beats is shaken back to the top
 * (`batonTurnBeats`); every launch here is on the second beat of its sit, and
 * a bead already in the top socket is not shaken at all, so the unanswered
 * launch leaves no settle behind. Three handovers is one short of the twin
 * (`batonTwinAfter`), so the film shows one bead only.
 */
export const THE_BATON: GuideScene = {
  ticks: 1740,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "baton" },
  acts: [
    // The first launch goes unanswered on purpose: the bead comes back to the
    // socket it left, which is the rule the second page is about.
    { tick: 750, control: "guard" },
    { tick: 1230, control: "guard" },
    { tick: 1280, control: "fireRed" },
    { tick: 1410, control: "guard" },
    { tick: 1460, control: "fireCyan" },
    { tick: 1590, control: "guard" },
    { tick: 1640, control: "fireRed" },
  ],
  steps: [
    // **What is left after the field learned to say its own verbs.**
    //
    // Seven pages stood here until 18 September 2026, and three of them are
    // now written on the field itself: `LAUNCH` over a bead in its socket,
    // `FIRE` over one in the air, and `MOVE` on the cannon a flight has to be
    // met in (`render/boss-cue-read-i.ts`). A page that only names a verb
    // loses the verb rather than the page (`.claude/skills/new-tutorial`), and
    // what these four name is the half of this fight no mark on the field may:
    // the alternation, and what each seat's own turn costs it.
    //
    // The colour went with them, and deliberately: *CYAN NOW* was the film
    // saying the one sentence the pair exists to say to each other, and the
    // landing that flips the bead is drawn (`baton-bead-draw.ts`).
    { tick: 0, seat: 1, text: "ONE SENDS · THE OTHER SHOOTS", anchor: { at: "boss" } },
    // The rule the cue cannot carry: acting costs him the next beat, which is
    // the whole of why this boss has to be passed back and forth. The launch
    // at 750 is his and both neighbours are hers, so the page keeps his screen.
    {
      tick: 660,
      seat: 1,
      text: "PLAYER 1 GREYS FOR A BEAT",
      anchor: { at: "control", control: "guard" },
    },
    // What a missed flight costs, on the launch nobody answers on purpose.
    {
      tick: 840,
      seat: 2,
      text: "NOBODY SHOT · IT LANDS BACK",
      anchor: { at: "control", control: "fireRed" },
    },
    // And the same rule on her side, which is a different page because it is a
    // different phone: neither seat is shown the other's panel going grey.
    {
      tick: 1500,
      seat: 2,
      text: "PLAYER 2 GREYS AFTER A SHOT",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
