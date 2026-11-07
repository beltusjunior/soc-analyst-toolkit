// whyismyfurnace static site builder. No dependencies: `node build.mjs` writes ./dist
// Set STAGING=0 at launch to allow search engines to index the site.
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import guides from "./src/guides/guides.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const SITE = { name: "whyismyfurnace", url: process.env.SITE_URL || "https://whyismyfurnace.com", staging: process.env.STAGING !== "0", year: 2026, email: "hello@whyismyfurnace.com" };
const TREES = JSON.parse(readFileSync(join(ROOT, "src/data/trees.json"), "utf8"));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pages = [];
const FLAME = `<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3c2 4 6 6.5 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2.5-6 .5 2 1.5 3 2.5 3.5C13 9 13 6 14 3z" fill="var(--flame)"/></svg>`;
const SYM = guides.map((g) => ({ tree: g.tree, label: TREES[g.tree].name, slug: g.slug, title: g.title, description: g.description }));
const MORE = [["Short cycling", "Turns on and off every few minutes."], ["Filter turning black", "Soot, mold, or just a dirty home?"], ["Burning smell", "Normal dust burn-off, or a real problem?"], ["High-limit switch keeps tripping", "What causes overheating and how to fix it."]];

function layout({ path, title, description, body, nav, schema = [], tool = false, print = "" }) {
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..800&family=Atkinson+Hyperlegible:wght@400;700&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
${SITE.staging ? '<div class="staging"><div class="wrap">Preview build. Not yet public.</div></div>' : ""}
<div class="gas"><div class="wrap"><b>Smell gas?</b> Do not touch switches or the thermostat. Leave the house now and call your gas company's emergency line or 911 from outside.</div></div>
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="${SITE.name} home">${FLAME}${SITE.name}</a>
<nav aria-label="Main">${n("/", "home", "Troubleshooter")}${n("/problems/", "problems", "All problems")}${n("/find-a-pro/", "pro", "Find a pro")}</nav>
</div></header>
${print}
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
<div class="foot-mark" aria-hidden="true">Diagnose first. <span class="q">Pay second.</span></div>
<div class="foot-meta"><span>© ${SITE.year} ${SITE.name}. Information only. Turn off power to the furnace before opening any panel. When in doubt, call a licensed technician.</span>
<span><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/affiliate-disclosure/">Affiliate disclosure</a></span></div>
</div></footer>
${tool ? `<script type="application/json" id="trees">${JSON.stringify(TREES).replace(/</g, "\\u003c")}</script>\n<script src="/assets/app.js" defer></script>` : ""}
</body>
</html>`;
}
const page = (path, o) => pages.push({ path, ...o });
const crumbs = (items) => `<div class="crumbs">${items.map(([h, l]) => (h ? `<a href="${h}">${esc(l)}</a>` : esc(l))).join(" / ")}</div>`;
const bc = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: SITE.url + h })) });
const toolBox = (tree) => `<div class="tool"${tree ? ` data-tree="${tree}"` : ""}><div class="clip"><div class="clip-body"><p class="note">Loading the troubleshooter…</p></div></div></div>`;
const symCards = `<div class="symptoms">${SYM.map((s) => `<a class="sym" href="/${s.slug}/"><span class="chip live">Guide + troubleshooter</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></a>`).join("")}${MORE.map(([t, d]) => `<div class="sym"><span class="chip">Coming soon</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>`;
const PARTS = `<section class="block"><h2>Parts most fixes need</h2><p class="sub">Most DIY furnace fixes need one of these.</p><div class="parts">
<div class="part"><b>Furnace filters, auto-delivered</b><span class="note">Never forget a filter change again</span></div>
<div class="part"><b>Carbon monoxide alarm</b><span class="note">Every home with gas appliances needs one</span></div>
<div class="part"><b>Smart thermostat</b><span class="note">Alerts you when the heat stops working</span></div>
<div class="part"><b>Condensate pump</b><span class="note">A common replacement on high-efficiency furnaces</span></div>
</div><p class="note" style="margin-top:10px">Some links on this site may be affiliate links. We may earn a commission at no extra cost to you.</p></section>`;

// Hero drawing: a furnace cabinet in elevation, with a live pilot flame, a turning blower and lettered callouts.
const DRAWING = () => {
  const spokes = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${(200 + Math.cos(a) * 14).toFixed(1)}" y1="${(372 + Math.sin(a) * 14).toFixed(1)}" x2="${(200 + Math.cos(a + 0.5) * 48).toFixed(1)}" y2="${(372 + Math.sin(a + 0.5) * 48).toFixed(1)}"/>`; }).join("");
  const louvers = Array.from({ length: 6 }, (_, i) => `<line x1="96" y1="${300 + i * 9}" x2="134" y2="${300 + i * 9}"/>`).join("");
  return `<div class="drawing" aria-hidden="true"><svg viewBox="0 0 470 500">
<path class="ln" d="M170 20 v44 M230 20 v44 M170 20 h60"/><path class="thin" d="M176 26 h48"/>
<rect class="ln" x="80" y="64" width="240" height="380" rx="4"/>
<line class="thin" x1="80" y1="270" x2="320" y2="270"/>
<rect class="thin" x="120" y="110" width="160" height="40"/>
<g class="thin">${Array.from({ length: 7 }, (_, i) => `<line x1="${132 + i * 22}" y1="116" x2="${132 + i * 22}" y2="144"/>`).join("")}</g>
<rect class="ln" x="150" y="180" width="100" height="62" rx="3"/>
<path class="fl1" d="M200 238 C188 226 190 210 200 196 C210 210 212 226 200 238Z" fill="#FFB547" opacity=".95"/>
<path class="fl2" d="M200 238 C194 230 195 220 200 212 C205 220 206 230 200 238Z" fill="#5FA8FF"/>
<line class="thin" x1="160" y1="240" x2="240" y2="240"/>
<circle class="ln" cx="200" cy="372" r="56"/><circle class="thin" cx="200" cy="372" r="62"/>
<g class="blower thin">${spokes}<circle cx="200" cy="372" r="14"/></g>
<g class="thin">${louvers}</g>
<rect class="ln" x="80" y="444" width="240" height="18"/><line class="thin" x1="80" y1="453" x2="320" y2="453"/>
<path class="ln" d="M300 444 v-26 h28 v40"/>
<path class="dim" d="M80 486 h240 M80 478 v16 M320 478 v16"/><text x="170" y="500">W 24 IN</text>
<path class="dim" d="M44 64 v380 M36 64 h16 M36 444 h16"/><text x="10" y="258" transform="rotate(-90 22 258)">H 48 IN</text>
<g><line class="thin" x1="252" y1="208" x2="356" y2="166"/><circle cx="252" cy="208" r="3" fill="#FFB547"/><text class="callout" x="362" y="162">A</text><text x="362" y="178">FLAME</text><text x="362" y="192">SENSOR</text></g>
<g><line class="thin" x1="256" y1="372" x2="356" y2="340"/><circle cx="256" cy="372" r="3" fill="#FFB547"/><text class="callout" x="362" y="336">B</text><text x="362" y="352">BLOWER</text></g>
<g><line class="thin" x1="320" y1="453" x2="356" y2="470"/><circle cx="320" cy="453" r="3" fill="#FFB547"/><text class="callout" x="362" y="474">C</text><text x="362" y="490">FILTER</text></g>
<g><line class="thin" x1="230" y1="40" x2="356" y2="56"/><circle cx="230" cy="40" r="3" fill="#FFB547"/><text class="callout" x="362" y="52">D</text><text x="362" y="68">FLUE</text></g>
<g><line class="thin" x1="328" y1="432" x2="356" y2="420"/><circle cx="328" cy="432" r="3" fill="#FFB547"/><text class="callout" x="362" y="416">E</text><text x="362" y="432">CONDENSATE</text></g>
</svg>
<div class="titleblock"><span>Drawing</span><span><b>WIMF-01</b></span><span>Subject</span><span>Gas furnace</span><span>Rev.</span><span>2026</span></div></div>`;
};
const PRINT = `<div class="print"><div class="wrap"><div>
<div class="kick"><span>Free diagnostic</span><span>4 problems</span><span>No sign-up</span></div>
<h1>Why is my furnace <span class="q">doing that?</span></h1>
<p class="lede">Answer a few quick questions. Find out if it's a five-minute fix you can do yourself or a job for a licensed technician, before you pay for a service call.</p>
<div class="pick">Pick the problem</div>
<div class="searches">${SYM.map((s) => `<button data-pick="${s.tree}" aria-pressed="false">${esc(s.label)}</button>`).join("")}</div>
</div>${DRAWING()}</div></div>`;
const BOM = `<div class="bom tablewrap"><table><tr><th>Item</th><th>Part</th><th>Used for</th><th>Notes</th></tr>
<tr><td>01</td><td><b>Furnace filters, auto-delivered</b></td><td>Cold air, whistling, overheating</td><td class="note">Never miss a change</td></tr>
<tr><td>02</td><td><b>Carbon monoxide alarm</b></td><td>Every home with gas appliances</td><td class="note">One per floor, near bedrooms</td></tr>
<tr><td>03</td><td><b>Smart thermostat</b></td><td>No heat, short cycling</td><td class="note">Alerts you when heat stops</td></tr>
<tr><td>04</td><td><b>Condensate pump</b></td><td>Leaking water (high-efficiency units)</td><td class="note">Common replacement</td></tr>
</table></div><p class="note" style="margin-top:10px">Some links on this site may be affiliate links. We may earn a commission at no extra cost to you.</p>`;

page("/", {
  nav: "home", tool: true, print: PRINT,
  title: "Why Is My Furnace Doing That? Free Furnace Troubleshooter",
  description: "Answer a few questions to find out why your furnace is blowing cold air, not turning on, leaking water or making noise, and whether you can fix it yourself.",
  schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }],
  body: `<section class="block toolsec" style="margin-top:64px"><div class="sec-head"><div><span class="label">Step-by-step diagnosis</span><h2>Start the <span class="q">diagnosis.</span></h2></div><p>One question at a time, like a technician on the phone. Each path ends with what to do, how long it takes and what it usually costs.</p></div>${toolBox()}</section>
<section class="block"><div class="sec-head"><div><span class="label">Problem guides</span><h2>What it's <span class="q">telling you.</span></h2></div><p>Each guide ranks the causes from most to least likely, with step-by-step fixes and clear signs that it's time to call a pro.</p></div>${symCards}</section>
<section class="block"><div class="band"><div><h2>Some fixes are <span class="q">not DIY.</span></h2><p>Gas, high voltage and carbon monoxide are not worth the risk. The troubleshooter tells you plainly when to stop and call a licensed technician.</p><a class="btn primary" href="/find-a-pro/">When to call a pro</a></div>
<ul><li><b>01</b>You smell gas: leave first, then call from outside</li><li><b>02</b>A boom when the burners light</li><li><b>03</b>Metal scraping from the blower</li><li><b>04</b>Water leaking from a metal flue</li></ul></div></section>
<section class="block"><div class="sec-head"><div><span class="label">Bill of materials</span><h2>Parts most fixes <span class="q">need.</span></h2></div><p>Most DIY furnace fixes need one of these.</p></div>${BOM}</section>`,
});
page("/problems/", { nav: "problems", title: "Furnace Problems and Fixes | whyismyfurnace", description: "Find your furnace problem: cold air, no heat, water leaks or strange noises.", schema: [bc([["/", "Home"], ["/problems/", "All problems"]])],
  body: `${crumbs([["/", "Home"], [null, "All problems"]])}<h1 class="page-h1">What is your furnace doing?</h1><p class="lede2">Pick the problem that matches. Each guide includes its own troubleshooter.</p>${symCards}` });
for (const g of guides) {
  const path = `/${g.slug}/`;
  page(path, {
    nav: "problems", tool: true,
    title: `${g.title} | whyismyfurnace`, description: g.description,
    schema: [bc([["/", "Home"], ["/problems/", "All problems"], [path, g.title]]), { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, publisher: { "@type": "Organization", name: SITE.name } }],
    body: `<article class="post">${crumbs([["/", "Home"], ["/problems/", "All problems"], [null, TREES[g.tree].name]])}<h1>${esc(g.title)}</h1><p class="note">${g.minutes} min read · Updated November 2026</p>
<div class="cta-tool"><b>Short on time?</b> <span class="note">Use the troubleshooter below to narrow it down in a few clicks.</span></div>
${toolBox(g.tree)}
${g.body}</article>`,
  });
}
page("/find-a-pro/", { nav: "pro", title: "Find a Furnace Repair Technician | whyismyfurnace", description: "When to call an HVAC technician, what to tell them, and how to get a fair quote.",
  body: `${crumbs([["/", "Home"], [null, "Find a pro"]])}<h1 class="page-h1">When to call a furnace technician</h1>
<p class="lede2">Some furnace problems are safe to fix yourself. Others involve gas, high voltage or carbon monoxide risk and need a licensed technician.</p>
<div class="leadbox"><div><h2 style="font-size:24px;margin-bottom:8px">Call a pro if</h2><ul><li>You smell gas or your CO alarm goes off (leave the house first)</li><li>You hear a boom when the burners light</li><li>The igniter, gas valve, control board or blower motor has failed</li><li>Water is leaking from a metal flue pipe</li><li>The same error code keeps coming back</li></ul></div>
<div><h2 style="font-size:24px;margin-bottom:8px">Get a fair quote</h2><ul><li>Tell them the symptom, your furnace's brand and age, and any error code</li><li>Ask about the diagnostic fee and whether it applies to the repair</li><li>Get two or three quotes for repairs over a few hundred dollars</li><li>Check the company's license and reviews</li></ul></div></div>
<p class="note" style="margin-top:18px">Local technician matching is coming soon.</p>` });
const simple = (path, t, h1, html) => page(path, { title: `${t} | ${SITE.name}`, description: `${t} for ${SITE.name}.`, body: `${crumbs([["/", "Home"], [null, h1]])}<div class="legal"><h1 class="page-h1">${h1}</h1>${html}</div>` });
simple("/about/", "About", "About", `<p>${SITE.name} helps homeowners understand what their furnace is doing and decide whether to fix it themselves or call a professional. Every guide puts safety first.</p><p>Our content is general information, not a substitute for a licensed HVAC technician. Questions or corrections: <b>${SITE.email}</b>.</p>`);
simple("/privacy/", "Privacy Policy", "Privacy policy", `<p>Last updated November 2026.</p><h2>What we collect</h2><p>Troubleshooter progress is stored only in your browser. If you email us, we keep your message to reply. We may use privacy-friendly analytics that do not identify you.</p><h2>Affiliate links and ads</h2><p>Some pages contain affiliate links or ads. Partners may use cookies under their own policies.</p>`);
simple("/terms/", "Terms of Use", "Terms of use", `<p>Last updated November 2026.</p><h2>Information only</h2><p>Content on this site is general information. Furnaces involve gas, electricity and combustion. Turn off power before opening any panel, follow your manufacturer's instructions, and call a licensed technician when in doubt. You use this information at your own risk.</p>`);
simple("/affiliate-disclosure/", "Affiliate Disclosure", "Affiliate disclosure", `<p>Some links on ${SITE.name} are affiliate links. If you buy through them, we may earn a commission at no extra cost to you. We only recommend products that fit the fix being described.</p>`);
page("/404.html", { title: "Page not found", description: "Page not found.", body: `<h1 class="page-h1">Page not found</h1><p class="lede2">Try the <a href="/">furnace troubleshooter</a>.</p>` });

rmSync(OUT, { recursive: true, force: true });
for (const p of pages) { const f = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html"); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, layout(p)); }
mkdirSync(join(OUT, "assets"), { recursive: true });
for (const f of ["site.css", "app.js"]) copyFileSync(join(ROOT, "src/assets", f), join(OUT, "assets", f));
writeFileSync(join(OUT, "favicon.svg"), FLAME.replace("var(--flame)", "#1F5FD1").replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "robots.txt"), SITE.staging ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(OUT, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${SITE.staging ? "  X-Robots-Tag: noindex, nofollow\n" : ""}/assets/*\n  Cache-Control: public, max-age=604800\n`);
console.log(`Built ${pages.length} pages to dist/ (staging: ${SITE.staging})`);
