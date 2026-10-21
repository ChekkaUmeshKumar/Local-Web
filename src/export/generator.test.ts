import { describe, expect, it } from "vitest";
import { generateSite, generateHtml, generateCss, generateJs } from "./generator";
import { escapeHtml } from "./shared";
import { createBlock } from "@/blocks/registry";
import { createEmptyProject } from "@/lib/tree";
import type {
  BlockNode,
  HeadingProps,
  ImageProps,
  Project,
} from "@/types/blocks";

/* ── fixture ─────────────────────────────────────────────────────── */

/**
 * Rewrite every id (blocks AND nav links) with deterministic sequential
 * ones — the golden snapshot must be byte-stable across runs.
 */
function withFixedIds(tree: BlockNode[]): BlockNode[] {
  let blockCount = 0;
  let linkCount = 0;

  const relabel = (block: BlockNode): BlockNode => {
    const next: BlockNode = {
      ...block,
      id: `block${String(++blockCount).padStart(3, "0")}`,
    };
    const props = { ...(next.props as Record<string, unknown>) };
    if (Array.isArray(props.links)) {
      props.links = (props.links as Array<Record<string, unknown>>).map((link) => ({
        ...link,
        id: `link${String(++linkCount).padStart(3, "0")}`,
      }));
    }
    next.props = props as BlockNode["props"];
    if (next.children) next.children = next.children.map(relabel);
    return next;
  };

  return tree.map(relabel);
}

function fixtureProject(): Project {
  const navbar = createBlock("navbar");

  const hero: BlockNode = {
    ...createBlock("hero"),
    styles: {
      typography: { fontFamily: "playfair", fontSize: "2xl" },
      colors: { text: "#f8fafc" },
      background: { color: "#0f172a" },
      spacing: { padding: "xl" },
    },
  };

  const escapedHeading: BlockNode = {
    ...createBlock("heading"),
    props: { text: 'Try <script>alert("x")</script>', level: 2 } as HeadingProps,
  };

  const image: BlockNode = {
    ...createBlock("image"),
    props: { src: "assets/pic.png", alt: "A photo" } as ImageProps,
  };

  const emptyImage = createBlock("image"); // no file chosen → skipped in output

  const project = createEmptyProject("Fixture Site");
  project.pages[0].tree = withFixedIds([navbar, hero, escapedHeading, image, emptyImage]);
  return project;
}

/* ── tests ───────────────────────────────────────────────────────── */

describe("generator", () => {
  it("is deterministic: same tree, byte-identical output", () => {
    const a = generateSite(fixtureProject());
    const b = generateSite(fixtureProject());
    expect(a.html).toBe(b.html);
    expect(a.css).toBe(b.css);
    expect(a.js).toBe(b.js);
  });

  it("emits the page skeleton with title, styles.css and script.js", () => {
    const html = generateHtml(fixtureProject());
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<title>Fixture Site</title>");
    expect(html).toContain('<link rel="stylesheet" href="styles.css">');
    expect(html).toContain('<script src="script.js"></script>');
    expect(html.trimEnd().endsWith("</html>")).toBe(true);
  });

  it("gives every block its lw-* class and b-<id> hook", () => {
    // Fixed-id order: navbar=001, hero=002, hero children 003-005,
    // heading=006, image=007, empty image=008.
    const html = generateHtml(fixtureProject());
    expect(html).toContain('class="lw-navbar b-block001"');
    expect(html).toContain('class="lw-hero b-block002"');
    expect(html).toContain('class="lw-heading b-block003"');
    expect(html).toContain('class="lw-text b-block004"');
    expect(html).toContain('class="lw-btn b-block005"');
    expect(html).toContain('class="lw-image b-block007"');
  });

  it("skips image blocks with no file chosen (editor chrome is not site content)", () => {
    const html = generateHtml(fixtureProject());
    expect(html).toContain('src="assets/pic.png"');
    expect(html).not.toContain("block008"); // the empty image: no markup, no comment
  });

  it("maps image srcs through resolveAsset and keeps them relative by default", () => {
    const mapped = generateHtml(fixtureProject(), {
      resolveAsset: (rel) => `asset://${rel}`,
    });
    expect(mapped).toContain('src="asset://assets/pic.png"');

    const identity = generateHtml(fixtureProject());
    expect(identity).toContain('src="assets/pic.png"');
  });

  it("links only the Google fonts actually used in the tree", () => {
    const html = generateHtml(fixtureProject()); // hero uses playfair
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("family=Playfair+Display");

    const plain = createEmptyProject("Plain");
    plain.pages[0].tree = [createBlock("hero")]; // no font styles
    const plainHtml = generateHtml(plain);
    expect(plainHtml).not.toContain("fonts.googleapis.com");
  });

  it("neutralizes markup in text content", () => {
    const html = generateHtml(fixtureProject());
    expect(html).not.toContain("<script>alert");
    // The escaped form of the whole phrase must be present verbatim:
    expect(html).toContain(escapeHtml('Try <script>alert("x")</script>'));
  });

  it("emits the base layer verbatim plus per-block override rules", () => {
    const css = generateCss(fixtureProject());
    // Base layer (blocks.css content):
    expect(css).toContain("/* styles.css — generated with LocalWeb */");
    expect(css).toContain(".lw-hero {");
    expect(css).toContain(".lw-navbar__open .lw-navbar__links {");
    // Override rule for the styled hero (kebab-case + custom property):
    expect(css).toContain("/* Hero */");
    expect(css).toContain(".b-block002 {");
    expect(css).toContain("background-color: #0f172a;");
    expect(css).toContain("font-family:");
    expect(css).toContain("--lw-text-color: #f8fafc;");
    expect(css).toContain("padding: 64px;");
    // Unstyled blocks emit no rules:
    expect(css).not.toContain(".b-block001");
    expect(css).not.toContain(".b-block003");
  });

  it("keeps background images relative for export and maps them for preview", () => {
    const project = fixtureProject();
    const hero = project.pages[0].tree[1];
    hero.styles = {
      ...hero.styles,
      background: { color: "#0f172a", image: "assets/hero-bg.svg" },
    };

    expect(generateCss(project)).toContain('url("assets/hero-bg.svg")');
    expect(
      generateCss(project, { resolveAsset: (rel) => `http://x/${rel}` }),
    ).toContain('url("http://x/assets/hero-bg.svg")');
  });

  it("ships a tiny vanilla script with the nav toggle and smooth anchors", () => {
    const js = generateJs();
    expect(js).toContain("lw-navbar__toggle");
    expect(js).toContain("lw-navbar__open");
    expect(js).toContain("scrollIntoView");
    expect(js.length).toBeLessThan(1500);
  });

  it("golden snapshot of the whole generated site (update = intentional change)", () => {
    expect(generateSite(fixtureProject())).toMatchSnapshot();
  });
});

describe("escapeHtml", () => {
  it("neutralizes angle brackets, quotes and ampersands", () => {
    const escaped = escapeHtml('<script>alert("x & y")</script>');
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
    expect(escaped).not.toContain('"');
    expect(escaped).toContain("script");
    expect(escaped).toContain("alert");
  });
});
