/**
 * The export pipeline — turns the project into a clean static site:
 *
 *     my-site/
 *     |- index.html      pretty-printed, semantic, section comments
 *     |- styles.css      base layer + .b-<id> overrides
 *     |- script.js       nav toggle + smooth anchors (< 1 KB)
 *     `- assets/         ONLY the images actually referenced
 *
 * Export is "preview output + writing files": the same generateSite()
 * with identity asset paths, so a working preview IS a working export.
 *
 * Guards run BEFORE any file is written (see runExportChecks): hard
 * blockers prevent export, missing images can be skipped consciously,
 * and warnings are always shown — never a silent surprise.
 */

import JSZip from "jszip";
import { exists, mkdir, readFile, size, writeFile } from "@tauri-apps/plugin-fs";
import { activePage } from "@/types/blocks";
import type { Project } from "@/types/blocks";
import { REGISTRY } from "@/blocks/registry";
import { walk } from "@/lib/tree";
import { generateSite } from "@/export/generator";
import { assetsDirPath, joinPath } from "@/lib/io";

/* ── asset collection ────────────────────────────────────────────── */

/** Every assets/ file referenced by the tree (images + backgrounds). */
export function collectUsedAssetNames(project: Project): string[] {
  const used = new Set<string>();
  walk(activePage(project).tree, (block) => {
    const src = (block.props as { src?: string }).src;
    if (typeof src === "string" && src.startsWith("assets/")) {
      used.add(src.slice("assets/".length));
    }
    const bg = block.styles.background?.image;
    if (typeof bg === "string" && bg.startsWith("assets/")) {
      used.add(bg.slice("assets/".length));
    }
  });
  return [...used];
}

/** The site files, as a path → content map (folder mode writes these). */
export function exportFileMap(project: Project): Map<string, string> {
  const site = generateSite(project); // identity asset paths — export-correct
  return new Map([
    ["index.html", site.html],
    ["styles.css", site.css],
    ["script.js", site.js],
  ]);
}

/* ── guards ──────────────────────────────────────────────────────── */

export interface ExportCheck {
  blockCount: number;
  assetCount: number;
  estimatedBytes: number;
  /** Cannot export at all (e.g. empty page). */
  hardBlockers: string[];
  /** Images missing from assets/ — exporting skips them (user opts in). */
  missingAssets: string[];
  /** Never silent: empty links, oversized images, oversized totals. */
  warnings: string[];
}

/** Pure checks — no disk access (fully unit-testable). */
function basicChecks(project: Project): ExportCheck {
  const tree = activePage(project).tree;
  const check: ExportCheck = {
    blockCount: 0,
    assetCount: 0,
    estimatedBytes: 0,
    hardBlockers: [],
    missingAssets: [],
    warnings: [],
  };

  walk(tree, () => check.blockCount++);

  if (check.blockCount === 0) {
    check.hardBlockers.push("The page is empty — add at least one block before exporting.");
  }

  walk(tree, (block) => {
    const href = (block.props as { href?: string }).href;
    if (typeof href === "string" && href.trim() === "") {
      check.warnings.push(
        `A ${REGISTRY[block.type].label} block has an empty link — clicking it will do nothing.`,
      );
    }
  });

  return check;
}

/**
 * Full checks, including disk: missing asset files, image sizes and
 * the estimated export size. Pure checks are reused as-is.
 */
export async function runExportChecks(
  project: Project,
  projectDir: string | null,
): Promise<ExportCheck> {
  const check = basicChecks(project);
  const site = generateSite(project);
  check.estimatedBytes = site.html.length + site.css.length + site.js.length;

  const used = collectUsedAssetNames(project);
  check.assetCount = used.length;

  if (projectDir) {
    for (const name of used) {
      const path = joinPath(assetsDirPath(projectDir), name);
      if (!(await exists(path))) {
        check.missingAssets.push(name);
        continue;
      }
      const bytes = await size(path);
      check.estimatedBytes += bytes;
      if (bytes > 2 * 1024 * 1024) {
        check.warnings.push(`"${name}" is over 2 MB — your site will load slowly.`);
      }
    }
    if (check.estimatedBytes > 20 * 1024 * 1024) {
      check.warnings.push("The export is over 20 MB in total — smaller images keep sites fast.");
    }
  }

  return check;
}

/* ── zip ─────────────────────────────────────────────────────────── */

export interface BuildZipOptions {
  /** Missing assets the user chose to skip (they simply won't be packed). */
  skipAssets?: Set<string>;
  /** Injectable asset loader (tests pass a fake; default reads disk). */
  loadAsset?: (fileName: string) => Promise<Uint8Array>;
}

/** Build the ZIP in memory — the unit-testable core of zip export. */
export async function buildZip(
  project: Project,
  projectDir: string | null,
  options: BuildZipOptions = {},
): Promise<Uint8Array> {
  const skip = options.skipAssets ?? new Set<string>();
  const loadAsset =
    options.loadAsset ??
    (async (name: string) => {
      if (!projectDir) throw new Error("Project has no folder on disk.");
      return new Uint8Array(await readFile(joinPath(assetsDirPath(projectDir), name)));
    });

  const zip = new JSZip();
  for (const [path, content] of exportFileMap(project)) {
    zip.file(path, content);
  }

  for (const name of collectUsedAssetNames(project)) {
    if (skip.has(name)) continue;
    zip.file(`assets/${name}`, await loadAsset(name));
  }

  const buffer = await zip.generateAsync({ type: "uint8array" });
  return new Uint8Array(buffer);
}

/** ZIP mode: write the archive to a user-chosen .zip path. */
export async function exportZip(
  project: Project,
  projectDir: string,
  zipPath: string,
  skipAssets: Set<string> = new Set(),
): Promise<void> {
  const buffer = await buildZip(project, projectDir, { skipAssets });
  await writeFile(zipPath, buffer);
}

/** Folder mode: the same files, written unzipped to a chosen directory. */
export async function exportFolder(
  project: Project,
  projectDir: string,
  targetDir: string,
  skipAssets: Set<string> = new Set(),
): Promise<void> {
  const encoder = new TextEncoder();
  const assetsPath = joinPath(targetDir, "assets");

  await mkdir(assetsPath, { recursive: true });
  for (const [path, content] of exportFileMap(project)) {
    await writeFile(joinPath(targetDir, path), encoder.encode(content));
  }

  for (const name of collectUsedAssetNames(project)) {
    if (skipAssets.has(name)) continue;
    const bytes = new Uint8Array(
      await readFile(joinPath(assetsDirPath(projectDir), name)),
    );
    await writeFile(joinPath(assetsPath, name), bytes);
  }
}
