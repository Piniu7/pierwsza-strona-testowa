---
name: html-checker
description: Quick read-only audit of an HTML page for basic problems - images without alt text, links with no address (missing, empty or "#" href), missing page title or meta description, and heading order (missing/multiple h1, skipped levels). Only lists what it finds, never edits the file. Use this whenever the user asks to check, audit, review or "sprawdź" an HTML page or landing page for alt, empty links, title, meta description, SEO basics, accessibility basics or heading structure, even if they only say "zobacz czy strona jest w porządku" or "przejrzyj index.html pod kątem błędów".
---

# HTML checker

Reports a short list of basic HTML problems. It reports only: fixing is a separate decision for the user, who may want some of these as they are (for example a decorative image with an empty alt).

## What is checked

1. **Images without alt**: `<img>` with no `alt` attribute is a problem. `alt=""` is valid for decorative images, so it goes to a separate "do sprawdzenia" list instead of counting as a problem.
2. **Links without an address**: `<a>` with no `href`, or with `href` that is empty, `#`, or `javascript:` placeholders.
3. **Page title**: missing or empty `<title>`.
4. **Meta description**: missing `<meta name="description">` or empty `content`.
5. **Heading order**: no `h1`, more than one `h1`, first heading is not `h1`, or a skipped level (for example `h2` followed by `h4`).

## How to run

1. Find the file: the path the user gave, otherwise `index.html` in the working directory. If several HTML files are plausible, ask which one.
2. Run the bundled script (it needs only Node.js, no packages). The path is relative to this skill's folder:

   ```
   node <skill-folder>/scripts/check_html.js <path-to-file.html>
   ```

   The script strips comments, `<script>` and `<style>` first, so line numbers stay correct and code samples inside them are not flagged.
3. If Node.js is not available, read the file and check the five points above by hand, using the same rules.

## How to answer

- Pass on the script's findings in the user's language (Polish by default), grouped by the five categories, with line numbers. Keep it short: a category with no problems is one line saying OK.
- End with the total count.
- Do not edit the file and do not offer a rewritten version. At most, say in one sentence that you can fix the issues if the user asks.
- Do not add checks of your own (contrast, performance, etc.). The user asked for these five, and a short predictable report is what makes the skill useful.
