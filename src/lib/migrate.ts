/**
 * Project schema migrations — the standing rule from Phase 2:
 * old project files must never silently break. Every schema change
 * gets a case here, keyed on the stored `version`.
 *
 * v0.1 → v1.0: content-identical (the v1 shape never changed on disk —
 * the bump marks the v1.0 release). This no-op hop exists to PROVE the
 * migration path works end to end before a real migration ever ships.
 */

import type { Project } from "@/types/blocks";
import { SCHEMA_VERSION } from "@/types/blocks";

export function migrateProject(raw: unknown): Project {
  const version = (raw as { version?: unknown } | null)?.version;

  if (version === SCHEMA_VERSION) return raw as Project;

  if (version === "0.1") {
    // Same shape — just stamp the new version.
    return { ...(raw as Project), version: SCHEMA_VERSION };
  }

  throw new Error(
    `Unsupported project version "${String(version)}" — this file was created by a different version of LocalWeb.`,
  );
}
