/**
 * Business Landing — for small businesses and agencies.
 * Poppins headings + Inter body, blue #2563eb + slate neutrals.
 */

import hero from "./assets/business-hero.svg?raw";
import type { AssetRecord, BlockNode } from "@/types/blocks";
import { b, templateProject, type TemplateDef } from "./types";

const THUMBNAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">
  <rect width="200" height="140" rx="8" fill="#eff6ff"/>
  <rect x="14" y="12" width="172" height="16" rx="4" fill="#2563eb" opacity="0.9"/>
  <rect x="14" y="40" width="172" height="34" rx="4" fill="#dbeafe"/>
  <circle cx="100" cy="57" r="9" fill="#2563eb"/>
  <rect x="14" y="84" width="52" height="30" rx="4" fill="#bfdbfe"/>
  <rect x="74" y="84" width="52" height="30" rx="4" fill="#bfdbfe"/>
  <rect x="134" y="84" width="52" height="30" rx="4" fill="#93c5fd"/>
  <rect x="0" y="128" width="200" height="12" fill="#0f172a" rx="6"/>
</svg>`;

export const business: TemplateDef = {
  id: "business",
  name: "Business Landing",
  tagline: "A crisp landing page that sells your service.",
  thumbnail: THUMBNAIL,

  create(name) {
    const assets: AssetRecord[] = [
      { id: "bs-sample-1", fileName: "business-hero.svg", type: "image/svg+xml" },
    ];

    const tree: BlockNode[] = [
      b("navbar", {
        props: {
          brand: "Northstar",
          links: [
            { id: "bs-nav-1", label: "Home", href: "#" },
            { id: "bs-nav-2", label: "Services", href: "#" },
            { id: "bs-nav-3", label: "Contact", href: "#" },
          ],
        },
      }),

      b("hero", {
        styles: {
          colors: { text: "#0f172a" },
          background: { color: "#eff6ff" },
          spacing: { padding: "2xl" },
        },
        children: [
          b("heading", {
            props: { text: "Grow your local business online", level: 1 },
            styles: { typography: { fontFamily: "poppins", fontSize: "2xl" } },
          }),
          b("text", {
            props: {
              text: "Northstar builds fast, beautiful websites for small businesses — live in a week, found on Google for years.",
            },
            styles: { typography: { fontFamily: "inter", fontSize: "lg" } },
          }),
          b("button", { props: { label: "Get a free quote", href: "mailto:hello@northstar.studio" } }),
        ],
      }),

      b("heading", {
        props: { text: "What we do", level: 2 },
        styles: { typography: { fontFamily: "poppins" } },
      }),

      b("heading", {
        props: { text: "Fast websites", level: 4 },
        styles: { typography: { fontFamily: "poppins" } },
      }),
      b("text", {
        props: { text: "Hand-built pages that load in under a second — no bloated themes, no page builders." },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("heading", {
        props: { text: "Local SEO", level: 4 },
        styles: { typography: { fontFamily: "poppins" } },
      }),
      b("text", {
        props: { text: "Show up when neighbours search for what you do — Google Business, maps, and reviews handled." },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("heading", {
        props: { text: "Ongoing care", level: 4 },
        styles: { typography: { fontFamily: "poppins" } },
      }),
      b("text", {
        props: { text: "Edits, backups and small improvements every month — you run the business, we run the site." },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("image", { props: { src: "assets/business-hero.svg", alt: "A preview of the analytics dashboard we build for clients" } }),

      b("text", {
        props: { text: "Ready to start? Let's talk." },
        styles: { typography: { fontFamily: "inter", fontSize: "lg" } },
      }),
      b("button", { props: { label: "Book a free call", href: "mailto:hello@northstar.studio" } }),
      b("link", {
        props: { label: "or email hello@northstar.studio", href: "mailto:hello@northstar.studio" },
        styles: { typography: { fontFamily: "inter" } },
      }),

      b("footer", {
        props: {
          brand: "Northstar",
          text: "© 2026 Northstar Studio",
          links: [
            { id: "bs-ft-1", label: "Services", href: "#" },
            { id: "bs-ft-2", label: "Contact", href: "mailto:hello@northstar.studio" },
          ],
        },
      }),
    ];

    const sampleFiles = [
      { fileName: "business-hero.svg", content: hero, type: "image/svg+xml" },
    ];

    return { project: templateProject(name, tree, assets), sampleFiles };
  },
};
