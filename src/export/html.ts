/**
 * generateHtml — the exported page's semantic markup.
 *
 * Mirrors the canvas spec-sheets EXACTLY (same classes, same structure as
 * the block components in src/blocks/): every block root carries its
 * Layer-1 class (lw-*) plus its unique b-<id> hook for the override rules
 * in styles.css. Output is pretty-printed with section comments — users
 * read their exported code, so it must feel hand-written.
 */

import type {
  BlockNode,
  ButtonProps,
  FooterProps,
  FontFamilyToken,
  HeadingProps,
  ImageProps,
  LinkProps,
  NavbarProps,
  Project,
  TextProps,
} from "@/types/blocks";
import { REGISTRY } from "@/blocks/registry";
import { walk } from "@/lib/tree";
import {
  SCRIPT_PLACEHOLDER,
  STYLES_PLACEHOLDER,
  escapeHtml,
  identityAsset,
  treeOf,
  MENU_ICON_SVG,
  type GenerateOptions,
} from "./shared";

/** Google fonts we know how to link (system/serif/mono stacks need none). */
const GOOGLE_FONTS: Partial<Record<FontFamilyToken, string>> = {
  inter: "Inter:wght@400;500;600;700",
  poppins: "Poppins:wght@400;500;600;700",
  playfair: "Playfair+Display:wght@400;500;600;700",
  merriweather: "Merriweather:wght@400;700",
  lora: "Lora:wght@400;500;600;700",
};

/** One <link> for every Google font actually used in the tree. */
function googleFontLinks(project: Project): string[] {
  const used = new Set<FontFamilyToken>();
  walk(treeOf(project), (block) => {
    const family = block.styles.typography?.fontFamily;
    if (family) used.add(family);
  });

  const families = [...used].map((f) => GOOGLE_FONTS[f]).filter(Boolean);
  if (families.length === 0) return [];

  return [
    '  <link rel="preconnect" href="https://fonts.googleapis.com">',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `  <link href="https://fonts.googleapis.com/css2?${families
      .map((f) => `family=${f}`)
      .join("&")}&display=swap" rel="stylesheet">`,
  ];
}

export function generateHtml(project: Project, opts?: GenerateOptions): string {
  const resolveAsset = opts?.resolveAsset ?? identityAsset;

  const lines: string[] = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(project.name)}</title>`,
    `  ${STYLES_PLACEHOLDER}`,
    ...googleFontLinks(project),
    "</head>",
    "<body>",
  ];

  for (const block of treeOf(project)) {
    const rendered = renderBlock(block, 1, resolveAsset);
    if (rendered === "") continue; // e.g. an image block with no file chosen
    lines.push(`  <!-- ${REGISTRY[block.type].label} -->`);
    lines.push(rendered);
  }

  lines.push(`  ${SCRIPT_PLACEHOLDER}`);
  lines.push("</body>");
  lines.push("</html>");
  return lines.join("\n") + "\n";
}

function renderBlock(
  block: BlockNode,
  depth: number,
  resolveAsset: (rel: string) => string,
): string {
  const pad = "  ".repeat(depth);
  /** Layer-1 class + the per-block override hook. */
  const cls = (base: string) => `${base} b-${block.id}`;

  const renderChildren = (): string =>
    (block.children ?? [])
      .map((child) => renderBlock(child, depth + 2, resolveAsset))
      .filter((s) => s !== "")
      .join("\n");

  switch (block.type) {
    case "navbar": {
      const props = block.props as NavbarProps;
      const links = props.links
        .map(
          (link) =>
            `${pad}    <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
        )
        .join("\n");
      return [
        `${pad}<header class="${cls("lw-navbar")}">`,
        `${pad}  <a class="lw-navbar__brand" href="#">${escapeHtml(props.brand)}</a>`,
        `${pad}  <nav class="lw-navbar__links">`,
        links,
        `${pad}  </nav>`,
        `${pad}  <button type="button" class="lw-navbar__toggle" aria-label="Toggle menu" aria-expanded="false">`,
        `${pad}    ${MENU_ICON_SVG}`,
        `${pad}  </button>`,
        `${pad}</header>`,
      ]
        .filter((line) => line !== "")
        .join("\n");
    }

    case "hero":
      return [
        `${pad}<section class="${cls("lw-hero")}">`,
        `${pad}  <div class="lw-hero__inner">`,
        renderChildren(),
        `${pad}  </div>`,
        `${pad}</section>`,
      ].join("\n");

    case "heading": {
      const props = block.props as HeadingProps;
      const tag = `h${props.level ?? 2}`;
      return `${pad}<${tag} class="${cls("lw-heading")}">${escapeHtml(props.text)}</${tag}>`;
    }

    case "text": {
      const props = block.props as TextProps;
      // Newlines stay in the source; `.lw-text { white-space: pre-line }`
      // renders them — same as the canvas, byte for byte.
      return `${pad}<div class="${cls("lw-text")}">${escapeHtml(props.text)}</div>`;
    }

    case "image": {
      const props = block.props as ImageProps;
      if (!props.src) return ""; // the editor placeholder is chrome, not site content
      return [
        `${pad}<figure class="${cls("lw-image")}">`,
        `${pad}  <img src="${escapeHtml(resolveAsset(props.src))}" alt="${escapeHtml(props.alt)}">`,
        `${pad}</figure>`,
      ].join("\n");
    }

    case "button": {
      const props = block.props as ButtonProps;
      const attrs = props.newTab ? ' target="_blank" rel="noreferrer"' : "";
      return `${pad}<a class="${cls("lw-btn")}" href="${escapeHtml(props.href)}"${attrs}>${escapeHtml(props.label)}</a>`;
    }

    case "link": {
      const props = block.props as LinkProps;
      return `${pad}<a class="${cls("lw-link")}" href="${escapeHtml(props.href)}">${escapeHtml(props.label)}</a>`;
    }

    case "footer": {
      const props = block.props as FooterProps;
      const links = props.links
        .map(
          (link) =>
            `${pad}    <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
        )
        .join("\n");
      return [
        `${pad}<footer class="${cls("lw-footer")}">`,
        `${pad}  <div class="lw-footer__top">`,
        `${pad}    <span class="lw-footer__brand">${escapeHtml(props.brand)}</span>`,
        `${pad}    <nav class="lw-footer__links">`,
        links,
        `${pad}    </nav>`,
        `${pad}  </div>`,
        `${pad}  <div class="lw-footer__body">`,
        renderChildren(),
        `${pad}    <span class="lw-footer__copy">${escapeHtml(props.text)}</span>`,
        `${pad}  </div>`,
        `${pad}</footer>`,
      ]
        .filter((line) => line !== "")
        .join("\n");
    }
  }
}
