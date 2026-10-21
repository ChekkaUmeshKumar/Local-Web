/**
 * Portfolio — for students, freelancers and anyone showing their work.
 * Playfair Display headings + Inter body, warm neutrals, black accents.
 */

import work1 from "./assets/portfolio-1.svg?raw";
import work2 from "./assets/portfolio-2.svg?raw";
import work3 from "./assets/portfolio-3.svg?raw";
import type { AssetRecord, BlockNode } from "@/types/blocks";
import { b, templateProject, type TemplateDef } from "./types";

const THUMBNAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">
  <rect width="200" height="140" rx="8" fill="#faf6f0"/>
  <rect x="0" y="0" width="200" height="42" fill="#efe7dd"/>
  <circle cx="100" cy="42" r="14" fill="#b45309"/>
  <rect x="18" y="56" width="78" height="42" rx="4" fill="#d9c5b2"/>
  <rect x="104" y="56" width="78" height="42" rx="4" fill="#d9c5b2"/>
  <rect x="18" y="106" width="120" height="6" rx="3" fill="#1c1917" opacity="0.3"/>
  <rect x="0" y="128" width="200" height="12" fill="#1c1917" rx="6"/>
</svg>`;

export const portfolio: TemplateDef = {
  id: "portfolio",
  name: "Portfolio",
  tagline: "Showcase your work with quiet, confident style.",
  thumbnail: THUMBNAIL,

  create(name) {
    const assets: AssetRecord[] = [
      { id: "pf-sample-1", fileName: "portfolio-1.svg", type: "image/svg+xml" },
      { id: "pf-sample-2", fileName: "portfolio-2.svg", type: "image/svg+xml" },
      { id: "pf-sample-3", fileName: "portfolio-3.svg", type: "image/svg+xml" },
    ];

    const tree: BlockNode[] = [
      b("navbar", {
        props: {
          brand: "Maya Rao",
          links: [
            { id: "pf-nav-1", label: "Work", href: "#" },
            { id: "pf-nav-2", label: "About", href: "#" },
            { id: "pf-nav-3", label: "Contact", href: "#" },
          ],
        },
      }),

      b("hero", {
        styles: {
          colors: { text: "#1c1917" },
          background: { color: "#faf6f0" },
          spacing: { padding: "2xl" },
        },
        children: [
          b("heading", {
            props: { text: "Maya Rao", level: 1 },
            styles: { typography: { fontFamily: "playfair", fontSize: "2xl" } },
          }),
          b("text", {
            props: { text: "Product designer crafting calm, useful interfaces for growing teams." },
            styles: { typography: { fontFamily: "inter", fontSize: "lg" } },
          }),
          b("button", {
            props: { label: "View my work", href: "#" },
            styles: { background: { color: "#1c1917" } },
          }),
        ],
      }),

      b("heading", {
        props: { text: "Selected work", level: 2 },
        styles: { typography: { fontFamily: "playfair" } },
      }),
      b("image", { props: { src: "assets/portfolio-1.svg", alt: "Case study — mobile banking app" } }),
      b("image", { props: { src: "assets/portfolio-2.svg", alt: "Case study — travel booking platform" } }),
      b("image", { props: { src: "assets/portfolio-3.svg", alt: "Case study — design system" } }),

      b("heading", {
        props: { text: "About me", level: 2 },
        styles: { typography: { fontFamily: "playfair" } },
      }),
      b("text", {
        props: {
          text: "I'm a product designer with eight years of experience across fintech and travel. I care about typography, clear flows, and shipping small, honest improvements.\nCurrently based in Lisbon, working with teams worldwide.",
        },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("text", {
        props: { text: "Have a project in mind?" },
        styles: { typography: { fontFamily: "inter", fontSize: "lg" } },
      }),
      b("button", {
        props: { label: "Contact me", href: "mailto:hello@mayarao.design" },
        styles: { background: { color: "#1c1917" } },
      }),
      b("link", {
        props: { label: "Download my CV", href: "#" },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("footer", {
        props: {
          brand: "Maya Rao",
          text: "© 2026 Maya Rao · Lisbon",
          links: [
            { id: "pf-ft-1", label: "Email", href: "mailto:hello@mayarao.design" },
            { id: "pf-ft-2", label: "LinkedIn", href: "#" },
          ],
        },
      }),
    ];

    const sampleFiles = [
      { fileName: "portfolio-1.svg", content: work1, type: "image/svg+xml" },
      { fileName: "portfolio-2.svg", content: work2, type: "image/svg+xml" },
      { fileName: "portfolio-3.svg", content: work3, type: "image/svg+xml" },
    ];

    return { project: templateProject(name, tree, assets), sampleFiles };
  },
};
