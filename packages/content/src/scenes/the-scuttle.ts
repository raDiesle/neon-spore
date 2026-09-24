import type { GuideScene } from "../scene-types.js";

/**
 * THE SCUTTLE's rehearsal: one part let go, nineteen struck where they hang,
 * and the last one held under the beam.
 *
 * A frame of twenty-one parts hangs over columns 2 to 8: rocks and bodies of
 * both colours and two pods, sown by the seed. Every cadence one comes loose
 * and hangs in its socket for three beats, then is thrown down its column —
 * a rock, a slick, a bulb or a moored pod (`sim/scuttle-step.ts`). A bolt
 * out of the top in its column and its colour while it hangs takes it off
 * the frame instead (`sim/scuttle-shot.ts`); the wrong colour is shrugged
 * off. From twelve left two come loose a cycle and only one is live; from
 * seven the cadence is two beats. The last part winds up, and only the beam
 * standing in its column ends it. The pilot is shown the count and the
 * navigator the live part, its colour and the column the next throw lands
 * in (`render/view-role-clocks-b.ts`).
 *
 * **The cost first.** The first part to come loose, a rock in column 5, is
 * let hang and thrown: a rock takes thirteen beats to reach the hull, and
 * the pilot guards it on beat 20 while the strikes go on over it. Every
 * strike from there is an `atBoss` strip (`sim/boss-answer.ts`,
 * `scuttleNextCol`) — the live socket's column, which the seed puts in
 * columns no authored column reaches — and the colour five and twenty ticks
 * into the beat the part came loose, so the bolt leaves the top the beat
 * after and the next part is loose the beat after that. The third part is
 * struck with the wrong colour first, for the rebuff, and with its own a
 * beat later.
 *
 * **The twins are thrown regardless.** A twin is never live, and a strike
 * on the live one does not spare it: it goes down its column at the cadence.
 * Four bulbs go, and each is shot in the gap between strikes, `atBody` in
 * its colour while it is still at the top; the one slick is shot red the
 * same way. Nothing else falls, so nothing blocks a strike — a body in the
 * live column takes the bolt and the part is thrown.
 *
 * **The pods are struck where they hang.** Seed 17 puts both pods in
 * sockets that come loose live — columns 8 and 4, at eleven and two left —
 * and a struck pod is a part off the frame. A pod thrown hangs at row 4
 * until a bolt frees it, and where it lands is the rng's drift and rarely
 * a column an author can put the cannon under; the film keeps its pods on
 * the frame and its guide says what a thrown one is.
 *
 * **And the pages the field took over.** `BURN` was already on the last part
 * when this film was written, so its *hold cyan on it* page was the word twice
 * and says the rule instead: any colour fills the beam, because the beam's
 * colour is never read. What the field says beside it now is **his** slide
 * (`render/boss-cue-read-t.ts`): on the wind-up one part is left, the slab he
 * is shown has one plate on it, and the column is already his — so the strip at
 * 2285 is what the word asks for rather than a page. In a cycle it still says
 * nothing to him, which is why *slide under the one she says* stays written: the
 * live socket is hers alone, and her `FIRE` now waits until he is under it.
 *
 * **The wind-up and the beam.** With one part left it winds up for four
 * beats over column 4 (THE SLOW): the cannon is put under it and cyan held
 * from the wind-up's own beat, so the beam is standing three beats on and
 * the frame is down a beat before the throw. Three beats later it is out.
 * Every page is on a control or on the hull: the frame is a fixture and no
 * anchor names one (`docs/queue.md`, the gauge item).
 */
export const THE_SCUTTLE: GuideScene = {
  ticks: 2900,
  bpm: 120,
  seed: 17,
  entries: [],
  boss: { kind: "scuttle" },
  acts: [
    // The first part, a rock over column 5, hangs from beat 4 and is thrown
    // on beat 7; the rock over column 7 that comes loose then is struck.
    { tick: 425, control: "cannon", col: 0, atBoss: true },
    { tick: 440, control: "fireCyan" },
    // The red body over column 8: cyan is shrugged off, red takes it.
    { tick: 545, control: "cannon", col: 0, atBoss: true },
    { tick: 560, control: "fireCyan" },
    { tick: 605, control: "fireRed" },
    // One every two beats, each in the column it hangs over and its colour.
    { tick: 725, control: "cannon", col: 0, atBoss: true },
    { tick: 740, control: "fireCyan" },
    { tick: 845, control: "cannon", col: 0, atBoss: true },
    { tick: 860, control: "fireRed" },
    { tick: 965, control: "cannon", col: 0, atBoss: true },
    { tick: 980, control: "fireCyan" },
    { tick: 1085, control: "cannon", col: 0, atBoss: true },
    { tick: 1100, control: "fireRed" },
    // The rock thrown on beat 7 reaches the hull on beat 20, under column 5.
    { tick: 1170, control: "shield", col: 3 },
    { tick: 1180, control: "guard" },
    { tick: 1205, control: "cannon", col: 0, atBoss: true },
    { tick: 1220, control: "fireRed" },
    { tick: 1325, control: "cannon", col: 0, atBoss: true },
    { tick: 1340, control: "fireCyan" },
    // Twelve left: two hang, and the live one over column 3 is struck.
    { tick: 1445, control: "cannon", col: 0, atBoss: true },
    { tick: 1460, control: "fireCyan" },
    // From here every strike has a twin thrown after it, shot at the top.
    { tick: 1625, control: "cannon", col: 0, atBoss: true },
    { tick: 1640, control: "fireRed" },
    { tick: 1685, control: "cannon", col: 0, atBody: true },
    { tick: 1700, control: "fireCyan" },
    { tick: 1805, control: "cannon", col: 0, atBoss: true },
    { tick: 1820, control: "fireRed" },
    { tick: 1865, control: "cannon", col: 0, atBody: true },
    { tick: 1880, control: "fireCyan" },
    // The pod over column 8, struck where it hangs.
    { tick: 1925, control: "cannon", col: 0, atBoss: true },
    { tick: 1940, control: "fireCyan" },
    { tick: 1985, control: "cannon", col: 0, atBody: true },
    { tick: 2000, control: "fireCyan" },
    { tick: 2045, control: "cannon", col: 0, atBoss: true },
    { tick: 2060, control: "fireCyan" },
    { tick: 2105, control: "cannon", col: 0, atBody: true },
    { tick: 2120, control: "fireCyan" },
    // Two left, and the cadence is two beats: the pod over column 4, then
    // the slick its twin threw, red.
    { tick: 2165, control: "cannon", col: 0, atBoss: true },
    { tick: 2180, control: "fireCyan" },
    { tick: 2225, control: "cannon", col: 0, atBody: true },
    { tick: 2240, control: "fireRed" },
    // The last part winds up on beat 38 over column 4; cyan held from its
    // own beat is a beam by beat 41, a beat before the throw.
    { tick: 2285, control: "cannon", col: 0, atBoss: true },
    { tick: 2300, control: "fireCyan", until: 2540 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "TWENTY-ONE PARTS · COUNT", anchor: { at: "boss" } },
    {
      tick: 240,
      seat: 2,
      text: "ONE HANGS · SAY ITS COLUMN",
      anchor: { at: "boss", part: "live" },
    },
    { tick: 420, seat: 1, text: "TOO LATE · THROWN · A ROCK", anchor: { at: "boss" } },
    {
      tick: 600,
      seat: 2,
      text: "ITS COLOUR OR NOTHING · RED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 780,
      seat: 1,
      text: "SLIDE UNDER THE ONE SHE SAYS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1140,
      seat: 1,
      text: "THE ROCK IT THREW · SHIELD",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 1440,
      seat: 2,
      text: "TWO HANG · ONLY ONE IS LIVE",
      anchor: { at: "boss", part: "live" },
    },
    { tick: 1620, seat: 1, text: "TEN · THE TWIN IS THROWN", anchor: { at: "boss" } },
    {
      tick: 1860,
      seat: 2,
      text: "SHOOT WHAT IT THROWS · CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 2160,
      seat: 2,
      text: "A POD HANGS · STRIKE IT CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 2340,
      seat: 2,
      // `BURN` has stood on the last part since the cue shipped, so this page
      // was already the word written twice — and wrong besides: the beam's
      // colour is never read (`sim/scuttle-shot.ts`, the `b.lance` branch), so
      // a beat spent choosing one is a beat out of a window that is the fill
      // and one beat of slack.
      text: "ANY COLOUR FILLS THE BEAM",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 2520, seat: 1, text: "DOWN · IT LETS GO IN THREE", anchor: { at: "boss" } },
    { tick: 2700, seat: 1, text: "OUT · NONE LEFT TO COUNT", anchor: { at: "boss" } },
  ],
};
