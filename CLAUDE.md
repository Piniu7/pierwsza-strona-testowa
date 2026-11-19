# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page static landing page (Polish, `lang="pl"`) for "TransVan", a fictional van-rental company. There is no build system, package manager, test suite, or linter. To preview, open `index.html` in a browser. All user-facing copy is in Polish, so keep new content in Polish.

## Architecture

- `index.html` is the whole site. CSS is in one inline `<style>` block and JS in one inline `<script>` at the end. Don't split these into separate files unless asked.
- Sections, in order: sticky header/nav, `#start` (hero), `#o-nas`, `#oferta`, `#referencje`, `#kontakt`, footer. The nav links are anchors to these IDs. `scroll-padding-top: 72px` offsets the sticky header, so keep it in sync if the header height (64px) changes.
- Styling uses CSS custom properties in `:root` (`--blue`, `--yellow`, `--ink`, `--concrete`, etc.). Use these instead of hardcoded colors.
- Typography relies on the Archivo variable font from Google Fonts, driven by `font-variation-settings` (`wdth`/`wght`) rather than `font-weight`/`font-stretch`. Headings use `"wdth" 72, "wght" 850`. Follow that pattern for new headings.
- Responsive behavior is in two breakpoints at the bottom of the stylesheet (`max-width: 900px` and `520px`). The hero uses `grid-template-areas`, which gets reordered at 900px.
- The contact form is a demo. The submit handler calls `preventDefault()` and shows a thank-you message, and nothing is sent. A real backend or service has to be wired in for it to work.
- Contact details (phone `+48 500 123 456`, `biuro@transvan.example`, the address) are placeholders. The phone number appears in both the nav and the contact section.

## Images and attribution

- Photos are in `img/` and come from Wikimedia Commons. The footer carries the required license credits (CC BY, CC BY-SA, CC0) for each one. If you add, replace, or remove a photo, update the footer attribution to match.
- `<img>` tags have explicit `width`/`height` attributes and Polish `alt` text. Below-the-fold images use `loading="lazy"`.

## Tooling in the repo

- `.claude/skills/html-checker` is a project skill that audits HTML for missing alt text, empty links, title and meta description, and heading order. It is read-only. Run it directly with `node .claude/skills/html-checker/scripts/check_html.js index.html`.
- `.agents/skills/skill-creator` is a vendored copy of Anthropic's skill-creator, pinned in `skills-lock.json`. It is not part of the site.
