/**
 * What `bun run shot` prints when it is called with nothing to photograph.
 *
 * Its own file because `shot.ts` sits on the 250-line ceiling and every flag
 * that file grows costs two lines here as well — the argument for each flag
 * lives beside where it is read, and this is only the list. A caller that
 * reaches the end of it has said nothing this tool can act on, so it exits.
 */
export function usage(): never {
  console.error(
    'usage: bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab GRAPHICS] [--wait 2500]',
  );
  console.error('       --click is a CSS selector pressed first, e.g. ".cell:has(img)"');
  console.error("       --nth is which of its matches to press, counting from 1");
  console.error('       --inner is a tab inside the sheet --open just opened, e.g. "SPEC"');
  console.error('       --path is what the port is asked for, e.g. "/?play=1" — the field itself');
  console.error("       --size is a viewport, e.g. 390x844 — a phone, for something a phone shows");
  console.error("       --open is a header button to press first, for a sheet that starts hidden");
  console.error(
    "       --tab is a NOT BUILT YET tab name (SHAPES still means GRAPHICS); omit it for the main screen",
  );
  console.error("       --at is a rectangle inside it, x,y,w,h in its own CSS pixels");
  console.error('       --type fills a field first, e.g. "#waveFilter=boss"');
  console.error('       --select turns a <select> first, e.g. ".versus-rate=0.25"');
  console.error("       --wait is milliseconds to settle before the shot, for an animation");
  console.error("       --hold is a modifier key held down for the shot, e.g. Control");
  process.exit(1);
}
