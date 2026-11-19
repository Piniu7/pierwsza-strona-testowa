#!/usr/bin/env node
// Prosty audyt pliku HTML. Tylko raportuje problemy, niczego nie zmienia.
// Użycie: node check_html.js <plik.html>

const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("Użycie: node check_html.js <plik.html>");
  process.exit(2);
}

let src;
try {
  src = fs.readFileSync(file, "utf8");
} catch (e) {
  console.error(`Nie można odczytać pliku: ${e.message}`);
  process.exit(2);
}

// Zamienia fragment na spacje, zachowując znaki nowej linii (numery linii nadal się zgadzają).
const blank = (m) => m.replace(/[^\n]/g, " ");
const html = src
  .replace(/<!--[\s\S]*?-->/g, blank)
  .replace(/<script\b[\s\S]*?<\/script>/gi, blank)
  .replace(/<style\b[\s\S]*?<\/style>/gi, blank);

const lineAt = (idx) => html.slice(0, idx).split("\n").length;
const short = (s, n = 70) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

function parseAttrs(raw) {
  const attrs = {};
  const re = /([^\s=\/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const val = m[2] ?? m[3] ?? m[4];
    attrs[m[1].toLowerCase()] = val === undefined ? null : val;
  }
  return attrs;
}

const tags = [];
const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
let tm;
while ((tm = tagRe.exec(html))) {
  tags.push({
    name: tm[1].toLowerCase(),
    attrs: parseAttrs(tm[2]),
    text: tm[0],
    line: lineAt(tm.index),
  });
}

const problems = { alt: [], linki: [], tytul: [], opis: [], naglowki: [] };
const notes = [];

// 1. Obrazki bez alt
for (const t of tags.filter((t) => t.name === "img")) {
  if (!("alt" in t.attrs)) {
    problems.alt.push(`linia ${t.line}: obrazek bez atrybutu alt: ${short(t.text)}`);
  } else if (t.attrs.alt !== null && t.attrs.alt.trim() === "") {
    notes.push(`linia ${t.line}: obrazek z pustym alt="" (poprawne tylko dla obrazka czysto dekoracyjnego): ${short(t.text)}`);
  }
}

// 2. Linki bez adresu
const emptyHrefs = new Set(["", "#", "javascript:void(0)", "javascript:;", "javascript:"]);
for (const t of tags.filter((t) => t.name === "a")) {
  if (!("href" in t.attrs)) {
    problems.linki.push(`linia ${t.line}: link bez atrybutu href: ${short(t.text)}`);
  } else {
    const href = (t.attrs.href ?? "").trim().toLowerCase();
    if (emptyHrefs.has(href)) {
      problems.linki.push(`linia ${t.line}: link z pustym adresem (href="${t.attrs.href ?? ""}"): ${short(t.text)}`);
    }
  }
}

// 3. Tytuł strony i opis meta
const titleM = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
if (!titleM) {
  problems.tytul.push("brak znacznika <title>");
} else if (titleM[1].trim() === "") {
  problems.tytul.push(`linia ${lineAt(titleM.index)}: pusty znacznik <title>`);
}

const desc = tags.find((t) => t.name === "meta" && (t.attrs.name || "").toLowerCase() === "description");
if (!desc) {
  problems.opis.push('brak <meta name="description" content="...">');
} else if (!desc.attrs.content || desc.attrs.content.trim() === "") {
  problems.opis.push(`linia ${desc.line}: <meta name="description"> ma pusty content`);
}

// 4. Kolejność nagłówków
const headings = [];
const hRe = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
let hm;
while ((hm = hRe.exec(html))) {
  headings.push({ level: +hm[1], text: short(hm[2].replace(/<[^>]*>/g, ""), 40), line: lineAt(hm.index) });
}
if (headings.length === 0) {
  problems.naglowki.push("na stronie nie ma żadnych nagłówków (h1–h6)");
} else {
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) problems.naglowki.push("brak nagłówka h1");
  if (h1s.length > 1) {
    problems.naglowki.push(`więcej niż jeden h1 (${h1s.length}): linie ${h1s.map((h) => h.line).join(", ")}`);
  }
  if (headings[0].level !== 1) {
    problems.naglowki.push(`linia ${headings[0].line}: pierwszy nagłówek to h${headings[0].level} „${headings[0].text}”, a nie h1`);
  }
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1], cur = headings[i];
    if (cur.level > prev.level + 1) {
      problems.naglowki.push(`linia ${cur.line}: h${cur.level} „${cur.text}” po h${prev.level} „${prev.text}” (pominięty poziom)`);
    }
  }
}

// Raport
const sections = [
  ["alt", "Obrazki bez opisu alt"],
  ["linki", "Linki bez adresu"],
  ["tytul", "Tytuł strony"],
  ["opis", "Opis meta"],
  ["naglowki", "Kolejność nagłówków"],
];
let total = 0;
console.log(`Raport dla: ${file}\n`);
for (const [key, label] of sections) {
  const list = problems[key];
  total += list.length;
  console.log(`${label}: ${list.length === 0 ? "OK" : list.length + " " + (list.length === 1 ? "problem" : "problemów")}`);
  for (const p of list) console.log(`  - ${p}`);
}
if (notes.length) {
  console.log("\nDo sprawdzenia (nie liczone jako problemy):");
  for (const n of notes) console.log(`  - ${n}`);
}
console.log(`\nŁącznie problemów: ${total}`);
