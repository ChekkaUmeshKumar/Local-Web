import { beforeEach, describe, expect, it } from "vitest";
import { useEditor } from "./editor";
import { activePage } from "@/types/blocks";
import { createEmptyProject } from "@/lib/tree";

beforeEach(() => {
  // hydrate resets selection + clears undo history for a clean slate
  useEditor.getState().hydrate(createEmptyProject("Test"), "C:/test");
});

describe("editor store — style patches land on the right node", () => {
  it("a background color set on the HERO lands on the hero, not its children", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const heroId = useEditor.getState().selectedId!;

    useEditor.getState().updateStyles(heroId, {
      background: { color: "#102030" },
    });

    const hero = activePage(useEditor.getState().project).tree.find(
      (b) => b.id === heroId,
    )!;
    expect(hero.styles.background?.color).toBe("#102030");
    expect(hero.children).toHaveLength(3); // heading + text + button
    for (const child of hero.children ?? []) {
      expect(child.styles.background?.color).toBeUndefined();
    }
  });

  it("a background color set on a CHILD inside the hero stays on that child", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const heroId = useEditor.getState().selectedId!;
    const headingId = activePage(useEditor.getState().project).tree
      .find((b) => b.id === heroId)!
      .children![0].id;

    useEditor.getState().updateStyles(headingId, {
      background: { color: "#abcdef" },
    });

    const hero = activePage(useEditor.getState().project).tree.find(
      (b) => b.id === heroId,
    )!;
    expect(hero.styles.background?.color).toBeUndefined();
    expect(hero.children![0].styles.background?.color).toBe("#abcdef");
  });
});
