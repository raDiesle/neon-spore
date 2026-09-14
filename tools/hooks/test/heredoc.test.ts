import { describe, expect, it } from "bun:test";
import { heredocBodies, heredocRefusal } from "../heredoc.ts";

/**
 * The bodies a bash line carries, and the one thing the guard says about
 * them. The rule is about what the Bash *tool* does to the text before the
 * shell sees it — a doubled backslash halved — so what these hold is that the
 * scanner finds the body and nothing but the body, and that a single
 * backslash, which the tool leaves alone, is left alone here too.
 *
 * Counting backslashes in a JavaScript string is the whole difficulty, so the
 * two are named once: `ONE` is one backslash in the body the hook reads, `TWO`
 * is two.
 */
const ONE = "\\";
const TWO = "\\\\";

describe("heredocBodies", () => {
  it("finds the text between the command line and the delimiter", () => {
    const line = `cat <<'EOF' > out.txt\none ${ONE}d two\nthree\nEOF\n`;
    expect(heredocBodies(line)).toEqual([`one ${ONE}d two\nthree`]);
  });

  it("reads an unquoted and a dash delimiter, and an unclosed body to the end", () => {
    expect(heredocBodies("cat <<EOF\na\nEOF")).toEqual(["a"]);
    expect(heredocBodies("cat <<-EOF\n	a\n	EOF")).toEqual(["	a"]);
    expect(heredocBodies("cat <<EOF\na\nb")).toEqual(["a\nb"]);
    expect(heredocBodies("cat <<EOF\nEOF")).toEqual([""]);
  });

  it("finds each of two bodies on one line, and the command between them", () => {
    const line = "cat <<A > a\nfirst\nA\ncat <<B > b\nsecond\nB\n";
    expect(heredocBodies(line)).toEqual(["first", "second"]);
  });

  it("finds no body in a herestring or a line without a heredoc", () => {
    expect(heredocBodies(`cat <<< '${TWO}d'`)).toEqual([]);
    expect(heredocBodies(`echo '${TWO}' > file`)).toEqual([]);
    expect(heredocBodies("cat <<EOF")).toEqual([]);
  });
});

describe("heredocRefusal", () => {
  it("refuses a body carrying a doubled backslash, whatever quotes the delimiter", () => {
    const quoted = `cat <<'EOF' > a.ts\nconst re = /^${TWO}d{4}/;\nEOF`;
    expect(heredocRefusal(quoted)?.blocked).toContain("halves it");
    const doubleQuoted = `cat <<"EOF" > a.py\nb"${TWO}0"\nEOF`;
    expect(heredocRefusal(doubleQuoted)?.blocked).toContain("halves it");
    const bare = `cat <<EOF > a.ts\n\`\${t.length}${TWO}0\${t}\`\nEOF`;
    expect(heredocRefusal(bare)?.blocked).toContain("halves it");
  });

  it("names both ways that work", () => {
    const refusal = heredocRefusal(`cat <<EOF\n${TWO}\nEOF`);
    expect(refusal?.instead).toContain("Write or Edit tool");
    expect(refusal?.instead).toContain("chr(92)");
  });

  it("allows a body whose backslashes are single, which the tool keeps", () => {
    const path = `cat <<'EOF' > a.md\nC:${ONE}Users${ONE}raDi\nfive ${ONE}d six\nEOF`;
    expect(heredocRefusal(path)).toBeNull();
    expect(heredocRefusal(`cat <<'EOF'\nconst s = 'a${ONE}nb';\nEOF`)).toBeNull();
  });

  it("allows a doubled backslash on the command line itself, outside any body", () => {
    expect(heredocRefusal(`echo '${TWO}' && cat <<EOF\nplain\nEOF`)).toBeNull();
    expect(heredocRefusal(`cat <<EOF\nplain\nEOF\nprintf '${TWO}n'`)).toBeNull();
  });
});
