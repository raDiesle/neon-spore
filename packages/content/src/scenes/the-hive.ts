import type { GuideScene } from "../scene-types.js";

/**
 * **THE HIVE's rehearsal — the colour is his, the warning is hers.**
 *
 * The fight is nine sites along a mass hung over the field. One swells, one
 * opens in red or cyan, and a bolt of the wrong colour wakes the body instead
 * of sealing it. Neither seat can do it alone by construction: the pilot is
 * shown the colour inside a breach and no swell at all, the navigator is shown
 * the swell and a breach with no colour in it, and the triggers are hers
 * (`view-role-clocks-b.ts`). The field's own cues never say RED or CYAN and
 * never mention the swell — they say CARRY and PRESS (`boss-cue-read-v.ts`) —
 * so the split is the one thing a film has to carry, and every page here is
 * one seat's screen showing what only that seat has.
 *
 * **Seed 6, for two accidents worth a page.** The sites open
 * `3c 6r 5c 1r 2r 7r 8c 4c 9r`: the first two breaches are different colours,
 * so the second cannot be answered by repeating the first; and the twins at
 * the fifth opening land on columns 7 and 8, adjacent, one red and one cyan —
 * one cannon, two colours, which is the fight's last lesson in one frame.
 *
 * **Why a spill is not a failure here.** A breach spills a living body, and a
 * bolt of the breach's colour kills a living body of that colour — so a bolt
 * fired into a spilling column is spent on the spill and never reaches the
 * top. That is the whole of *clear it, then seal it*, and it is why the film
 * fires twice into column 6 and twice into the twins. It is also why the first
 * site is sealed before it ever spills: one shot, if the cannon is already
 * there. The acts below were traced against the simulation beat by beat — a
 * bolt takes 72 ticks to cross fifteen rows, and a body falls one row every
 * 60.
 *
 * **Every press is authored fifteen ticks before its bolt leaves**, and that
 * is what `chargeBeats` is doing above. The game lays a shot on a half-beat
 * grid: a press waits for the next point strictly after it, and the bolt goes
 * from *there* (`shotChargeBeats`, `sim/shot-charge.ts`). `DEFAULT_CONFIG` has
 * no grid at all — a press is a bullet, so that a recorded replay keeps its
 * timing to the tick — and the two are not the same film. Timed for the
 * default, this one is fifteen ticks early everywhere, the third bolt kills
 * nothing, and the hull is breached at beat 36. So the acts sit fifteen ticks
 * before the departure they are for, the pairs are 60 apart because that is
 * the grid's own spacing and the reload gap both, and the film names the grid
 * it was written on rather than trusting whichever host is playing it — the
 * first one to. Six others name the zero grid they were proved on, and
 * `test/scene-grid.test.ts` asks the question of every film that names none.
 *
 * **It clenches twice, and the hand is the difference.** Every third seal
 * draws the whole underside up out of a bolt's reach for six beats, and while
 * it is up nothing spills — the cadence rides along and falls all at once on
 * the beat it lets go (`sim/hive-step.ts`). The third seal clenches it at beat
 * 20 with every site shut, so nothing is owed and nobody need touch it: that
 * one is the state shown costing nothing. The sixth clenches it at beat 47
 * with column 8 open, and *that* one is hauled — the pilot's palm on the mass
 * the tick after it goes up, and down again inside the beat, which is the
 * whole window. Finished before beat 48's step, the spill that beat owes
 * arrives on it; a beat later and it is simply gone.
 * Unhauled, the film's last beats say a breach left open costs nothing,
 * which is the opposite of the sentence it exists to say. **There is no page
 * for it** and there is no room for one: the twins' two pages are 180 ticks
 * apart already (`test/scene-pages.test.ts`), and both are true. The gesture is
 * shown rather than captioned — the ghost thumb rides the mass down
 * (`render/guide-hand.ts`), which is what §11.14 promises of this film.
 *
 * **Her hand is in it too.** The fifth site is wrung: the navigator's thumb
 * is on its swell from beat 33 until it opens at 36, under her own page, so
 * it opens colourless and the cyan bolt seals a red site. A wring provokes
 * the mass as a wrong bolt does, so it spills on the spot and costs a red
 * shot, and the twins spill a beat later than they would have — every act
 * after it was traced again for that. It has no page either, for the reason
 * the haul has none; the ghost thumb squeezes the lobe.
 *
 * **It ends unfinished, on purpose.** Column 8 is left open and spilling with
 * column 7 sealed beside it, because a bolt cannot pass a falling body and so
 * no film can both clear a column and seal another in the same beats. The pair
 * leave with the split, the seal and the double, and the rest is the fight.
 */
export const THE_HIVE: GuideScene = {
  ticks: 3060,
  bpm: 120,
  chargeBeats: 0.5,
  seed: 6,
  entries: [],
  boss: { kind: "hive" },
  acts: [
    // Site 1, column 3, cyan at beat 4: there before it opens, and sealed on
    // beat 5, before its first spill is ever due.
    { tick: 100, control: "cannon", worldCol: 3 },
    { tick: 255, control: "fireCyan" },
    // Site 2, column 6, red at beat 12 — and the spill comes on the opening
    // beat. The first bolt clears the slick, the second seals on beat 14.
    { tick: 620, control: "cannon", worldCol: 6 },
    { tick: 705, control: "fireRed" },
    { tick: 765, control: "fireRed" },
    // Site 3, column 5, cyan at beat 20: the bolt is already in the air when
    // the breach opens, and seals it inside the same beat.
    { tick: 1050, control: "cannon", worldCol: 5 },
    { tick: 1125, control: "fireCyan" },
    // Site 4, column 1, red at beat 28 — answered in cyan. The body is
    // provoked and spills a beat early; then the pair it cost: clear, seal.
    { tick: 1520, control: "cannon", worldCol: 1 },
    { tick: 1605, control: "fireCyan" },
    { tick: 1725, control: "fireRed" },
    { tick: 1785, control: "fireRed" },
    // Site 5, column 2, red at beat 36 — and **wrung**: the navigator's thumb
    // is on its swell from beat 33 until it opens, so it opens with no colour
    // and the cyan bolt already in flight seals it. The hand provokes the mass
    // as a wrong bolt would, so it spills on the spot, and a red shot clears
    // that body before it can fall.
    { tick: 2000, drag: "hiveLobe", hand: 2, until: 2170 },
    { tick: 2010, control: "cannon", worldCol: 2 },
    { tick: 2085, control: "fireCyan" },
    { tick: 2205, control: "fireRed" },
    // The twins at beat 44: column 7 red and column 8 cyan, adjacent, both
    // spilling a beat after they open — the wring moved the cadence by one.
    // The cannon can only be in one of them.
    { tick: 2500, control: "cannon", worldCol: 7 },
    { tick: 2685, control: "fireRed" },
    { tick: 2745, control: "fireRed" },
    // The seal on column 7 is the sixth, so the underside clenches on it — and
    // the pilot's palm is on it the tick after, and has it back down inside
    // the beat.
    { tick: 2827, drag: "hiveLobe", by: 2879, until: 2920 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SEES IT SWELL", anchor: { at: "boss", part: "swell" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 SEES THE COLOUR",
      anchor: { at: "boss", part: "breach" },
    },
    {
      tick: 480,
      seat: 1,
      text: "BE THERE BEFORE IT OPENS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 660,
      seat: 2,
      text: "IT SPILLED · TWO SHOTS",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 960, seat: 1, text: "A SEAL IS FOR GOOD", anchor: { at: "boss" } },
    {
      tick: 1140,
      seat: 2,
      text: "SHUT BEFORE IT EVER SPILLS",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 1440, seat: 1, text: "MOVE ON HER WORD", anchor: { at: "control", control: "cannon" } },
    {
      tick: 1620,
      seat: 2,
      text: "THE WRONG COLOUR WAKES IT",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1800,
      seat: 2,
      text: "IT SPILLS A BEAT SOONER",
      anchor: { at: "boss", part: "breach" },
    },
    // Opens on the tick the fifth seal lands (beat 36), not three seconds
    // before it: the page is read against the mass behind it, and
    // `test/scene-pages.test.ts` reads both counts back.
    {
      tick: 2166,
      seat: 1,
      text: "FIVE SCARS · FOUR TO GO",
      anchor: { at: "boss" },
      counts: [
        { of: "hiveScars", is: 5 },
        { of: "hiveLeft", is: 4 },
      ],
    },
    {
      tick: 2400,
      seat: 2,
      text: "SAY BOTH · HE PICKS ONE",
      anchor: { at: "control", control: "fireRed" },
    },
    // The two pages the twins are for open on the beat the twins open and the
    // tick the first is sealed, so each is read from a frame of the
    // thing it names — and the loop runs a beat past the last page so the
    // second gets its two seconds, which `test/scene-pages.test.ts` asks for.
    { tick: 2640, seat: 1, text: "TWO OPEN · TWO COLOURS", anchor: { at: "boss", part: "breach" } },
    {
      tick: 2830,
      seat: 2,
      text: "ONE SEALED · ONE SPILLING",
      anchor: { at: "boss", part: "breach" },
    },
  ],
};
