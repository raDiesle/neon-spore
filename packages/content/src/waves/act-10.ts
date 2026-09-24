import { FILAMENT_SCRIPT } from "../filament-script.js";
import { GIMBAL_SCRIPT } from "../gimbal-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Act ten, opened for THE REPRISE — `act-9.ts` had twenty-odd lines left under
 * the 250-line ceiling, which is less than one wave with its argument written
 * above it (`waves.ts`).
 *
 * **THE REPRISE is the first boss whose whole content is what the pair can no
 * longer see.** The wave falls as its author wrote it, both seats watching;
 * then the stretch that has just come down is sent again from the top with
 * nothing drawn, in the same columns at the same spacing, and the wave's own
 * arrivals stand still until it has finished (`sim/reprise.ts`). Nothing about
 * a body changes: it falls at its own speed, the shield turns it, a bolt of
 * the right colour takes it, and one that reaches the hull costs what any
 * other would. The only thing taken away is the picture.
 *
 * **The stretch is twelve beats, which is what makes it a memory and not a
 * reflex.** A stretch short enough to still be in the eye would be a wave
 * about reaction; twelve beats is about eight seconds at the default tempo,
 * long enough that the pair has to have *said* the columns to still have them.
 *
 * **The split is the wave.** Both screens go blank together, so neither seat
 * can read the answer off the other's — which leaves the record itself to be
 * divided, and the guide divides it the way the *panel* already divides the
 * answer: only `cannon` picks a column and it is player 1's strip, only the two
 * colour lobes fire and they are player 2's, so player 2 keeps the columns and
 * player 1 keeps the colours, and each of them holds the half the other has to
 * be told (`content/src/controls.ts`). Half the sentence each, and neither half
 * is a wave on its own: a column with nothing said to fire into it is a cannon
 * parked in the dark, and a colour with no column is a bolt up an empty lane.
 *
 * **Nothing in this wave can be warded**, and the guide said the opposite until
 * 19 September 2026. Every entry below carries a colour, so every body is a
 * `slick` or a `bulb`, and `isWardable` is the meteor kinds and `volley` —
 * `sim/hull.ts` says it in as many words: *the shield has nothing to say to a
 * slick*. The plate cannot touch this fight and the shot is its only ward. Why
 * the two halves read as they do now: `docs/spec/briefings.md`.
 *
 * The figures are chosen to be sayable. The first stretch is one at each wall
 * and one in the middle — the shape `THE WELL`'s wave is built on, and the
 * shortest thing two people can agree on out loud. The second is four and
 * crosses over itself, which is the same sentence with one more clause in it
 * than anybody can hold without saying it.
 */
/**
 * **THE FLIP is the second wave in the game whose content is the picture**, and
 * it is the opposite half of THE WELL's idea. There the turned screen is drawn
 * as something else entirely — a clock, with its own hours — and the pair has
 * to learn a second vocabulary. Here it is the same field, the same words and
 * the same columns, and every one of them means another one. A seat that has
 * learnt a clock knows it is reading a clock; a seat looking at a mirror of
 * the field it has played all evening has no way of knowing, which is why the
 * guide says so and the two walls stay lit under it.
 *
 * **It is the pilot's screen that turns**, and that is the whole design. The
 * navigator's job is already talking, and turning their picture would only
 * make the talking harder in a way they can hear themselves doing. The pilot's
 * job is pressing, and every press they make is a column — so the mirror lands
 * on the one seat whose eyes and hands now disagree, and the pair's only way
 * through is the navigator calling columns the pilot can see perfectly well
 * and must not believe (`sim/flip.ts`, `render/field-flip.ts`).
 *
 * **It starts on beat six rather than on beat nought.** Two bodies come down
 * an honest field first, so the pair has the wave's own rhythm before anything
 * is taken; and the body already falling when it turns crosses the screen in
 * one frame, which is a tell nobody has to be told about. The middle column
 * opens the wave and closes it on purpose: it is the one column the mirror
 * leaves where it is, and a pair that notices that has found their landmark.
 */
/**
 * **THE FILAMENT authors its filaments and nothing that falls.** The body is
 * the wave (`filament-script.ts`, `bossFillsWave`), and nothing in it strikes
 * the hull: what a fault costs is the filament, back to its free end, so the
 * wave is as long as the pair take over it and cannot be lost. The design
 * has no strike, and none is invented here (`docs/spec/bosses.md` §11).
 *
 * **Its guide is the only place the window is a number.** The pilot's screen
 * shows how far ahead he is and the navigator's how far behind she is, and
 * neither shows the other's, so *three* is what the pair has to carry in
 * their heads — the guide says it once and the picture never does again.
 * The panel is empty (`controls: "scene"`): there is no cannon to fire at a
 * line and no colour to load, only two thumbs on the field.
 */
/**
 * **THE GIMBAL keeps the default panel** where THE FILAMENT above it threw it
 * away, and the reason is row 9 of the design: two tooth pairs in, the drum
 * swings loose and a spark leaks from its seam, and the answer to a spark is a
 * bolt. A scene set (`controls: "scene"`) would leave the pair watching it
 * reach the hull with nothing on the band to put in its way
 * (`sim/gimbal-shot.ts`, `docs/spec/bosses.md` §11.34). The two rings are on
 * the field rather than on the panel, which is the one thing this boss borrows
 * from the scenes.
 *
 * **Its marks are the wave's** (`gimbal-script.ts`), three alignments and so
 * three latch-teeth a ring, and nothing in the wave falls: `entries` is empty
 * and the drum is the whole of it.
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theReprise",
    name: "THE REPRISE",
    sentence: "The one where the wave you have just beaten comes back with nothing to see.",
    guide: {
      both: "Everything you clear comes back down unseen, in the same columns, colours and spacing. New arrivals wait. No shield helps: shoot each body, or lose the wave.",
      p1: "1. Only your strip picks a column: slide it where they say it was.\n2. Say the colours back, in order. Your partner has the two buttons.\n3. The shield does nothing this wave. One body on the hull loses it.",
      p2: "1. Say every column while it is still lit, and again as the field goes dark.\n2. Press the colour they call, up the column they are standing in.\n3. Your shield does nothing here. Only the shot stops a body.",
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 3, color: "cyan" },
      { beat: 6, col: 6, color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 14, col: 4, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 6, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
  {
    id: "theFlip",
    name: "THE FLIP",
    sentence: "The one where the column you can see is the one it is not in.",
    guide: {
      both: "Six beats in, Player 1's screen turns into a mirror. A body on the left wall is really on the right. Buttons still work. Only the picture turned.",
      p1: "1. Your field is backwards and your cannon is not.\n2. A body on your left wall is one to shoot on your right.\n3. Only the middle column stays put. Trust your partner's number, not your eyes.",
      p2: "1. Yours is the only true picture, so the columns are all yours.\n2. Say each one early, and again while your partner aims.\n3. Your partner will not believe their eyes.\n4. Answer a repeated column with a number.",
      scene: "theFlip",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 28, col: 4, color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 36, col: 0, color: "red" },
      { beat: 40, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "flip", seat: 1, at: 6 }],
  },
  {
    id: "theHusk",
    name: "THE HUSK",
    sentence: "The one where taking the pod in is the mistake.",
    guide: {
      both: "Three pods hang, and one is hollow. It looks, beats and falls like the others. Swallow it and you lose. Let it reach a shut maw for free.",
      p1: "1. Your screen cannot tell them apart, so do not decide.\n2. Open the maw only for a pod your partner calls safe.\n3. Let every unnamed pod pass.",
      p2: "1. Only your screen frames the hollow one.\n2. Name the two real pods, by column, before either comes loose.\n3. Then name the fake and say to leave it.\n4. Saying nothing loses this wave.",
      scene: "theHusk",
    },
    entries: [
      { beat: 3, col: 0, color: "red" },
      { beat: 9, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 1, row: 3, kind: "ward" },
      { beat: 0, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 6, col: 5, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theFilament",
    name: "THE FILAMENT",
    sentence: "The one where you follow a line the other of you is still drawing.",
    guide: {
      both: "One of you draws the line, the other follows. One tile a beat, never faster. Stay within three tiles. Never share a tile until the last. Seven filaments.",
      p1: "1. Put your thumb on the lit end and draw up the filament, one tile a beat.\n2. You see how far ahead you are. Say your next tile before you take it.\n3. Faster than a beat snaps it. Wait for your partner.",
      p2: "1. Put your thumb on the lit end and follow the lit tiles behind your partner's.\n2. You see how far behind you are: say it. Past three, it goes dark.\n3. Never land on their tile, until the last one.",
    },
    entries: [],
    boss: { kind: "filament", filaments: FILAMENT_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "theGimbal",
    name: "THE GIMBAL",
    sentence: "The one where the same turn is not the same turn.",
    guide: {
      both: "A drum hangs in two rings, one each. Turn your ring to your mark and hold it. Both true breaks a tooth off each. A spark leaks late: shoot it.",
      p1: "1. The outer ring is yours. Drag round its rim to turn it.\n2. Hold it on your mark until both of you are true.\n3. Let go and your ring falls back to the top.",
      p2: "1. The inner ring is yours. Drag round its rim to turn it.\n2. Hold it on your mark until both of you are true.\n3. Your rim and theirs do not agree. Say where your mark is, not which way to turn.",
    },
    entries: [],
    boss: { kind: "gimbal", marks: GIMBAL_SCRIPT },
    bossType: "normal",
  },
];
