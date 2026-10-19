import { describe, expect, it } from "vitest";
import { resolveStyles } from "./resolveStyles";

describe("resolveStyles", () => {
  it("returns an empty object for empty styles (base class applies)", () => {
    expect(resolveStyles({})).toEqual({});
    expect(resolveStyles()).toEqual({});
  });

  it("omits unset sections entirely", () => {
    const out = resolveStyles({ typography: { fontWeight: 600 } });
    expect(out).toEqual({ fontWeight: 600 });
    expect("color" in out).toBe(false);
    expect("padding" in out).toBe(false);
  });

  it("maps typography tokens to CSS values", () => {
    const out = resolveStyles({
      typography: {
        fontFamily: "playfair",
        fontSize: "xl",
        fontWeight: 700,
        lineHeight: 1.4,
        textAlign: "center",
      },
    });
    expect(out.fontFamily).toContain("'Playfair Display'");
    expect(out.fontSize).toBe("1.5rem");
    expect(out.fontWeight).toBe(700);
    expect(out.lineHeight).toBe(1.4);
    expect(out.textAlign).toBe("center");
  });

  it("emits a font-family CSS variable so sections cascade into their text", () => {
    const out = resolveStyles({ typography: { fontFamily: "poppins" } });
    expect(out["--lw-font-family"]).toContain("'Poppins'");
  });

  it("maps colors.text to color + a cascade variable", () => {
    const out = resolveStyles({ colors: { text: "#123456" } });
    expect(out.color).toBe("#123456");
    expect(out["--lw-text-color"]).toBe("#123456");
  });

  it("maps spacing tokens to px values", () => {
    const out = resolveStyles({ spacing: { padding: "xl", margin: "none" } });
    expect(out.padding).toBe("64px");
    expect(out.margin).toBe("0");
  });

  it("maps radius tokens", () => {
    expect(resolveStyles({ borders: { radius: "full" } }).borderRadius).toBe("9999px");
    expect(resolveStyles({ borders: { radius: "md" } }).borderRadius).toBe("8px");
  });

  it("sets borderWidth + solid style only for non-none widths", () => {
    const withBorder = resolveStyles({ borders: { width: "thin", color: "#2563eb" } });
    expect(withBorder.borderWidth).toBe("1px");
    expect(withBorder.borderStyle).toBe("solid");
    expect(withBorder.borderColor).toBe("#2563eb");

    // "none" width must not emit border properties (base class governs)
    const none = resolveStyles({ borders: { width: "none" } });
    expect("borderWidth" in none).toBe(false);
    expect("borderStyle" in none).toBe(false);
  });

  it("sets background color without clobbering background image", () => {
    const both = resolveStyles({
      background: { color: "#0f172a", image: "assets/hero.jpg" },
    });
    expect(both.backgroundColor).toBe("#0f172a");
    expect(both.backgroundImage).toBe('url("assets/hero.jpg")');
    expect(both.backgroundSize).toBe("cover");
    expect(both.backgroundPosition).toBe("center");
  });

  it("quotes the background image URL (paths with spaces stay valid)", () => {
    const out = resolveStyles({ background: { image: "assets/my photo.jpg" } });
    expect(out.backgroundImage).toBe('url("assets/my photo.jpg")');
  });

  it("maps the background image through resolveAsset when provided", () => {
    const out = resolveStyles(
      { background: { image: "assets/hero.jpg" } },
      { resolveAsset: (rel) => `asset://converted/${rel}` },
    );
    expect(out.backgroundImage).toBe('url("asset://converted/assets/hero.jpg")');
  });

  it("leaves absolute URLs untouched even with resolveAsset", () => {
    const keep = (rel: string) => `x:${rel}`;
    const out = resolveStyles(
      { background: { image: "https://example.com/a.png" } },
      { resolveAsset: keep },
    );
    expect(out.backgroundImage).toBe('url("x:https://example.com/a.png")');
  });
});
