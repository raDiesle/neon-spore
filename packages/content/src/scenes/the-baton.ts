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
 * the two settles the unanswered launch leaves behind move a bead that is
 * already in the top socket, so they show nothing.
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
    { tick: 0, seat: 1, text: "AN ARM UNFOLDS · ONE A BEAT", anchor: { at: "hull" } },
    { tick: 360, seat: 2, text: "THE BEAD IS SAFE IN A SOCKET", anchor: { at: "hull" } },
    {
      tick: 660,
      seat: 1,
      text: "PLAYER 1 PULLS THE TRIGGER",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 840,
      seat: 2,
      text: "NOBODY SHOT · IT LANDS BACK",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1140,
      seat: 2,
      text: "PLAYER 2 FIRES RED · IN AIR",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1320,
      seat: 1,
      text: "CYAN NOW · PLAYER 1 TRIGGERS",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 1500,
      seat: 2,
      text: "PLAYER 2 GREYS AFTER A SHOT",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
