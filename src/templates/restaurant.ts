/**
 * Restaurant / Local — for restaurants, cafés and local shops.
 * Playfair Display headings + system body, terracotta #c2410c + cream,
 * hero with a background image.
 */

import heroBg from "./assets/restaurant-hero.svg?raw";
import dish from "./assets/restaurant-dish.svg?raw";
import type { AssetRecord, BlockNode } from "@/types/blocks";
import { b, templateProject, type TemplateDef } from "./types";

const THUMBNAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">
  <defs>
    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c2d12"/>
      <stop offset="1" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="200" height="140" rx="8" fill="url(#rg)"/>
  <circle cx="100" cy="46" r="16" fill="#fef3c7"/>
  <rect x="55" y="70" width="90" height="7" rx="3.5" fill="#fef3c7" opacity="0.9"/>
  <rect x="70" y="84" width="60" height="6" rx="3" fill="#fef3c7" opacity="0.7"/>
  <rect x="14" y="104" width="52" height="18" rx="4" fill="#fef3c7"/>
  <rect x="0" y="128" width="200" height="12" fill="#431407" rx="6"/>
</svg>`;

export const restaurant: TemplateDef = {
  id: "restaurant",
  name: "Restaurant / Local",
  tagline: "A warm, tasty page for local favourites.",
  thumbnail: THUMBNAIL,

  create(name) {
    const assets: AssetRecord[] = [
      { id: "rs-sample-1", fileName: "restaurant-hero.svg", type: "image/svg+xml" },
      { id: "rs-sample-2", fileName: "restaurant-dish.svg", type: "image/svg+xml" },
    ];

    const tree: BlockNode[] = [
      b("navbar", {
        props: {
          brand: "Casa Verde",
          links: [
            { id: "rs-nav-1", label: "Menu", href: "#" },
            { id: "rs-nav-2", label: "Hours", href: "#" },
            { id: "rs-nav-3", label: "Contact", href: "#" },
          ],
        },
      }),

      b("hero", {
        styles: {
          colors: { text: "#fef3c7" },
          background: { color: "#7c2d12", image: "assets/restaurant-hero.svg" },
          spacing: { padding: "2xl" },
        },
        children: [
          b("heading", {
            props: { text: "Casa Verde", level: 1 },
            styles: { typography: { fontFamily: "playfair", fontSize: "2xl" } },
          }),
          b("text", {
            props: { text: "Wood-fired plates & natural wine in the heart of Alfama." },
            styles: { typography: { fontSize: "lg" } },
          }),
          b("button", {
            props: { label: "See the menu", href: "#" },
            styles: { background: { color: "#c2410c" } },
          }),
        ],
      }),

      b("heading", {
        props: { text: "Menu highlights", level: 2 },
        styles: { typography: { fontFamily: "playfair" } },
      }),
      b("text", {
        props: {
          text: "Charred octopus with smoked paprika · Slow-baked sourdough · Seasonal plates from the Alentejo",
        },
      }),

      b("image", { props: { src: "assets/restaurant-dish.svg", alt: "This season's signature plate" } }),

      b("heading", {
        props: { text: "Hours & address", level: 2 },
        styles: { typography: { fontFamily: "playfair" } },
      }),
      b("text", {
        props: {
          text: "Tue–Sun · 12:00–23:00\nRua das Flores 12, Alfama, Lisboa",
        },
      }),
      b("link", { props: { label: "Call us · +351 21 555 0134", href: "tel:+351215550134" } }),

      b("footer", {
        props: {
          brand: "Casa Verde",
          text: "© 2026 Casa Verde",
          links: [
            { id: "rs-ft-1", label: "Menu", href: "#" },
            { id: "rs-ft-2", label: "Reservations", href: "tel:+351215550134" },
          ],
        },
      }),
    ];

    const sampleFiles = [
      { fileName: "restaurant-hero.svg", content: heroBg, type: "image/svg+xml" },
      { fileName: "restaurant-dish.svg", content: dish, type: "image/svg+xml" },
    ];

    return { project: templateProject(name, tree, assets), sampleFiles };
  },
};
