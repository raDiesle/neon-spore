/**
 * Why none of THE PULSE's twelve sounds has a picture.
 *
 * `sound-link.ts` gives every bound sound a card off the shape sheet, and
 * `test/sound-link.test.ts` holds that line — a sound with no subject has to
 * say so in a sentence. This round produces twelve of them at once, which is
 * the whole reason they are in a file of their own rather than at the bottom
 * of a list of one-offs next door.
 *
 * **And they share one answer.** The shape sheet's cards are *silhouettes of
 * bodies*, and THE PULSE has no bodies in it: what makes every one of these
 * sounds is a moment in a song — a step of a grid, an arrow crossing a line, a
 * thumb landing early. The arrows are drawn (`render/pulse-arrow.ts`) but an
 * arrow is a mark rather than a creature, and putting one on a sheet of
 * contours would say it is a thing that could arrive on the field, which is
 * exactly what a round is not. So each entry below says what its own moment
 * is, and the shared half of the reason is here.
 */
export const PULSE_NO_SUBJECT: Record<string, string> = {
  "boss.pulseLeft": "an arrow crossing the line in the left lane. A moment in a song, not a body.",
  "boss.pulseDown": "an arrow crossing the line one lane over. The same moment in the same song.",
  "boss.pulseUp":
    "and the third lane. Nothing about it is a body either — a lane is a place on a screen.",
  "boss.pulseRight":
    "and the fourth. Four sounds, one argument: a song is made of moments, not of creatures.",
  "boss.pulseKick": "the first step of a beat. The grid the arrows are laid on has no body either.",
  "boss.pulseBass":
    "the bass note under a bar. A grid has no more of a silhouette than a beat does.",
  "boss.pulseHat":
    "the two steps of a beat that are not the first. The shuffle, and the same argument once more.",
  "boss.pulseHit":
    "a thumb landing inside the clean window. What it is attached to is a piece of timing — the arrow is already drawn and this is the sound of it having been right.",
  "boss.pulseMiss":
    "an arrow nobody answered, or a press at nothing. The subject is an absence, the way ui.waveClear's is.",
  "boss.pulseVeil":
    "a veiled arrow entering the lanes. The one thing in the round that *is* a picture — an arrow with its heading cycling — and it is the same arrow the other three lane sounds belong to, drawn differently on one screen. There is no second body to card.",
  "boss.pulseClear":
    "a stage finished with the meter alive. An outcome, not a thing standing anywhere.",
  "boss.pulseFlat":
    "the meter emptied and the song stopping. The same absence, going the other way.",
};
