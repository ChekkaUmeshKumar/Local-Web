/**
 * Per-machine app settings (appConfigDir()/settings.json) — currently
 * just the first-run hint flag, the no-tutorial safety net.
 */

import { exists, mkdir, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { appConfigDir, join } from "@tauri-apps/api/path";

export interface AppSettings {
  /** The onboarding hint card has been dismissed (once per machine). */
  firstRunHintSeen: boolean;
}

const DEFAULTS: AppSettings = { firstRunHintSeen: false };

async function settingsPath(): Promise<string> {
  const dir = await appConfigDir();
  return join(dir, "settings.json");
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const path = await settingsPath();
    if (!(await exists(path))) return { ...DEFAULTS };
    const raw = JSON.parse(new TextDecoder().decode(await readFile(path)));
    return {
      firstRunHintSeen:
        typeof raw.firstRunHintSeen === "boolean" ? raw.firstRunHintSeen : DEFAULTS.firstRunHintSeen,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const dir = await appConfigDir();
    await mkdir(dir, { recursive: true }).catch(() => {});
    await writeFile(
      await settingsPath(),
      new TextEncoder().encode(JSON.stringify(settings, null, 2)),
    );
  } catch {
    // Settings are best-effort — never block the user.
  }
}
