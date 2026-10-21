import { describe, expect, it } from "vitest";
import { generateSite } from "@/export/generator";
import { walk } from "@/lib/tree";
import type { BlockType } from "@/types/blocks";
import { TEMPLATES } from "./index";

const ALL_BLOCK_TYPES: BlockType[] = [
  "navbar",
  "hero",
  "heading",
  "text",
  "image",
  "button",
  "link",
  "footer",
];

describe("templates", () => {
  for (const template of TEMPLATES) {
    describe(`${template.name} (${template.id})`, () => {
      const { project, sampleFiles } = template.create("Test Project");
      const tree = project.pages[0].tree;

      it("names the project and builds a real page", () => {
        expect(project.name).toBe("Test Project");
        let total = 0;
        walk(tree, () => total++);
        expect(total).toBeGreaterThanOrEqual(12); // 10–14 blocks per the plan
      });

      it("has unique block ids across the whole tree", () => {
        const ids = new Set<string>();
        walk(tree, (block) => {
          expect(ids.has(block.id), `duplicate id ${block.id}`).toBe(false);
          ids.add(block.id);
        });
        expect(ids.size).toBeGreaterThan(10);
      });

      it("uses every block type at least once (templates double as demos)", () => {
        const used = new Set<string>();
        walk(tree, (block) => used.add(block.type));
        for (const type of ALL_BLOCK_TYPES) {
          expect(used.has(type), `missing block type: ${type}`).toBe(true);
        }
      });

      it("references only bundled sample assets — and every asset record ships a file", () => {
        const fileNames = new Set(sampleFiles.map((f) => f.fileName));
        expect(fileNames.size).toBeGreaterThan(0);

        const referenced = new Set<string>();
        walk(tree, (block) => {
          const src = (block.props as { src?: string }).src;
          if (src) referenced.add(src);
          const bg = block.styles.background?.image;
          if (bg) referenced.add(bg);
        });

        for (const ref of referenced) {
          expect(ref.startsWith("assets/")).toBe(true);
          expect(fileNames.has(ref.slice("assets/".length)), `missing sample: ${ref}`).toBe(true);
        }

        for (const record of project.assets) {
          expect(fileNames.has(record.fileName)).toBe(true);
        }
      });

      it("generates cleanly through the site generator (preview/export ready)", () => {
        const site = generateSite(project);
        expect(site.html).toContain("<!doctype html>");
        expect(site.css).toContain(".lw-hero {");
        // Every bundled sample image is referenced somewhere in the site
        // (image blocks appear in the HTML; hero backgrounds in the CSS):
        const wholeSite = site.html + site.css;
        for (const file of sampleFiles) {
          expect(wholeSite).toContain(`assets/${file.fileName}`);
        }
        // Sample files carry real SVG content (not empty placeholders):
        for (const file of sampleFiles) {
          expect(file.content).toContain("<svg");
        }
      });

      it("ships a wireframe thumbnail for the chooser card", () => {
        expect(template.thumbnail).toContain("<svg");
      });
    });
  }
});
