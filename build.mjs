// MyNotaryExam static site builder. No dependencies: `node build.mjs` writes ./dist
// Set STAGING=0 at launch to allow search engines to index the site.
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import guides from "./src/guides/guides.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const SITE = {
  name: "MyNotaryExam",
  url: process.env.SITE_URL || "https://mynotaryexam.com",
  staging: process.env.STAGING !== "0",
  year: 2026,
  email: "hello@mynotaryexam.com",
};
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const STATES = read("src/data/states.json");
const TESTS = {
  general: { title: "General notary knowledge", q: read("src/data/questions-general.json") },
  california: { title: "California notary exam practice", q: read("src/data/questions-california.json") },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slugify = (s) => s.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
const pages = [];

const SEAL = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="var(--seal)" stroke-width="1.5"/><circle cx="20" cy="20" r="13.5" fill="none" stroke="var(--seal)" stroke-width="1" stroke-dasharray="1.5 2"/><path d="M13 21.5l4.5 4.5L27.5 15" fill="none" stroke="var(--seal)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function layout({ path, title, description, body, nav, schema = [], tests = [] }) {
  const canonical = SITE.url + path;
  const navItem = (href, key, label) => `<a href="${href}"${nav === key ? ' aria-current="page"' : ""}>${label}</a>`;
  const testData = tests.map((t) => `<script type="application/json" id="q-${t}">${JSON.stringify(TESTS[t].q).replace(/</g, "\\u003c")}</script>`).join("\n");
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
${SITE.staging ? '<div class="staging"><div class="wrap">Preview build. Not yet public.</div></div>' : ""}
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="${SITE.name} home">${SEAL}<span>My<em>Notary</em>Exam</span></a>
<nav aria-label="Main">${navItem("/practice-test/", "test", "Practice test")}${navItem("/states/", "states", "States")}${navItem("/guides/", "guides", "Guides")}${navItem("/pro/", "pro", "Pro")}</nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
<div class="foot-mark" aria-hidden="true">Signed, sealed, <em>commissioned.</em></div>
<div class="foot-meta"><span>© ${SITE.year} ${SITE.name}. Independent study resource, not affiliated with any state commissioning office. Not legal advice.</span>
<span><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/contact/">Contact</a></span></div>
</div></footer>
${testData}
${tests.length ? '<script src="/assets/quiz.js" defer></script>' : ""}
</body>
</html>`;
}

function page(path, opts) { pages.push({ path, ...opts }); }
const crumbs = (items) => `<div class="crumbs">${items.map(([h, l]) => (h ? `<a href="${h}">${esc(l)}</a>` : esc(l))).join(" / ")}</div>`;
const breadcrumbSchema = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: SITE.url + (h || "") })) });
const quizBox = (t) => `<div class="quiz" data-test="${t}" data-title="${esc(TESTS[t].title)}"><div class="sheet"><p class="q">${esc(TESTS[t].q[0].q)}</p><p class="note">Loading the ${TESTS[t].q.length}-question practice test…</p></div></div>`;
const guideCards = (list) => `<div class="guides">${list.map((g) => `<a class="guide" href="/guides/${g.slug}/"><span class="chip ready">${g.minutes} min read</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></a>`).join("")}</div>`;
const detailed = new Map(STATES.detailed.map((s) => [s.name, s]));

const SUPPLIES = `<section class="block"><h2>What new notaries buy first</h2><p class="sub">Every state requires an official seal or stamp, and most require or recommend a journal.</p>
<div class="supplies">
<div class="supply"><b>Self-inking notary stamp</b><span class="note">Made to your state's required layout</span></div>
<div class="supply"><b>Notary journal</b><span class="note">Bound, with numbered pages</span></div>
<div class="supply"><b>Bond and E&amp;O insurance</b><span class="note">A bond is required in many states</span></div>
<div class="supply"><b>Loan signing agent training</b><span class="note">The most popular next step for new notaries</span></div>
</div><p class="note" style="margin-top:10px">Some links on this site may be affiliate links. We may earn a commission at no extra cost to you.</p></section>`;

// Home
// Guilloché band: interlaced sine waves, like the border of a banknote or certificate.
const GUILLOCHE = () => {
  const W = 1200, H = 64, waves = [];
  for (let k = 0; k < 10; k++) {
    let d = ""; const ph = (k / 10) * Math.PI * 2;
    for (let x = 0; x <= W; x += 6) { const y = H / 2 + Math.sin(x / 38 + ph) * 22 * Math.cos(x / 260 + k * 0.3); d += (x ? "L" : "M") + x + " " + y.toFixed(1); }
    waves.push(`<path d="${d}"/>`);
  }
  return `<svg class="guilloche" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="var(--gold)" stroke-width=".7">${waves.join("")}</g></svg>`;
};

// Hero art: an embossed seal with a turning ring of engraved text, and a certificate corner.
const SEAL_ART = () => {
  const ticks = Array.from({ length: 72 }, (_, i) => { const a = (i / 72) * Math.PI * 2, r1 = 236, r2 = i % 6 ? 244 : 250; return `<line x1="${(260 + r1 * Math.cos(a)).toFixed(1)}" y1="${(260 + r1 * Math.sin(a)).toFixed(1)}" x2="${(260 + r2 * Math.cos(a)).toFixed(1)}" y2="${(260 + r2 * Math.sin(a)).toFixed(1)}"/>`; }).join("");
  const petals = Array.from({ length: 24 }, (_, i) => `<ellipse cx="260" cy="260" rx="150" ry="58" transform="rotate(${i * 7.5} 260 260)"/>`).join("");
  return `<div class="sealart" aria-hidden="true">
<svg viewBox="0 0 520 520">
<defs><path id="ringpath" d="M260,260 m-196,0 a196,196 0 1,1 392,0 a196,196 0 1,1 -392,0"/></defs>
<circle cx="260" cy="260" r="256" fill="var(--sheet)" stroke="var(--hair)"/>
<g stroke="var(--gold)" stroke-width="1.2" opacity=".8">${ticks}</g>
<circle cx="260" cy="260" r="228" fill="none" stroke="var(--ink)" stroke-width="1.4"/>
<circle cx="260" cy="260" r="222" fill="none" stroke="var(--ink)" stroke-width=".6"/>
<g class="ring"><text font-family="IBM Plex Mono, monospace" font-size="17" letter-spacing="6.4" fill="var(--ink)"><textPath href="#ringpath">NOTARY PUBLIC · PRACTICE EXAMINATION · STATE OF EXCELLENCE · MMXXVI ·</textPath></text></g>
<circle cx="260" cy="260" r="168" fill="none" stroke="var(--ink)" stroke-width=".8"/>
<g fill="none" stroke="var(--gold)" stroke-width=".7" opacity=".75">${petals}</g>
<circle cx="260" cy="260" r="96" fill="var(--sheet)" stroke="var(--ink)" stroke-width="1.2"/>
<circle cx="260" cy="260" r="88" fill="none" stroke="var(--gold)" stroke-width=".8" stroke-dasharray="2 4"/>
<text x="260" y="252" text-anchor="middle" font-family="Cormorant Garamond, serif" font-style="italic" font-size="56" fill="var(--ink)">Seal</text>
<text x="260" y="286" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="3.5" fill="var(--ink-2)">OF APPROVAL</text>
<path d="M226 302 l34 16 l34 -16" fill="none" stroke="var(--wax)" stroke-width="1.5"/>
</svg>
<div class="cert"><span class="label">Certificate of practice</span><b>This is to certify that you are ready.</b><div class="line"></div><span class="sig">Signed &amp; sealed</span></div>
</div>`;
};

// Home
page("/", {
  title: "Notary Practice Test 2026 | Free State Notary Exam Prep | MyNotaryExam",
  description: "Free notary practice tests written from official state handbooks, with an explanation for every answer. State guides for California, New York, Pennsylvania and North Carolina.",
  tests: ["general"],
  schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }],
  body: `<div class="hero"><div>
<div class="ornament"><span class="label">Est. for the 2026 exams</span></div>
<h1>Pass the notary exam <em>with distinction.</em></h1>
<p class="lede">Practice tests written from each state's official notary handbook, with a clear explanation for every answer. No sign-up, no fee, no guesswork.</p>
<div class="ctas"><a class="btn primary" href="/practice-test/">Begin the practice test</a><a class="btn ghost" href="/states/">Find your state</a></div>
<div class="facts"><div><b>${TESTS.general.q.length + TESTS.california.q.length}</b><span class="label">practice questions</span></div><div><b>${STATES.detailed.length}</b><span class="label">state guides</span></div><div><b>70%</b><span class="label">passing mark</span></div></div>
</div>${SEAL_ART()}</div>
${GUILLOCHE()}
<section class="block"><div class="sec-head"><h2>Sit the exam <em>before the exam.</em></h2><p>Twenty questions on the principles every state tests: notarial acts, identification, journals and conflicts of interest. Each answer is explained.</p></div>${quizBox("general")}</section>
<section class="block"><div class="sec-head"><h2>Your state, <em>in full.</em></h2><p>Requirements, fees, every step of the process and a practice test for each state, with links to the official sources.</p></div>
<div class="states">${STATES.detailed.map((s) => `<a class="state" href="/states/${s.slug}/"><span class="chip ready">${s.abbr}</span><strong>${s.name}</strong><span class="note">${s.requirement}</span></a>`).join("")}</div></section>
<section class="block"><div class="band"><div><h2>Practice is free. <em>Pro is thorough.</em></h2><p>Unlimited state exams from a large question bank, a timed mode that matches the real test, and progress tracking. For when your commission depends on it.</p><a class="btn primary" href="/pro/">See Pro</a></div>
<div><div class="stat"><b>$7</b><span>a month, cancel any time</span></div><div class="stat"><b>400+</b><span>questions per state</span></div><div class="stat"><b>Timed</b><span>mode that mirrors exam day</span></div></div></div></section>
<section class="block"><div class="sec-head"><h2>Study <em>guides.</em></h2><p>Plain-English answers to the questions new notaries search for most.</p></div>${guideCards(guides.slice(0, 3))}</section>
${SUPPLIES}`,
});

// Practice test page
page("/practice-test/", {
  nav: "test",
  title: "Free Notary Practice Test (20 Questions With Answers) | MyNotaryExam",
  description: "Take a free 20-question notary practice test with explanations. Covers acknowledgments, jurats, ID, journals, conflicts of interest and more.",
  tests: ["general"],
  schema: [breadcrumbSchema([["/", "Home"], ["/practice-test/", "Practice test"]])],
  body: `${crumbs([["/", "Home"], [null, "Practice test"]])}
<div class="twocol"><div>
<h1 class="page-h1">Free notary practice test</h1>
<p class="lede2">Twenty questions on the notary principles that every state tests: notarial acts, identification, journals, conflicts of interest and the limits of a notary's role. Each answer comes with an explanation.</p>
<p>This test covers rules that apply across most states. For state-specific questions, open your <a href="/states/">state's guide</a>. The California guide includes a dedicated California test.</p>
<p class="note">Your progress is saved in this browser, so you can stop and come back.</p>
</div>${quizBox("general")}</div>`,
});

// States index
page("/states/", {
  nav: "states",
  title: "Notary Requirements by State (2026) | MyNotaryExam",
  description: "How to become a notary in each state: exam and course requirements, fees and steps, with links to official sources.",
  schema: [breadcrumbSchema([["/", "Home"], ["/states/", "States"]])],
  body: `${crumbs([["/", "Home"], [null, "States"]])}
<h1 class="page-h1">Notary requirements by state</h1>
<p class="lede2">Commission rules differ widely. Some states require an exam, others a course, others only an application. Choose your state for its requirements, steps and a practice test.</p>
<div class="states">${STATES.all.map((n) => { const d = detailed.get(n); return d ? `<a class="state" href="/states/${d.slug}/"><strong>${n}</strong><span class="note">${d.requirement}</span><span class="chip ready">Guide + test</span></a>` : `<div class="state"><strong>${n}</strong><span class="chip soon">Guide coming</span></div>`; }).join("")}</div>`,
});

// State pages
for (const s of STATES.detailed) {
  const path = `/states/${s.slug}/`;
  const test = s.test;
  page(path, {
    nav: "states",
    title: `How to Become a Notary in ${s.name} (2026) + Practice Test | MyNotaryExam`,
    description: `${s.name} notary requirements for 2026: ${s.requirement.toLowerCase()}, fees, step-by-step process and a free practice test.`,
    tests: [test],
    schema: [
      breadcrumbSchema([["/", "Home"], ["/states/", "States"], [path, s.name]]),
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
    body: `${crumbs([["/", "Home"], ["/states/", "States"], [null, s.name]])}
<h1 class="page-h1">How to become a notary in ${s.name}</h1>
<p class="lede2">${esc(s.summary)}</p>
<div class="twocol"><div>
<h2 style="font-size:24px;margin-bottom:10px">${s.name} requirements at a glance</h2>
<div class="tablewrap"><table class="facts-t">${s.facts.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table></div>
</div><div>
<h2 style="font-size:24px;margin-bottom:10px">${test === "general" ? "Practice test" : `${s.name} practice test`}</h2>
${quizBox(test)}
${test === "general" ? `<p class="note">This test covers principles every state uses. A ${s.name}-specific question set is in review.</p>` : ""}
</div></div>
<section class="block"><h2>Step by step</h2><ol class="steps">${s.steps.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ol></section>
<section class="block faq"><h2>${s.name} notary FAQ</h2>${s.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
<section class="block sources"><h2 style="font-size:22px">Official sources</h2><p>Requirements and fees change. Confirm details with the official source before you apply.</p><ul>${s.sources.map(([l, h]) => `<li><a href="${h}" rel="noopener">${esc(l)}</a></li>`).join("")}</ul><p>Last reviewed November 2026.</p></section>`,
  });
}

// Guides
page("/guides/", {
  nav: "guides",
  title: "Notary Study Guides | MyNotaryExam",
  description: "Plain-English notary guides: acknowledgments vs. jurats, acceptable ID, when to refuse a notarization, and how to get commissioned.",
  schema: [breadcrumbSchema([["/", "Home"], ["/guides/", "Guides"]])],
  body: `${crumbs([["/", "Home"], [null, "Guides"]])}<h1 class="page-h1">Notary questions, answered</h1><p class="lede2">Short, accurate guides to the topics that show up on notary exams and in day-to-day notary work.</p>${guideCards(guides)}`,
});
for (const g of guides) {
  const path = `/guides/${g.slug}/`;
  page(path, {
    nav: "guides",
    title: `${g.title} | MyNotaryExam`,
    description: g.description,
    schema: [
      breadcrumbSchema([["/", "Home"], ["/guides/", "Guides"], [path, g.title]]),
      { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, publisher: { "@type": "Organization", name: SITE.name } },
    ],
    body: `<article class="post">${crumbs([["/", "Home"], ["/guides/", "Guides"], [null, g.title]])}<h1>${esc(g.title)}</h1><p class="note">${g.minutes} min read · Updated November 2026</p>${g.body}</article>`,
  });
}

// Pro
page("/pro/", {
  nav: "pro",
  title: "MyNotaryExam Pro | Unlimited Notary Practice Exams",
  description: "Unlimited state notary practice exams, timed mode and progress tracking for $7 a month. Cancel any time.",
  body: `${crumbs([["/", "Home"], [null, "Pro"]])}<h1 class="page-h1">Study free, or go Pro</h1>
<p class="lede2">Practice tests stay free. Pro adds unlimited state exams, a timed mode that matches the real test, and progress tracking. Cancel any time.</p>
<div class="plans">
<div class="plan"><div class="label">Free</div><div class="price">$0</div><ul><li>Practice tests for every published state</li><li>Answer explanations</li><li>All study guides</li></ul><a class="btn ghost" href="/practice-test/">Start practicing</a></div>
<div class="plan pro"><div class="label">Pro</div><div class="price">$7<small> / month</small></div><ul><li>Unlimited exams from a large question bank per state</li><li>Timed mode that matches the real exam</li><li>Weak-topic drills and progress history</li><li>Printable cheat sheet for your state</li><li>No ads</li></ul><a class="btn primary" href="/contact/">Join the Pro waitlist</a><span class="note">Pro is launching soon. Join the waitlist to get the launch discount.</span></div>
</div>`,
});

// Legal and info pages
const simple = (path, title, h1, html) => page(path, { title: `${title} | MyNotaryExam`, description: `${title} for ${SITE.name}.`, body: `${crumbs([["/", "Home"], [null, h1]])}<div class="legal"><h1 class="page-h1">${h1}</h1>${html}</div>` });
simple("/about/", "About", "About MyNotaryExam", `<p>MyNotaryExam is an independent study resource for people preparing to become notaries public. Our practice questions and guides are written from official state handbooks, statutes and commissioning-office guidance, and each state page lists the sources we used.</p><p>We are not a government agency or an approved education vendor, and nothing on this site is legal advice. Requirements change, so always confirm details with your state's commissioning office.</p><p>Found an error? Tell us at <span class="note">${SITE.email}</span> and we will correct it.</p>`);
simple("/contact/", "Contact", "Contact", `<p>Questions, corrections or partnership enquiries: <b>${SITE.email}</b></p><p>To join the Pro waitlist, email us with the subject line "Pro waitlist" and the state you are studying for.</p>`);
simple("/privacy/", "Privacy Policy", "Privacy policy", `<p>Last updated November 2026.</p><h2>What we collect</h2><p>Your practice test progress is stored only in your own browser and is never sent to us. If you email us, we keep your message so we can reply. We may use privacy-friendly analytics to count page views; these do not identify you personally.</p><h2>Advertising and affiliate links</h2><p>Some pages may contain affiliate links or ads. If you buy through an affiliate link, we may earn a commission. Partners may use cookies under their own privacy policies.</p><h2>Contact</h2><p>${SITE.email}</p>`);
simple("/terms/", "Terms of Use", "Terms of use", `<p>Last updated November 2026.</p><h2>Educational use only</h2><p>Content on ${SITE.name} is for study purposes. It is not legal advice, and it does not replace your state's official handbook, statutes or required education.</p><h2>Accuracy</h2><p>We work to keep content accurate and current, but requirements change. Confirm all requirements and fees with the official source before you rely on them.</p><h2>Liability</h2><p>${SITE.name} is not responsible for exam results, application outcomes or decisions made using this site.</p>`);
page("/404.html", { title: "Page not found | MyNotaryExam", description: "Page not found.", body: `<h1 class="page-h1">Page not found</h1><p class="lede2">That page doesn't exist. Try the <a href="/practice-test/">free practice test</a> or <a href="/states/">find your state</a>.</p>` });

// Write output
rmSync(OUT, { recursive: true, force: true });
for (const p of pages) {
  const file = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, layout(p));
}
mkdirSync(join(OUT, "assets"), { recursive: true });
for (const f of ["site.css", "quiz.js"]) copyFileSync(join(ROOT, "src/assets", f), join(OUT, "assets", f));
writeFileSync(join(OUT, "favicon.svg"), SEAL.replace(/var\(--seal\)/g, "#1E5E5A").replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "robots.txt"), SITE.staging ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(OUT, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${SITE.staging ? "  X-Robots-Tag: noindex, nofollow\n" : ""}/assets/*\n  Cache-Control: public, max-age=604800\n`);
console.log(`Built ${pages.length} pages to dist/ (staging: ${SITE.staging})`);
