import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  buildZip,
  collectUsedAssetNames,
  exportFileMap,
  runExportChecks,
} from "./export";
import { createBlock } from "@/blocks/registry";
import { createEmptyProject } from "@/lib/tree";
import type {
  BlockNode,
  ButtonProps,
  ImageProps,
} from "@/types/blocks";

/* ── fixtures ─────────────────────────────────────────────────────── */

function projectWith(tree: BlockNode[]) {
  const project = createEmptyProject("Export Test");
  project.pages[0].tree = tree;
  return project;
}

function image(src: string): BlockNode {
  return {
    ...createBlock("image"),
    props: { src, alt: "sample" } as ImageProps,
  };
}

const fakeLoader = async (name: string) =>
  new TextEncoder().encode(`<svg id="${name}"/>`);

/* ── tests ───────────────────────────────────────────────────────── */

describe("collectUsedAssetNames", () => {
  it("collects image srcs and background images, deduplicated", () => {
    const hero: BlockNode = {
      ...createBlock("hero"),
      styles: { background: { color: "#000000", image: "assets/b.svg" } },
    };
    const project = projectWith([image("assets/a.svg"), hero, image("assets/a.svg")]);
    expect(collectUsedAssetNames(project).sort()).toEqual(["a.svg", "b.svg"]);
  });

  it("returns an empty list for a project without images", () => {
    expect(collectUsedAssetNames(projectWith([createBlock("hero")]))).toEqual([]);
  });

  it("ignores external URLs (only project assets export)", () => {
    const project = projectWith([image("https://example.com/x.png")]);
    expect(collectUsedAssetNames(project)).toEqual([]);
  });
});

describe("runExportChecks (pure part — no disk)", () => {
  it("flags an empty page as a hard blocker", async () => {
    const check = await runExportChecks(projectWith([]), null);
    expect(check.hardBlockers).toHaveLength(1);
    expect(check.blockCount).toBe(0);
  });

  it("counts all blocks (hero children included) and warns on empty hrefs", async () => {
    const button: BlockNode = {
      ...createBlock("button"),
      props: { label: "Go", href: "" } as ButtonProps,
    };
    const check = await runExportChecks(projectWith([createBlock("hero"), button]), null);
    // hero + its 3 default children + button
    expect(check.blockCount).toBe(5);
    expect(check.warnings.some((w) => w.includes("empty link"))).toBe(true);
  });

  it("counts referenced assets and skips disk checks without a project dir", async () => {
    const check = await runExportChecks(projectWith([image("assets/pic.svg")]), null);
    expect(check.assetCount).toBe(1);
    expect(check.missingAssets).toEqual([]);
    expect(check.hardBlockers).toEqual([]);
  });

  it("never reports a warning for filled hrefs", async () => {
    const button: BlockNode = {
      ...createBlock("button"),
      props: { label: "Go", href: "https://example.com" } as ButtonProps,
    };
    const check = await runExportChecks(projectWith([button]), null);
    expect(check.warnings).toEqual([]);
  });
});

describe("exportFileMap", () => {
  it("contains the three site files with generated content", () => {
    const map = exportFileMap(projectWith([createBlock("hero")]));
    expect([...map.keys()].sort()).toEqual(["index.html", "script.js", "styles.css"]);
    expect(map.get("index.html")).toContain("<!doctype html>");
    expect(map.get("styles.css")).toContain(".lw-hero {");
    expect(map.get("script.js")).toContain("lw-navbar__toggle");
  });
});

describe("buildZip (real JSZip round-trip)", () => {
  it("packs the site files plus every referenced asset", async () => {
    const hero: BlockNode = {
      ...createBlock("hero"),
      styles: { background: { image: "assets/b.svg" } },
    };
    const bytes = await buildZip(projectWith([image("assets/a.svg"), hero]), null, {
      loadAsset: fakeLoader,
    });

    const zip = await JSZip.loadAsync(bytes);
    expect(zip.file("index.html")).not.toBeNull();
    expect(zip.file("styles.css")).not.toBeNull();
    expect(zip.file("script.js")).not.toBeNull();
    expect(zip.file("assets/a.svg")).not.toBeNull();
    expect(zip.file("assets/b.svg")).not.toBeNull();

    const html = await zip.file("index.html")!.async("string");
    expect(html).toContain("<!doctype html>");
  });

  it("omits assets the user chose to skip", async () => {
    const bytes = await buildZip(projectWith([image("assets/a.svg")]), null, {
      loadAsset: fakeLoader,
      skipAssets: new Set(["a.svg"]),
    });
    const zip = await JSZip.loadAsync(bytes);
    expect(zip.file("assets/a.svg")).toBeNull();
  });

  it("adds no asset files for an image-free project", async () => {
    const bytes = await buildZip(projectWith([createBlock("text")]), null, {
      loadAsset: fakeLoader,
    });
    const zip = await JSZip.loadAsync(bytes);
    const names = Object.keys(zip.files).filter((n) => n !== "assets/");
    expect(names.some((n) => n.startsWith("assets/"))).toBe(false);
  });
});
