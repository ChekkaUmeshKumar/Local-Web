// @vitest-environment happy-dom
/**
 * Canvas render integration test — reproduces the user's exact flow:
 * render the canvas with a plain hero, then set the HERO's background
 * color through the store (as the Inspector does) and assert the
 * section element actually receives the inline style.
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { Canvas } from "@/components/shell/Canvas";
import { DndUiProvider } from "@/components/canvas/dnd";
import { useEditor } from "@/store/editor";
import { activePage } from "@/types/blocks";
import { createEmptyProject } from "@/lib/tree";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  useEditor.getState().hydrate(createEmptyProject("Test"), "C:/test");
});

function renderCanvas(): { container: HTMLElement; root: Root } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <DndUiProvider>
        <DndContext>
          <Canvas />
        </DndContext>
      </DndUiProvider>,
    );
  });
  return { container, root };
}

describe("canvas render — styling the HERO section", () => {
  it("applies a hero background color as an inline style on the section", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const heroId = useEditor.getState().selectedId!;
    const tree = activePage(useEditor.getState().project).tree;
    expect(tree).toHaveLength(1);

    const { container } = renderCanvas();

    // Before: plain hero, no inline background.
    const before = container.querySelector("section.lw-hero") as HTMLElement;
    expect(before).not.toBeNull();
    expect(before.style.backgroundColor).toBe("");

    // The user flow: pick a color in the Inspector → updateStyles on the hero.
    act(() => {
      useEditor.getState().updateStyles(heroId, { background: { color: "#102030" } });
    });

    const after = container.querySelector("section.lw-hero") as HTMLElement;
    expect(after.style.backgroundColor.toLowerCase()).toBe("#102030");

    // And the hero's children stay untouched.
    const heading = after.querySelector(".lw-heading") as HTMLElement;
    expect(heading.style.backgroundColor).toBe("");
  });

  it("cascades a hero text color into its heading via the CSS variable", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const heroId = useEditor.getState().selectedId!;
    const { container } = renderCanvas();

    act(() => {
      useEditor.getState().updateStyles(heroId, { colors: { text: "#f8fafc" } });
    });

    const section = container.querySelector("section.lw-hero") as HTMLElement;
    expect(section.style.color.toLowerCase()).toBe("#f8fafc");
    expect(section.style.getPropertyValue("--lw-text-color")).toBe("#f8fafc");
  });

  it("styles a heading directly (individual element) too", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const heroId = useEditor.getState().selectedId!;
    const headingId = activePage(useEditor.getState().project).tree[0].children![0].id;
    const { container } = renderCanvas();

    act(() => {
      useEditor.getState().updateStyles(headingId, { background: { color: "#abcdef" } });
    });

    const heading = container.querySelector(".lw-heading") as HTMLElement;
    expect(heading.style.backgroundColor.toLowerCase()).toBe("#abcdef");
    // Hero section untouched.
    const section = container.querySelector("section.lw-hero") as HTMLElement;
    expect(section.style.backgroundColor).toBe("");
    expect(heroId).toBeTruthy();
  });

  it("renders the hero section shell (lw-hero) around its children", () => {
    useEditor.getState().addBlock("hero", null, 0);
    const { container } = renderCanvas();

    // The section MUST exist, wrapping the inner slot and the children.
    const section = container.querySelector("section.lw-hero") as HTMLElement;
    expect(section).not.toBeNull();
    expect(section.querySelector(".lw-hero__inner")).not.toBeNull();
    expect(section.querySelector(".lw-heading")).not.toBeNull();
    expect(section.querySelector(".lw-btn")).not.toBeNull();
  });
});
