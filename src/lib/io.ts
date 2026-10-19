/**
 * Pure disk I/O for LocalWeb projects (no store, no UI — that's
 * project-actions.ts). Every project is a plain folder:
 *
 *     MyWebsite/
 *     ├─ project.json     ← single source of truth (pretty-printed)
 *     └─ assets/          ← created with the project, filled in Phase 3
 *
 * Path rules (memorize):
 *   - project.json stores ONLY relative paths ("assets/foo.png")
 *   - absolute paths live in app state, never in the file
 *   - always join with forward slashes — Tauri fs accepts them on Windows
 */

import {
  copyFile,
  exists,
  mkdir,
  readTextFile,
  remove,
  size,
  writeFile,
} from "@tauri-apps/plugin-fs";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { nanoid } from "nanoid";
import { SCHEMA_VERSION } from "@/types/blocks";
import type { AssetRecord, Project } from "@/types/blocks";
import { createEmptyProject } from "@/lib/tree";

export const PROJECT_FILE = "project.json";
export const ASSETS_DIR = "assets";
const CORRUPTED_BACKUP = "project.corrupted-backup.json";

/* ── path helpers ────────────────────────────────────────────────── */

/** Normalize Windows separators and join with forward slashes. */
export function joinPath(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .map((p) => p.replace(/\\/g, "/"))
    .join("/")
    .replace(/\/{2,}/g, "/");
}

/** Directory containing a file path (forward-slash safe). */
export function parentDir(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const i = normalized.lastIndexOf("/");
  return i === -1 ? "" : normalized.slice(0, i);
}

export function projectFilePath(dir: string): string {
  return joinPath(dir, PROJECT_FILE);
}

export function assetsDirPath(dir: string): string {
  return joinPath(dir, ASSETS_DIR);
}

/** "Bakery In Lisbon!" → "bakery-in-lisbon" (safe folder name). */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "my-site";
}

/* ── create / save / open ────────────────────────────────────────── */

/** Create the project folder (name → slug), assets dir and project.json. */
export async function createProjectOnDisk(
  name: string,
  parentDirectory: string,
): Promise<{ project: Project; dir: string }> {
  const dir = joinPath(parentDirectory, slugify(name));
  if (await exists(dir)) {
    throw new Error(`"${dir}" already exists — pick another name or location.`);
  }
  await mkdir(dir);
  await mkdir(assetsDirPath(dir));

  const project = createEmptyProject(name);
  await saveProjectToDisk(project, dir);
  return { project, dir };
}

/** Serialize + write the project file (pretty JSON, 2 spaces). */
export async function saveProjectToDisk(project: Project, dir: string): Promise<void> {
  await writeFile(projectFilePath(dir), new TextEncoder().encode(JSON.stringify(project, null, 2)));
}

export interface LoadedProject {
  project: Project;
  dir: string;
  jsonPath: string;
}

/**
 * Read + validate a project.json. On CORRUPTED content, the broken file is
 * backed up next to itself and an error is thrown — we never crash and
 * never destroy the user's file.
 */
export async function openProjectFromDisk(jsonPath: string): Promise<LoadedProject> {
  const dir = parentDir(jsonPath);

  let raw: string;
  try {
    raw = await readTextFile(jsonPath);
  } catch (err) {
    throw new Error(`Could not read the project file: ${String(err)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      await writeFile(joinPath(dir, CORRUPTED_BACKUP), new TextEncoder().encode(raw));
    } catch {
      /* backup is best-effort */
    }
    throw new Error(
      "This project file is corrupted. A backup was saved next to it as project.corrupted-backup.json.",
    );
  }

  const project = validateProject(parsed);
  return { project, dir, jsonPath };
}

/** Structural validation — version + pages + tree + assets. */
function validateProject(raw: unknown): Project {
  if (raw === null || typeof raw !== "object") {
    throw new Error("Not a valid LocalWeb project file.");
  }
  const p = raw as Record<string, unknown>;

  if (p.version !== SCHEMA_VERSION) {
    throw new Error(
      `Unsupported project version "${String(p.version)}" — this file was created by a different version of LocalWeb.`,
    );
  }
  if (typeof p.name !== "string") throw new Error("Project file is missing its name.");
  if (!Array.isArray(p.pages) || p.pages.length === 0) {
    throw new Error("Project file has no pages.");
  }
  const home = p.pages[0] as Record<string, unknown>;
  if (!Array.isArray(home.tree)) throw new Error("Project file has a broken page tree.");
  if (!Array.isArray(p.assets)) throw new Error("Project file has a broken asset list.");

  return raw as Project;
}

/* ── recents (app config dir) ────────────────────────────────────── */

export interface RecentProject {
  name: string;
  dir: string;
  updatedAt: string;
}

async function recentsFilePath(): Promise<string> {
  const configDir = await appConfigDir();
  return join(configDir, "recent.json");
}

export async function loadRecents(): Promise<RecentProject[]> {
  try {
    const path = await recentsFilePath();
    if (!(await exists(path))) return [];
    const raw = JSON.parse(await readTextFile(path));
    return Array.isArray(raw) ? (raw as RecentProject[]) : [];
  } catch {
    return [];
  }
}

/** Keep the newest first, unique by dir, capped at 5. */
export async function addRecentProject(entry: RecentProject): Promise<void> {
  const recents = await loadRecents();
  const next = [entry, ...recents.filter((r) => r.dir !== entry.dir)].slice(0, 5);
  const path = await recentsFilePath();
  await mkdir(await appConfigDir(), { recursive: true }).catch(() => {});
  await writeFile(path, new TextEncoder().encode(JSON.stringify(next, null, 2)));
}

/* ── asset pipeline (Phase 3) ─────────────────────────────────────── */

/** v1 accepts these image formats. */
export const ASSET_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];

/** Hard limit — keeps projects and exported sites fast. Compression is v2. */
export const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export const IMAGE_DIALOG_FILTERS = [
  { name: "Images", extensions: ASSET_EXTENSIONS },
];

function mimeFromExtension(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

/**
 * Import an image: validate type + size, copy it into the project's
 * assets/ folder under a collision-safe name, and return its record.
 * The STORED reference (props.src / background.image) is always the
 * relative "assets/<fileName>" — the canvas converts via displaySrc.
 */
export async function importAsset(
  sourcePath: string,
  projectDir: string,
): Promise<AssetRecord> {
  const ext = (sourcePath.split(".").pop() ?? "").toLowerCase();
  if (!ASSET_EXTENSIONS.includes(ext)) {
    throw new Error(
      `.${ext || "?"} files aren't supported — use ${ASSET_EXTENSIONS.join(", ")}.`,
    );
  }

  const bytes = await size(sourcePath);
  if (bytes > MAX_ASSET_BYTES) {
    throw new Error("Image is larger than 5 MB — choose a smaller file (compression arrives in v2).");
  }

  // "photo of my cat!.jpg" → "photo-of-my-cat-a3f9c2.jpg"
  const rawName = sourcePath.split(/[\\/]/).pop() ?? "image";
  const base = slugify(rawName.replace(/\.[^.]+$/, ""));
  const fileName = `${base}-${nanoid(6).toLowerCase()}.${ext}`;

  const assetsPath = assetsDirPath(projectDir);
  if (!(await exists(assetsPath))) await mkdir(assetsPath);
  await copyFile(sourcePath, joinPath(assetsPath, fileName));

  return { id: nanoid(10), fileName, type: mimeFromExtension(ext) };
}

/** Delete an asset's file from disk (only ever called for UNUSED assets). */
export async function deleteAssetFromDisk(
  projectDir: string,
  fileName: string,
): Promise<void> {
  await remove(joinPath(assetsDirPath(projectDir), fileName));
}
