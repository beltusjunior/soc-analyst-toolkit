// Excel Practice Test static site builder. No dependencies: `node build.mjs` writes ./dist
// Set STAGING=0 at launch to allow search engines to index the site.
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import guides from "./src/guides/guides.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const SITE = { name: "Excel Practice Test", url: process.env.SITE_URL || "https://excelpracticetest.com", staging: process.env.STAGING !== "0", year: 2026, email: "hello@excelpracticetest.com" };
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const EX = read("src/data/exercises.json");
const QS = read("src/data/questions.json");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pages = [];
const LOGO = `<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="2" width="24" height="24" rx="3" fill="none" stroke="var(--ink)" stroke-width="1.6"/><path d="M2 10h24M2 18h24M11 2v24M19 2v24" stroke="var(--grid)" stroke-width="1.2"/><rect x="11" y="10" width="8" height="8" fill="var(--active)" stroke="var(--sel)" stroke-width="2"/></svg>`;

function layout({ path, title, description, body, nav, schema = [], practice = false, test = false }) {
  const canonical = SITE.url + path;
  const n = (href, key, label) => `<a href="${href}"${nav === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${SITE.staging ? '<meta name="robots" content="noindex, nofollow">' : ""}
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400;1,6..96,500&family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
${SITE.staging ? '<div class="staging"><div class="wrap">Preview build. Not yet public.</div></div>' : ""}
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="${SITE.name} home">Excel<span class="serif">practice</span>test<span class="dot" aria-hidden="true"></span></a>
<nav aria-label="Main">${n("/practice/", "practice", "Formula practice")}${n("/excel-interview-test/", "test", "Interview test")}${n("/guides/", "guides", "Guides")}${n("/pro/", "pro", "Pro")}</nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
<div class="foot-mark" aria-hidden="true">=PRACTICE(<span class="serif">you</span>)</div>
<div><span>© ${SITE.year} ${SITE.name}. Independent practice resource. Microsoft and Excel are trademarks of Microsoft Corporation; this site is not affiliated with or endorsed by Microsoft.</span>
<span><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/contact/">Contact</a></span></div>
</div></footer>
${practice ? `<script type="application/json" id="ex-data">${JSON.stringify(EX).replace(/</g, "\\u003c")}</script>\n<script src="/assets/formula.js" defer></script>\n<script src="/assets/practice.js" defer></script>` : ""}
${path === "/" ? '<script src="/assets/hero.js" defer></script>' : ""}
${test ? `<script type="application/json" id="q-interview">${JSON.stringify(QS).replace(/</g, "\\u003c")}</script>\n<script src="/assets/quiz.js" defer></script>` : ""}
</body>
</html>`;
}
const page = (path, o) => pages.push({ path, ...o });
const crumbs = (items) => `<div class="crumbs">${items.map(([h, l]) => (h ? `<a href="${h}">${esc(l)}</a>` : esc(l))).join(" / ")}</div>`;
const bc = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: SITE.url + h })) });
const practiceBox = (slug) => `<div class="practice" data-ex="${slug}"><div class="ws"><p class="task">${esc(slug === "all" ? EX.exercises[0].task : EX.exercises.find((x) => x.slug === slug).task)}</p><p class="note">Loading the practice sheet…</p></div></div>`;
const quizBox = `<div class="quiz" data-test="interview" data-title="Excel interview test"><div class="sheet"><p class="q">${esc(QS[0].q)}</p><p class="note">Loading the ${QS.length}-question test…</p></div></div>`;
const exCards = (list) => `<div class="cards">${list.map((x) => `<a class="card" href="/practice/${x.slug}/"><span class="chip lvl-${x.level.toLowerCase()}">${x.level}</span><h3>${esc(x.title)}</h3><p>${esc(x.task)}</p></a>`).join("")}</div>`;
const guideCards = `<div class="cards">${guides.map((g) => `<a class="card" href="/guides/${g.slug}/"><span class="label">${g.minutes} min read</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></a>`).join("")}</div>`;

const HERO_ROWS = [["Name", "Dept", "Region", "Sales", "Target"], ["Ava", "Sales", "East", 52000, 50000], ["Ben", "Marketing", "West", 31000, 35000], ["Chloe", "Sales", "West", 61000, 55000], ["Dan", "Support", "East", 27000, 30000], ["Ema", "Sales", "East", 48000, 50000], ["Total", null, null, null, null]];
const heroArt = () => {
  const L = ["A", "B", "C", "D", "E"];
  let g = `<span class="h"></span>` + L.map((l) => `<span class="h">${l}</span>`).join("");
  HERO_ROWS.forEach((row, r) => {
    const rn = r + 1;
    g += `<span class="h">${rn}</span>`;
    row.forEach((v, c) => {
      const ref = L[c] + rn, isNum = typeof v === "number";
      const inRange = L[c] === "D" && rn >= 2 && rn <= 6;
      const isRes = ref === "D7";
      const cls = [rn === 1 || (rn === 7 && c === 0) ? "t" : "", isNum ? "n" : "", inRange ? "in" : "", isRes ? "res" : ""].filter(Boolean).join(" ");
      g += `<span class="${cls}" data-ref="${ref}" data-c="${L[c]}" data-r="${rn}"${v !== null ? ` data-v="${esc(v)}"` : ""}>${isRes ? "219,000" : v === null ? "" : isNum ? v.toLocaleString("en-US") : esc(v)}</span>`;
    });
  });
  return `<div class="art" data-hero aria-label="Animated example: a formula is typed and its result appears in the sheet">
<div class="art-sheet"><div class="art-bar"><span class="fx">fx</span><span class="addr">D7</span><span class="typed">=SUM(D2:D6)<span class="caret"></span></span></div>
<div class="art-grid">${g}</div></div>
<div class="art-tag"><small>Now practising</small><b>SUM</b></div></div>`;
};
const FUNCS = ["SUM", "AVERAGE", "IF", "COUNTIF", "SUMIF", "VLOOKUP", "XLOOKUP", "INDEX", "MATCH", "IFERROR", "LEFT", "FIND", "TRIM", "ROUND"];
const ticker = () => { const items = FUNCS.map((f, i) => `<span>${i % 2 ? `<i>=</i>${f.toLowerCase()}()` : `${f}<i>(</i>`}</span>`).join(""); return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${items}${items}</div></div>`; };
const elements = () => `<div class="elements">${EX.exercises.map((x, i) => `<a class="el ${x.level.toLowerCase()}" href="/practice/${x.slug}/"><span class="no"><b>${String(i + 1).padStart(2, "0")}</b><span>${x.level}</span></span><span class="sym">${x.fn}</span><span class="nm">${esc(x.title.split(": ")[1] || x.title)}</span></a>`).join("")}<a class="el dark" href="/excel-interview-test/"><span class="no"><b>15</b><span>Test</span></span><span class="sym">TEST</span><span class="nm">20-question interview test</span></a><div class="el soon"><span class="no"><b>16</b><span>Coming with Pro</span></span><span class="sym">Pivot tables</span><span class="nm">summarize anything</span></div></div>
<div class="legend note"><span><i style="background:var(--ok)"></i>Beginner</span><span><i style="background:var(--cobalt)"></i>Intermediate</span><span><i style="background:var(--bad)"></i>Advanced</span></div>`;

page("/", {
  practice: true,
  title: "Excel Practice Test 2026 | Free Excel Formula Exercises & Interview Test",
  description: "Practise real Excel formulas in your browser: VLOOKUP, XLOOKUP, SUMIF, INDEX/MATCH and more, with instant checking. Plus a free Excel test for job interviews.",
  schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }],
  body: `<div class="hero"><div>
<div class="kicker label">Free Excel practice · No download · No sign-up</div>
<h1 class="display">Write the <span class="hl">formula.</span><span class="serif">Land the job.</span></h1>
<p class="lede">Most Excel tests are hands-on. So is this. Type real formulas into a live worksheet, get them checked instantly, and walk into your assessment already fluent in VLOOKUP, SUMIF and INDEX/MATCH.</p>
<div class="ctas"><a class="btn primary" href="/practice/">Start practising <span class="arrow">→</span></a><a class="btn ghost" href="/excel-interview-test/">Take the interview test</a></div>
<div class="figures"><div><b>${EX.exercises.length}</b><span class="label">Live exercises</span></div><div><b>${QS.length}</b><span class="label">Interview questions</span></div><div><b>$0</b><span class="label">To start</span></div></div>
</div>${heroArt()}</div>
${ticker()}
<section class="block"><div class="sec-head"><h2>Try one <span class="serif">right now.</span></h2><p>A real worksheet, in your browser. Type a formula, press Check, and see exactly what Excel would show. Click any cell to drop its reference into the formula.</p></div>${practiceBox("all")}</section>
<section class="block"><div class="sec-head"><h2>The functions <span class="serif">employers test.</span></h2><p>Fourteen exercises, from your first SUM to INDEX and MATCH. Each one teaches a single function on the same sample sales sheet.</p></div>${elements()}</section>
<section class="block"><div class="band"><div><h2>Twenty questions. <span class="serif">No guessing.</span></h2><p>A free multiple-choice test modeled on employer Excel assessments: references, lookups, error codes, pivot tables. Every answer comes with the reason why.</p><a class="btn primary" href="/excel-interview-test/">Take the test <span class="arrow">→</span></a></div>
<div><div class="stat"><b>20</b><span>questions with explanations</span></div><div class="stat"><b>80%</b><span>score to aim for before test day</span></div><div class="stat"><b>25%</b><span>what pure guessing gets you</span></div></div></div></section>
<section class="block"><div class="sec-head"><h2>Before <span class="serif">test day.</span></h2><p>Short guides to what employer Excel assessments actually cover.</p></div>${guideCards}</section>`,
});
page("/practice/", {
  nav: "practice", practice: true,
  title: "Excel Formula Practice Exercises (Free, Interactive)",
  description: `${EX.exercises.length} interactive Excel formula exercises with instant checking: SUM, IF, COUNTIF, SUMIF, VLOOKUP, XLOOKUP, INDEX/MATCH, IFERROR and text functions.`,
  schema: [bc([["/", "Home"], ["/practice/", "Formula practice"]])],
  body: `${crumbs([["/", "Home"], [null, "Formula practice"]])}<h1 class="page-h1">Excel formula practice</h1><p class="lede2">Work through all ${EX.exercises.length} exercises in order, or jump to a function. Your solved exercises are saved in this browser.</p>${practiceBox("all")}<section class="block"><h2>All exercises</h2>${exCards(EX.exercises)}</section>`,
});
for (const x of EX.exercises) {
  const path = `/practice/${x.slug}/`;
  const others = EX.exercises.filter((y) => y.slug !== x.slug && y.level === x.level).slice(0, 3);
  page(path, {
    nav: "practice", practice: true,
    title: `${x.fn} Practice Exercise: ${x.title.split(": ")[1] || x.title} | Excel Practice Test`,
    description: `Free interactive ${x.fn} exercise. ${x.task} Type your formula and get it checked instantly.`,
    schema: [bc([["/", "Home"], ["/practice/", "Formula practice"], [path, x.title]])],
    body: `${crumbs([["/", "Home"], ["/practice/", "Formula practice"], [null, x.fn]])}<h1 class="page-h1">${esc(x.title)}</h1>
<div class="twocol"><div><p class="lede2" style="margin-bottom:14px">${esc(x.explain)}</p><p class="note">The sample sheet lists eight employees with their department, region, sales and target, plus a small bonus-rate table in columns G and H.</p></div>${practiceBox(x.slug)}</div>
${others.length ? `<section class="block"><h2>More ${x.level.toLowerCase()} exercises</h2>${exCards(others)}</section>` : ""}`,
  });
}
page("/excel-interview-test/", {
  nav: "test", test: true,
  title: "Free Excel Test for Job Interviews (20 Questions With Answers)",
  description: "Free Excel assessment practice test for job interviews: references, lookups, errors, pivot tables, data validation and more, with an explanation for every answer.",
  schema: [bc([["/", "Home"], ["/excel-interview-test/", "Interview test"]])],
  body: `${crumbs([["/", "Home"], [null, "Interview test"]])}<div class="twocol"><div><h1 class="page-h1">Excel test for job interviews</h1>
<p class="lede2">Twenty multiple-choice questions modeled on employer Excel assessments, covering references, lookups, error messages, pivot tables and data tools. Every answer is explained.</p>
<p>Most employer tests also include hands-on tasks. After this test, practise writing formulas in the <a href="/practice/">interactive worksheet</a>.</p>
<p class="note">Read the guide: <a href="/guides/excel-test-for-job-interview/">what to expect on an Excel job test</a>.</p></div>${quizBox}</div>`,
});
page("/guides/", { nav: "guides", title: "Excel Guides | Excel Practice Test", description: "Guides to Excel job tests, lookup functions and error messages.", schema: [bc([["/", "Home"], ["/guides/", "Guides"]])], body: `${crumbs([["/", "Home"], [null, "Guides"]])}<h1 class="page-h1">Excel guides</h1><p class="lede2">Short guides to the topics that come up on Excel assessments.</p>${guideCards}` });
for (const g of guides) {
  const path = `/guides/${g.slug}/`;
  page(path, { nav: "guides", title: `${g.title} | Excel Practice Test`, description: g.description,
    schema: [bc([["/", "Home"], ["/guides/", "Guides"], [path, g.title]]), { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, publisher: { "@type": "Organization", name: SITE.name } }],
    body: `<article class="post">${crumbs([["/", "Home"], ["/guides/", "Guides"], [null, g.title]])}<h1>${esc(g.title)}</h1><p class="note">${g.minutes} min read · Updated November 2026</p>${g.body}</article>` });
}
page("/pro/", { nav: "pro", title: "Excel Practice Test Pro | Unlimited Exercises and Mock Assessments", description: "Unlimited formula exercises, timed mock assessments and pivot table practice.",
  body: `${crumbs([["/", "Home"], [null, "Pro"]])}<h1 class="page-h1">Practise free, or go Pro</h1><p class="lede2">The free exercises cover the core functions. Pro is for when a job offer depends on passing.</p>
<div class="plans"><div class="plan"><div class="label">Free</div><div class="price">$0</div><ul><li>${EX.exercises.length} formula exercises</li><li>20-question interview test</li><li>All guides</li></ul><a class="btn ghost" href="/practice/">Start practicing</a></div>
<div class="plan pro"><div class="label">Pro</div><div class="price">$9<small> / month</small></div><ul><li>200+ exercises across beginner, intermediate and advanced</li><li>Timed mock assessments in the style of employer tests</li><li>Pivot table and data-cleaning tasks</li><li>Downloadable practice workbooks</li><li>Progress tracking</li></ul><a class="btn primary" href="/contact/">Join the waitlist</a><span class="note">Pro is launching soon. Join the waitlist for the launch discount.</span></div></div>` });
const simple = (path, t, h1, html) => page(path, { title: `${t} | ${SITE.name}`, description: `${t} for ${SITE.name}.`, body: `${crumbs([["/", "Home"], [null, h1]])}<div class="legal"><h1 class="page-h1">${h1}</h1>${html}</div>` });
simple("/about/", "About", "About", `<p>${SITE.name} helps job seekers and students practise spreadsheet formulas by writing them, not just reading about them. The practice sheet runs entirely in your browser.</p><p>The practice engine supports the most common functions and behaves like Excel for the exercises on this site. It is not a full copy of Excel. Microsoft and Excel are trademarks of Microsoft Corporation; this site is not affiliated with Microsoft.</p><p>Found a mistake? Email <b>${SITE.email}</b>.</p>`);
simple("/contact/", "Contact", "Contact", `<p>Questions, corrections or partnerships: <b>${SITE.email}</b></p><p>To join the Pro waitlist, email us with the subject "Pro waitlist".</p>`);
simple("/privacy/", "Privacy Policy", "Privacy policy", `<p>Last updated November 2026.</p><h2>What we collect</h2><p>Your formulas and progress stay in your browser and are never sent to us. If you email us, we keep your message to reply. We may use privacy-friendly analytics that do not identify you.</p><h2>Affiliate links and ads</h2><p>Some pages may contain affiliate links or ads. Partners may use cookies under their own policies.</p>`);
simple("/terms/", "Terms of Use", "Terms of use", `<p>Last updated November 2026.</p><h2>Educational use</h2><p>Content is for practice and study. Results on this site do not guarantee results on any employer assessment.</p><h2>Trademarks</h2><p>Microsoft and Excel are trademarks of Microsoft Corporation. Google Sheets is a trademark of Google LLC. This site is independent and not endorsed by either company.</p>`);
page("/404.html", { title: "Page not found", description: "Page not found.", body: `<h1 class="page-h1">Page not found</h1><p class="lede2">Try the <a href="/practice/">formula practice</a> or the <a href="/excel-interview-test/">interview test</a>.</p>` });

rmSync(OUT, { recursive: true, force: true });
for (const p of pages) { const f = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html"); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, layout(p)); }
mkdirSync(join(OUT, "assets"), { recursive: true });
for (const f of ["site.css", "formula.js", "practice.js", "quiz.js", "hero.js"]) copyFileSync(join(ROOT, "src/assets", f), join(OUT, "assets", f));
writeFileSync(join(OUT, "favicon.svg"), LOGO.replace(/var\(--ink\)/g, "#1E2622").replace(/var\(--grid\)/g, "#D7DED9").replace(/var\(--active\)/g, "#FFF3BF").replace(/var\(--sel\)/g, "#1C7A4C").replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "robots.txt"), SITE.staging ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(OUT, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${SITE.staging ? "  X-Robots-Tag: noindex, nofollow\n" : ""}/assets/*\n  Cache-Control: public, max-age=604800\n`);
console.log(`Built ${pages.length} pages to dist/ (staging: ${SITE.staging})`);
