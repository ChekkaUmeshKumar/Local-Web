import { describe, expect, it } from "vitest";
import {
  applyStylesPatch,
  cloneWithNewIds,
  findBlock,
  insertBlock,
  mapActiveTree,
  moveBlock,
  removeBlock,
  updateNode,
  walk,
} from "./tree";
import type { BlockNode, NavbarProps, Project } from "@/types/blocks";

/* ── fixtures ───────────────────────────────────────────────────── */

function node(partial: Partial<BlockNode> & { id: string }): BlockNode {
  return {
    type: "text",
    props: { text: `text of ${partial.id}` },
    styles: {},
    ...partial,
  };
}

/** hero(id) ─ heading(id-h) + button(id-b) */
function hero(id: string): BlockNode {
  return node({
    id,
    type: "hero",
    props: {},
    children: [
      node({ id: `${id}-h`, type: "heading", props: { text: "Hi", level: 1 } }),
      node({ id: `${id}-b`, type: "button", props: { label: "Go", href: "#" } }),
    ],
  } as Partial<BlockNode> & { id: string });
}

function tree(): BlockNode[] {
  return [
    node({ id: "nav", type: "navbar", props: { brand: "Brand", links: [{ id: "l1", label: "Home", href: "#" }] } }),
    hero("hero"),
    node({ id: "a" }),
    node({ id: "b" }),
  ];
}

/* ── findBlock ──────────────────────────────────────────────────── */

describe("findBlock", () => {
  it("finds root-level blocks with parentId null", () => {
    const loc = findBlock(tree(), "a")!;
    expect(loc.parentId).toBeNull();
    expect(loc.index).toBe(2);
    expect(loc.block.id).toBe("a");
  });

  it("finds nested blocks with their section parent", () => {
    const loc = findBlock(tree(), "hero-b")!;
    expect(loc.parentId).toBe("hero");
    expect(loc.index).toBe(1);
  });

  it("returns null for a missing id", () => {
    expect(findBlock(tree(), "nope")).toBeNull();
  });
});

/* ── insertBlock ─────────────────────────────────────────────────── */

describe("insertBlock", () => {
  it("inserts at root", () => {
    const t = insertBlock(tree(), node({ id: "x" }), null, 1);
    expect(t.map((n) => n.id)).toEqual(["nav", "x", "hero", "a", "b"]);
  });

  it("clamps an out-of-range root index to the end", () => {
    const t = insertBlock(tree(), node({ id: "x" }), null, 99);
    expect(t.at(-1)!.id).toBe("x");
  });

  it("inserts into a section's children", () => {
    const t = insertBlock(tree(), node({ id: "x" }), "hero", 1);
    const h = t.find((n) => n.id === "hero")!;
    expect(h.children!.map((c) => c.id)).toEqual(["hero-h", "x", "hero-b"]);
  });

  it("never mutates the input tree", () => {
    const t = tree();
    const before = JSON.stringify(t);
    insertBlock(t, node({ id: "x" }), null, 0);
    insertBlock(t, node({ id: "y" }), "hero", 0);
    expect(JSON.stringify(t)).toBe(before);
  });

  it("returns a new array when inserting at root", () => {
    const t = tree();
    expect(insertBlock(t, node({ id: "x" }), null, 0)).not.toBe(t);
  });
});

/* ── removeBlock ────────────────────────────────────────────────── */

describe("removeBlock", () => {
  it("removes a root block (and its children)", () => {
    const t = removeBlock(tree(), "hero");
    expect(t.map((n) => n.id)).toEqual(["nav", "a", "b"]);
  });

  it("removes a nested block", () => {
    const t = removeBlock(tree(), "hero-h");
    expect(t.find((n) => n.id === "hero")!.children!.map((c) => c.id)).toEqual([
      "hero-b",
    ]);
  });

  it("returns the same reference for a missing id", () => {
    const t = tree();
    expect(removeBlock(t, "nope")).toBe(t);
  });
});

/* ── moveBlock ──────────────────────────────────────────────────── */

describe("moveBlock", () => {
  it("reorders within the same parent (down, index adjusted)", () => {
    const t = moveBlock(tree(), "a", null, 3); // move a below b
    expect(t.map((n) => n.id)).toEqual(["nav", "hero", "b", "a"]);
  });

  it("reorders within the same parent (up)", () => {
    const t = moveBlock(tree(), "b", null, 0);
    expect(t.map((n) => n.id)).toEqual(["b", "nav", "hero", "a"]);
  });

  it("returns the same reference on a no-op move", () => {
    const t = tree();
    expect(moveBlock(t, "a", null, 2)).toBe(t);
  });

  it("moves a root element into a section", () => {
    const t = moveBlock(tree(), "a", "hero", 0);
    expect(t.map((n) => n.id)).toEqual(["nav", "hero", "b"]);
    expect(t.find((n) => n.id === "hero")!.children!.map((c) => c.id)).toEqual([
      "a",
      "hero-h",
      "hero-b",
    ]);
  });

  it("moves a nested element out to root", () => {
    const t = moveBlock(tree(), "hero-h", null, 0);
    expect(t.map((n) => n.id)).toEqual(["hero-h", "nav", "hero", "a", "b"]);
    expect(t.find((n) => n.id === "hero")!.children!.map((c) => c.id)).toEqual([
      "hero-b",
    ]);
  });
});

/* ── cloneWithNewIds ─────────────────────────────────────────────── */

describe("cloneWithNewIds", () => {
  it("gives the clone and every descendant a fresh id", () => {
    const clone = cloneWithNewIds(hero("hero"));
    expect(clone.id).not.toBe("hero");
    expect(clone.children!.map((c) => c.id)).not.toContain("hero-h");
    expect(clone.children!.map((c) => c.id)).not.toContain("hero-b");
  });

  it("keeps structure and content intact", () => {
    const clone = cloneWithNewIds(hero("hero"));
    expect(clone.type).toBe("hero");
    expect(clone.children).toHaveLength(2);
    expect(clone.children![0].props).toEqual({ text: "Hi", level: 1 });
  });

  it("regenerates NavLink ids inside navbar props", () => {
    const nav = node({
      id: "nav",
      type: "navbar",
      props: { brand: "B", links: [{ id: "l1", label: "Home", href: "#" }] },
    });
    const clone = cloneWithNewIds(nav);
    const links = (clone.props as NavbarProps).links;
    expect(links).toHaveLength(1);
    expect(links[0].id).not.toBe("l1");
    expect(links[0].label).toBe("Home");
  });
});

/* ── walk ───────────────────────────────────────────────────────── */

describe("walk", () => {
  it("visits every node with the correct parent id", () => {
    const seen: Array<[string, string | null]> = [];
    walk(tree(), (block, parentId) => seen.push([block.id, parentId]));
    expect(seen).toEqual([
      ["nav", null],
      ["hero", null],
      ["hero-h", "hero"],
      ["hero-b", "hero"],
      ["a", null],
      ["b", null],
    ]);
  });
});

/* ── updateNode ─────────────────────────────────────────────────── */

describe("updateNode", () => {
  it("updates only the target node", () => {
    const t = updateNode(tree(), "hero-h", (b) => ({
      ...b,
      props: { text: "Changed", level: 2 },
    }));
    const h = t.find((n) => n.id === "hero")!;
    expect(h.children![0].props).toEqual({ text: "Changed", level: 2 });
    expect(h.children![1].props).toEqual({ label: "Go", href: "#" });
    expect(t.find((n) => n.id === "a")!.props).toEqual({ text: "text of a" });
  });

  it("returns the same reference when nothing is found", () => {
    const t = tree();
    expect(updateNode(t, "nope", (b) => b)).toBe(t);
  });
});

/* ── applyStylesPatch ───────────────────────────────────────────── */

describe("applyStylesPatch", () => {
  const block = (): BlockNode =>
    node({
      id: "x",
      styles: {
        typography: { fontSize: "lg", fontWeight: 400 },
        colors: { text: "#111111" },
      },
    });

  it("merges a patch section over an existing one", () => {
    const out = applyStylesPatch(block(), {
      typography: { lineHeight: 1.5 },
    });
    expect(out.styles.typography).toEqual({ fontSize: "lg", fontWeight: 400, lineHeight: 1.5 });
  });

  it("deletes a field when patched with undefined", () => {
    const out = applyStylesPatch(block(), {
      typography: { fontWeight: undefined },
    });
    expect(out.styles.typography).toEqual({ fontSize: "lg" });
  });

  it("drops a section that becomes empty", () => {
    const out = applyStylesPatch(block(), {
      typography: { fontSize: undefined, fontWeight: undefined },
    });
    expect(out.styles.typography).toBeUndefined();
  });

  it("deletes a whole section when the patch key is undefined", () => {
    const out = applyStylesPatch(block(), { colors: undefined });
    expect(out.styles.colors).toBeUndefined();
    expect(out.styles.typography).toEqual({ fontSize: "lg", fontWeight: 400 });
  });

  it("adds a brand-new section", () => {
    const out = applyStylesPatch(block(), { spacing: { padding: "lg" } });
    expect(out.styles.spacing).toEqual({ padding: "lg" });
  });
});

/* ── mapActiveTree ──────────────────────────────────────────────── */

describe("mapActiveTree", () => {
  it("maps only over the first page", () => {
    const project: Project = {
      version: "0.1",
      name: "Test",
      createdAt: "now",
      updatedAt: "now",
      pages: [
        { id: "p1", name: "Home", tree: tree() },
        { id: "p2", name: "Future", tree: [node({ id: "z" })] },
      ],
      assets: [],
    };
    const out = mapActiveTree(project, (t) => [...t, node({ id: "added" })]);
    expect(out.pages[0].tree).toHaveLength(5);
    expect(out.pages[1].tree).toHaveLength(1);
  });
});
