import { describe, expect, it } from "vitest";
import { migrateProject } from "./migrate";
import { SCHEMA_VERSION } from "@/types/blocks";
import { createEmptyProject } from "@/lib/tree";

describe("migrateProject", () => {
  it("passes current-version projects through untouched", () => {
    const project = createEmptyProject("Current");
    expect(migrateProject(project)).toBe(project);
  });

  it("upgrades v0.1 projects (the dev-era files) to the current version", () => {
    const project = createEmptyProject("Old Project");
    const old = { ...project, version: "0.1" };

    const migrated = migrateProject(old);
    expect(migrated.version).toBe(SCHEMA_VERSION);
    expect(migrated.name).toBe("Old Project");
    expect(migrated.pages).toBe(project.pages); // content untouched
  });

  it("rejects versions we never knew", () => {
    expect(() => migrateProject({ version: "999.0" })).toThrow(/Unsupported project version/);
  });

  it("rejects non-objects safely", () => {
    expect(() => migrateProject(null)).toThrow(/Unsupported project version/);
    expect(() => migrateProject("nope")).toThrow(/Unsupported project version/);
  });
});
