/**
 * Automated export QA — the plan's "output quality bar", verified for
 * every project type (all 3 templates + a hero page) without touching
 * disk: the sample asset loader serves the template's embedded SVGs.
 *
 * The remaining (visual) QA cell is human: unzip → double-click
 * index.html → works from file:// — that's the user's checklist item.
 */

import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { buildZip, exportFileMap } from "@/lib/export";
import { generateSite } from "@/export/generator";
import { createBlock } from "@/blocks/registry";
import { createEmptyProject } from "@/lib/tree";
import { TEMPLATES } from "@/templates";
import type { Project } from "@/types/blocks";

const BUDGET_TEXT_FILES = 100 * 1024; // html + css + js combined, no images

type Loader = (fileName: string) => Promise<Uint8Array>;

const cases: Array<{ name: string; make: () => { project: Project; loader: Loader } }> =
  TEMPLATES.map((template) => ({
    name: `${template.name} template`,
    make: () => {
      const { project, sampleFiles } = template.create(`QA ${template.name}`);
      const loader: Loader = async (fileName) => {
        const file = sampleFiles.find((f) => f.fileName === fileName);
        if (!file) throw new Error(`QA loader: missing ${fileName}`);
        return new TextEncoder().encode(file.content);
      };
      return { project, loader };
    },
  }));

function buildCase(): { project: Project; loader: Loader } {
  const project = createEmptyProject("QA Hero");
  project.pages[0].tree = [createBlock("hero")];
  return { project, loader: async () => new Uint8Array() };
}

cases.push({ name: "hero page (no images)", make: buildCase });

describe("export quality bar", () => {
  for (const testCase of cases) {
    describe(testCase.name, () => {
      const { project, loader } = testCase.make();
      const site = generateSite(project);
      const bytesPromise = buildZip(project, null, { loadAsset: loader });

      it("ships index.html with viewport meta and a title", () => {
        expect(site.html).toContain('<meta name="viewport"');
        expect(site.html).toContain(`<title>${project.name}</title>`);
      });

      it("keeps script.js under 1 KB", () => {
        expect(site.js.length).toBeLessThan(1024);
      });

      it("keeps html + css + js under 100 KB (excluding images)", () => {
        const total = site.html.length + site.css.length + site.js.length;
        expect(total).toBeLessThan(BUDGET_TEXT_FILES);
      });

      it("contains no absolute or app-internal paths", () => {
        const all = site.html + site.css + site.js;
        expect(all).not.toContain("C:\\");
        expect(all).not.toContain("file://");
        expect(all).not.toContain("asset://");
        expect(all).not.toContain("localhost");
      });

      it("packs every referenced asset into the zip (real round-trip)", async () => {
        const zip = await JSZip.loadAsync(await bytesPromise);
        expect(zip.file("index.html")).not.toBeNull();
        expect(zip.file("styles.css")).not.toBeNull();
        expect(zip.file("script.js")).not.toBeNull();
        // Images referenced by the tree must exist as entries:
        for (const record of project.assets) {
          expect(
            zip.file(`assets/${record.fileName}`),
            `missing zip entry: ${record.fileName}`,
          ).not.toBeNull();
        }
      });

      it("exports identical file content on re-export (idempotent)", () => {
        const first = exportFileMap(project);
        const second = exportFileMap(project);
        for (const path of ["index.html", "styles.css", "script.js"]) {
          expect(first.get(path)).toBe(second.get(path));
        }
      });
    });
  }
});
