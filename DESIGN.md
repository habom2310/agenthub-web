---
name: AgentHub
description: The open registry for AI coding agent setups, built as an inspection bench.
colors:
  bench-black: "#0e0e0d"
  panel-graphite: "#171716"
  graphite-rule: "#2a2a28"
  ember-wash: "#2b2119"
  signal-orange: "#ff6a1a"
  signal-soft: "#ffa06b"
  warm-white: "#ecebe6"
  ash-text: "#9b9a93"
  pass-green: "#34d399"
  caution-amber: "#fbbf24"
  alarm-red: "#f87171"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  install-pill:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.warm-white}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.panel-graphite}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  readout-tile:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.md}"
    padding: "16px"
  chip-meta:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.warm-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  button-secondary:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.warm-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.ember-wash}"
  input-search:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.md}"
    padding: "6px 32px 6px 36px"
  tab-active:
    textColor: "{colors.signal-orange}"
    padding: "10px 0"
---

<!-- Updated 2026-10-29 after /impeccable critique: indigo-on-slate replaced with graphite and signal orange, gradients removed, 12px text floor. -->

# Design System: AgentHub

## Overview

**Creative North Star: "The Inspector's Bench"**

AgentHub is a bench where a developer lays a package out and examines it before letting it into their agent.
The interface is a dark, dense instrument panel: graphite surfaces, thin graphite rules, small sans text and monospace readouts.
Every screen should feel like taking a measurement, with token budgets, risk levels, MCP commands and rule sections shown as readouts rather than marketing.

The system is mid-density and dark-only (`<html class="dark">`, no light theme exists).
Depth comes from stacked tonal surfaces and borders, not shadows.
One accent, Signal Orange, marks the interactive and the active; green, amber and red are reserved for measured status.

The owner rejected the earlier indigo-on-slate palette, the indigo-to-purple gradients and 10-11px text; none of them may return.

**Key Characteristics:**
- Dark tonal layering: Bench Black page, Panel Graphite cards, Bench Black readout tiles inside cards.
- One-pixel Graphite Rule borders on every container.
- Monospace for anything a user can copy or run.
- Status color only where a value was measured.
- Compact type with a 12px floor and bold titles.

## Colors

Neutral graphite with no blue cast, one hot signal orange, and three status colors.

### Primary
- **Signal Orange** (#ff6a1a): the logo mark, the `$` prompt, the active tab, focus rings and link hover. Any text on an orange fill is Bench Black, because white on this orange fails contrast (2.9:1).
- **Signal Soft** (#ffa06b): orange text on dark surfaces where full Signal Orange is too loud, such as inline links and command names.
- **Ember Wash** (#2b2119): hover fill for secondary buttons.

### Neutral
- **Bench Black** (#0e0e0d): the page background and the inset background for readout tiles, inputs and command pills.
- **Panel Graphite** (#171716): cards, the navbar and the footer.
- **Graphite Rule** (#2a2a28): every border and divider.
- **Warm White** (#ecebe6): primary text.
- **Ash Text** (#9b9a93): secondary text, descriptions and placeholders.

### Status
- **Pass Green** (#34d399): a clean scan, a token budget within limit, a successful copy.
- **Caution Amber** (#fbbf24): medium risk, scan warnings, a budget over limit.
- **Alarm Red** (#f87171): high risk.

Status colors appear as text on a 10% tint of the same hue with a 20% border.

### Named Rules
**The Measured Color Rule.** Green, amber and red mean a value was measured. Never use them for decoration or for a claim nothing checked.

**The Single Signal Rule.** Signal Orange is the only accent. Do not add a second brand hue, and never reintroduce Tailwind indigo, violet or blue-tinted slate: that pairing is the stock AI-product look this palette replaced.

## Typography

**Display Font:** the system UI stack (-apple-system, Segoe UI, Roboto)
**Body Font:** the same system UI stack
**Label/Mono Font:** the system monospace stack (ui-monospace, SF Mono, Menlo)

**Character:** a neutral system sans that disappears behind the data, paired with monospace for every runnable string.

### Hierarchy
- **Display** (800, 2.25rem, 1.1): the home hero headline only.
- **Headline** (800, 1.5-1.875rem, 1.2): page titles such as the docs heading and the package name.
- **Title** (700, 0.875-1rem, 1.25): card titles and section headings.
- **Body** (400, 0.75rem, 1.625): descriptions and paragraphs.
- **Label** (600, 0.6875rem): chip text, tile captions and metadata. Some labels drop to 10px today.
- **Mono** (400, 0.75rem): command pills, package ids, token counts.

### Named Rules
**The Runnable Is Mono Rule.** Anything the user can copy, paste or run is set in monospace with a `$` prompt.

## Layout

A single centered column, max width 1280px (`max-w-7xl`) with 16px gutters (24px from 640px up).
The catalog is a responsive card grid: one column on mobile, three on desktop.
The docs page narrows to 896px (`max-w-4xl`) for reading.
Spacing steps in 4px units; cards use 20-24px padding, readout tiles 16px, chips 2px by 8px.
Vertical rhythm between sections is 24px on the catalog and 40px on the docs.
The navbar is sticky at the top and stays one row on phones: below 768px search collapses behind an icon and catalog filters collapse behind a "Filters and sort" button.

## Elevation & Depth

The system is flat and uses tonal layering instead of shadow.
Bench Black is the floor, Panel Graphite is a raised surface, and Bench Black returns as an inset well inside a card.
Borders carry most of the separation.
The only shadow left is an incidental `shadow-sm` on MCP server cards; it is not structural.

### Named Rules
**The Tone-Not-Shadow Rule.** Separate surfaces with the Panel Graphite / Bench Black step and a Graphite Rule border, not with drop shadows.

## Shapes

Gently rounded rectangles throughout.
Cards and panels use 12px corners (16px for the hero banner), inner tiles, inputs, buttons and command pills use 8px, metadata chips 4px, and status and type pills are fully rounded.
Every container has a 1px Graphite Rule border; hover states shift that border toward Signal Orange at 50% opacity.

## Components

### Buttons
- **Shape:** gently rounded (8px).
- **Secondary (the only button style today):** Bench Black fill, Graphite Rule border, Warm White 12px semibold text, 6px by 12px padding.
- **Hover / Focus:** fill shifts to Ember Wash; keyboard focus shows a 2px Signal Orange outline.

### Chips
- **Metadata chip:** Bench Black fill, Graphite Rule border, 11px text, 4px corners (for example "2 Rules", "1 MCP (postgres)").
- **Status pill:** fully rounded, status hue at 10% fill with 20% border and full-strength text, with an icon.
- **Type pill:** "Profile" in Signal Orange tint, "Add-on" in Pass Green tint, fully rounded, never wraps.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Panel Graphite.
- **Shadow Strategy:** none at rest; see Elevation & Depth.
- **Border:** 1px Graphite Rule, Signal Orange at 50% on hover.
- **Internal Padding:** 20px (package cards) to 24px (panels).

### Inputs / Fields
- **Style:** Bench Black fill, Graphite Rule border, 8px corners, 12px text, Ash Text placeholder.
- **Focus:** 1px Signal Orange ring, no outline.
- **Keyboard hint:** the search field carries a `/` key cap on the right.

### Navigation
- **Style:** sticky Panel Graphite bar with a bottom Graphite Rule.
- **Links:** 14px medium Ash Text with a small icon, Signal Orange on hover.
- **Tabs (package detail):** text tabs with a 2px bottom border; the active tab is Signal Orange text and underline.

### Install Pill (signature component)
The copy-to-run command line, used on every card, the package header and the docs.
Bench Black well, Graphite Rule border, 8px corners, monospace 12px, a terminal icon and an Signal Soft `$` prompt.
The whole pill is clickable to copy; the icon swaps to a Pass Green "Copied!" for 2 seconds; the border shifts to Signal Orange at 50% on hover.

### Readout Tile (signature component)
A measurement inside a panel: a small captioned label with icon, one bold value, and a one-line explanation.
Bench Black well inside a Panel Graphite card, 8px corners, 16px padding.
Used for token footprint, risk level and MCP server counts.

## Do's and Don'ts

### Do:
- **Do** put every runnable command in an Install Pill, set in monospace with the `$` prompt.
- **Do** separate surfaces with the Panel Graphite / Bench Black tonal step and a 1px Graphite Rule border.
- **Do** reserve Pass Green, Caution Amber and Alarm Red for values that were actually measured.
- **Do** use Signal Orange as the single accent for active, focus and hover states, with Bench Black text on any orange fill.

### Don't:
- **Don't** use gradients, or indigo, violet or blue-tinted slate anywhere.
- **Don't** set text below 12px.
- **Don't** show a "verified", "passed" or "clean" state that is not derived from real package data.
- **Don't** use drop shadows to create hierarchy.
