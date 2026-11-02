// Boater Practice Test static site builder. No dependencies: `node build.mjs` writes ./dist
// Set STAGING=0 at launch to allow search engines to index the site.
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import guides from "./src/guides/guides.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const SITE = { name: "Boater Practice Test", url: process.env.SITE_URL || "https://boaterpracticetest.com", staging: process.env.STAGING !== "0", year: 2026, email: "hello@boaterpracticetest.com" };
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const STATES = read("src/data/states.json");
const TESTS = { general: { title: "Boating safety · Test 1", q: read("src/data/questions-general.json") } };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pages = [];
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 5v22M5 16h22" stroke="currentColor" stroke-width="1.4"/><path d="M16 7l3 9h-6z" fill="#E8A317"/></svg>`;

function layout({ path, title, description, body, nav, schema = [], tests = [], app = false }) {
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
${SITE.staging ? '<div class="staging"><div class="wrap">Preview build. Not yet public.</div></div>' : ""}
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="${SITE.name} home">${LOGO}${SITE.name}</a>
<nav aria-label="Main">${n("/practice-test/", "test", "Practice test")}${n("/safety-equipment-checker/", "eq", "Equipment checker")}${n("/states/", "states", "States")}${n("/guides/", "guides", "Guides")}${n("/exam-pass/", "pass", "Exam Pass")}</nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
<span>© ${SITE.year} ${SITE.name}. Independent study resource, not a state agency or an approved course provider.</span>
<span><a href="/about/" style="color:inherit">About</a> · <a href="/privacy/" style="color:inherit">Privacy</a> · <a href="/terms/" style="color:inherit">Terms</a> · <a href="/contact/" style="color:inherit">Contact</a></span>
</div></footer>
${tests.map((t) => `<script type="application/json" id="q-${t}">${JSON.stringify(TESTS[t].q).replace(/</g, "\\u003c")}</script>`).join("\n")}
${tests.length || app ? '<script src="/assets/app.js" defer></script>' : ""}
</body>
</html>`;
}
const page = (path, o) => pages.push({ path, ...o });
const crumbs = (items) => `<div class="crumbs">${items.map(([h, l]) => (h ? `<a href="${h}">${esc(l)}</a>` : esc(l))).join(" / ")}</div>`;
const bc = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: SITE.url + h })) });
const quizBox = (t) => `<div class="quiz" data-test="${t}" data-title="${esc(TESTS[t].title)}"><div class="card"><p class="q">${esc(TESTS[t].q[0].q)}</p><p class="note">Loading the ${TESTS[t].q.length}-question practice test…</p></div></div>`;
const eqBox = `<div id="eq"><div class="card"><p class="note">Loading the equipment checker…</p></div></div>`;
const guideCards = (list) => `<div class="guides">${list.map((g) => `<a class="guide" href="/guides/${g.slug}/"><span class="label" style="color:var(--star)">${g.minutes} min read</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></a>`).join("")}</div>`;
const detailed = new Map(STATES.detailed.map((s) => [s.name, s]));
const GEAR = `<section class="block"><h2>Safety gear worth having</h2><p class="sub">The items boaters most often need to buy or replace.</p><div class="supplies">
<div class="supply"><b>Inflatable life jackets</b><span class="note">Comfortable enough to actually wear</span></div>
<div class="supply"><b>Type IV throwable cushion</b><span class="note">Required on boats 16 feet and over</span></div>
<div class="supply"><b>Marine fire extinguisher</b><span class="note">Class B, Coast Guard approved</span></div>
<div class="supply"><b>Visual distress signal kit</b><span class="note">For coastal waters and the Great Lakes</span></div>
</div><p class="note" style="margin-top:10px">Some links on this site may be affiliate links. We may earn a commission at no extra cost to you.</p></section>`;

page("/", {
  title: "Boater Safety Practice Test 2026 | Free Boating Exam Prep",
  description: "Free boater safety practice test with explanations, a required safety equipment checker, and state boater education guides for Florida, Tennessee, Michigan and Texas.",
  tests: ["general"], app: true,
  schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }],
  body: `<div class="hero"><div><div class="label">Free · Updated for the 2026 season</div>
<h1 style="margin-top:10px">Pass your <span>boater</span> <em>safety</em> exam.</h1>
<p class="lede">Practice questions built on the national boating education standard, with an explanation for every answer. Then check exactly what equipment your boat needs.</p>
<a class="btn primary" href="/safety-equipment-checker/">Check my boat's equipment</a>
<div class="coords"><div><span class="label">Questions</span><b>${TESTS.general.q.length}</b></div><div><span class="label">Pass mark</span><b>80%</b></div><div><span class="label">State guides</span><b>0${STATES.detailed.length}</b></div></div></div>
${quizBox("general")}</div>
<section class="block"><h2>Required equipment checker</h2><p class="sub">Answer four questions about your boat and get its federal safety equipment checklist.</p>${eqBox}</section>
<section class="block"><h2>State boater education guides</h2><p class="sub">Who needs a boater card, how to get one, and links to the official agency.</p><div class="states">${STATES.detailed.map((s) => `<a class="state" href="/states/${s.slug}/"><strong>${s.name}</strong><span class="dot ready"></span></a>`).join("")}</div></section>
<section class="block"><h2>Study guides</h2><p class="sub">Clear answers to the rules new boaters get wrong most often.</p>${guideCards(guides)}</section>
${GEAR}`,
});
page("/practice-test/", {
  nav: "test", tests: ["general"],
  title: "Free Boater Safety Practice Test (20 Questions With Answers)",
  description: "Take a free 20-question boating safety practice test covering navigation rules, buoys, lights, life jackets and emergencies, with an explanation for every answer.",
  schema: [bc([["/", "Home"], ["/practice-test/", "Practice test"]])],
  body: `${crumbs([["/", "Home"], [null, "Practice test"]])}<div class="twocol"><div><h1 class="page-h1">Free boater safety practice test</h1>
<p class="lede2">Twenty questions on the topics every state boater exam covers: rules of the road, buoys and markers, navigation lights, required equipment, fueling, and what to do in an emergency.</p>
<p>The questions follow the national boating education standard used by state courses. Your progress is saved in this browser, so you can stop and come back.</p></div>${quizBox("general")}</div>`,
});
page("/safety-equipment-checker/", {
  nav: "eq", app: true,
  title: "What Safety Equipment Does My Boat Need? Free Checker",
  description: "Pick your boat's length, engine and waters to get the U.S. Coast Guard federal safety equipment checklist for your boat.",
  schema: [bc([["/", "Home"], ["/safety-equipment-checker/", "Equipment checker"]])],
  body: `${crumbs([["/", "Home"], [null, "Equipment checker"]])}<h1 class="page-h1">What safety equipment does my boat need?</h1><p class="lede2">Pick your boat's length, engine and waters. The checklist updates instantly.</p>${eqBox}
<section class="block"><h2>About this checklist</h2><p class="sub">It lists the federal minimum equipment for recreational boats from the U.S. Coast Guard's rules, simplified for quick reference. States can add requirements, such as life jacket rules for children or extra equipment on certain waters. Check your state's boating handbook, and consider a free Vessel Safety Check from the Coast Guard Auxiliary or U.S. Power Squadrons.</p></section>`,
});
page("/states/", {
  nav: "states",
  title: "Boater Education Requirements by State (2026)",
  description: "Which boaters need a boater education card in each state, and how to get one.",
  schema: [bc([["/", "Home"], ["/states/", "States"]])],
  body: `${crumbs([["/", "Home"], [null, "States"]])}<h1 class="page-h1">Boater education by state</h1><p class="lede2">Almost every state requires some operators to complete boater education, usually based on age or birth year. Choose your state for its rules and links to the official agency.</p>
<div class="states">${STATES.all.map((n) => { const d = detailed.get(n); return d ? `<a class="state" href="/states/${d.slug}/"><strong>${n}</strong><span class="dot ready" title="Guide available"></span></a>` : `<div class="state"><strong>${n}</strong><span class="dot soon" title="Guide coming"></span></div>`; }).join("")}</div>
<p class="note" style="margin-top:14px"><span class="dot ready" style="display:inline-block"></span> Guide available · other states coming soon</p>`,
});
for (const s of STATES.detailed) {
  const path = `/states/${s.slug}/`;
  page(path, {
    nav: "states", tests: ["general"],
    title: `${s.name} Boater Education Requirements (2026) + Practice Test`,
    description: `Who needs boater education in ${s.name}, how to get your card, and a free boating safety practice test.`,
    schema: [bc([["/", "Home"], ["/states/", "States"], [path, s.name]]), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }],
    body: `${crumbs([["/", "Home"], ["/states/", "States"], [null, s.name]])}<h1 class="page-h1">${s.name} boater education</h1><p class="lede2">${esc(s.summary)}</p>
<div class="twocol"><div><h2 style="font-size:30px;margin-bottom:10px">${s.name} rules at a glance</h2><div class="tablewrap"><table class="facts-t">${s.facts.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table></div></div>
<div><h2 style="font-size:30px;margin-bottom:10px">Practice test</h2>${quizBox("general")}<p class="note">These questions cover the national standard used in every state's course. A ${s.name}-specific set is in review.</p></div></div>
<section class="block"><h2>How to get your ${s.name} boater card</h2><ol class="steps">${s.steps.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ol></section>
<section class="block faq"><h2>${s.name} boating FAQ</h2>${s.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
<section class="block sources"><h2 style="font-size:26px">Official sources</h2><p>Rules change. Confirm with the official agency before you go out.</p><ul>${s.sources.map(([l, h]) => `<li><a href="${h}" rel="noopener">${esc(l)}</a></li>`).join("")}</ul><p>Last reviewed November 2026.</p></section>`,
  });
}
page("/guides/", { nav: "guides", title: "Boating Rules Explained | Boater Practice Test", description: "Plain-English guides to buoys, navigation lights and right-of-way rules.", schema: [bc([["/", "Home"], ["/guides/", "Guides"]])], body: `${crumbs([["/", "Home"], [null, "Guides"]])}<h1 class="page-h1">Boating rules, explained</h1><p class="lede2">Short, accurate guides to the topics that show up on every boater exam.</p>${guideCards(guides)}` });
for (const g of guides) {
  const path = `/guides/${g.slug}/`;
  page(path, { nav: "guides", title: `${g.title} | Boater Practice Test`, description: g.description,
    schema: [bc([["/", "Home"], ["/guides/", "Guides"], [path, g.title]]), { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, publisher: { "@type": "Organization", name: SITE.name } }],
    body: `<article class="post">${crumbs([["/", "Home"], ["/guides/", "Guides"], [null, g.title]])}<h1>${esc(g.title)}</h1><p class="note">${g.minutes} min read · Updated November 2026</p>${g.body}</article>` });
}
page("/exam-pass/", { nav: "pass", title: "Exam Pass | Boater Practice Test", description: "300+ state boater exam questions, a timed exam simulator and flashcards for a one-time $9.",
  body: `${crumbs([["/", "Home"], [null, "Exam Pass"]])}<h1 class="page-h1">Study free, or get the Exam Pass</h1><p class="lede2">Most people take one boater exam, so the Pass is a single payment. No subscription to cancel.</p>
<div class="plans"><div class="plan"><div class="label">Free</div><div class="price">$0</div><ul><li>20-question practice test</li><li>Equipment checker</li><li>All guides</li></ul><a class="btn ghost" href="/practice-test/">Start practicing</a></div>
<div class="plan pro"><div class="label">Exam Pass · 60 days</div><div class="price">$9<small> one time</small></div><ul><li>300+ questions for your state</li><li>Timed exam simulator</li><li>Buoy and light flashcards</li><li>Printable rules cheat sheet</li><li>No ads</li></ul><a class="btn primary" href="/contact/">Join the waitlist</a><span class="note">The Exam Pass is launching soon. Join the waitlist for the launch discount.</span></div></div>` });
const simple = (path, t, h1, html) => page(path, { title: `${t} | ${SITE.name}`, description: `${t} for ${SITE.name}.`, body: `${crumbs([["/", "Home"], [null, h1]])}<div class="legal"><h1 class="page-h1">${h1}</h1>${html}</div>` });
simple("/about/", "About", "About", `<p>${SITE.name} is an independent study resource for people preparing for a boater safety exam. Our questions follow the national boating education standard, and each state guide links to the official agency we used.</p><p>We are not a state agency or an approved course provider. To get your boater card, you must complete a course approved by your state.</p><p>Found an error? Email <b>${SITE.email}</b>.</p>`);
simple("/contact/", "Contact", "Contact", `<p>Questions, corrections or partnerships: <b>${SITE.email}</b></p><p>To join the Exam Pass waitlist, email us with the subject "Exam Pass" and your state.</p>`);
simple("/privacy/", "Privacy Policy", "Privacy policy", `<p>Last updated November 2026.</p><h2>What we collect</h2><p>Your practice test progress and checker selections are stored only in your browser. If you email us, we keep your message to reply. We may use privacy-friendly analytics that do not identify you.</p><h2>Affiliate links and ads</h2><p>Some pages may contain affiliate links or ads. Partners may use cookies under their own policies.</p>`);
simple("/terms/", "Terms of Use", "Terms of use", `<p>Last updated November 2026.</p><h2>Educational use only</h2><p>Content on this site is for study and general information. It does not replace your state's approved boater education course or official regulations.</p><h2>Accuracy</h2><p>Rules change. Confirm requirements with your state agency and the U.S. Coast Guard before relying on them.</p>`);
page("/404.html", { title: "Page not found", description: "Page not found.", body: `<h1 class="page-h1">Page not found</h1><p class="lede2">Try the <a href="/practice-test/">practice test</a> or the <a href="/safety-equipment-checker/">equipment checker</a>.</p>` });

rmSync(OUT, { recursive: true, force: true });
for (const p of pages) { const f = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html"); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, layout(p)); }
mkdirSync(join(OUT, "assets"), { recursive: true });
for (const f of ["site.css", "app.js"]) copyFileSync(join(ROOT, "src/assets", f), join(OUT, "assets", f));
writeFileSync(join(OUT, "favicon.svg"), LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:#0E2A47" '));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "robots.txt"), SITE.staging ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(OUT, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${SITE.staging ? "  X-Robots-Tag: noindex, nofollow\n" : ""}/assets/*\n  Cache-Control: public, max-age=604800\n`);
console.log(`Built ${pages.length} pages to dist/ (staging: ${SITE.staging})`);
