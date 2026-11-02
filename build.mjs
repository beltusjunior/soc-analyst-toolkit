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

function layout({ path, title, description, body, nav, schema = [], tool = false }) {
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Atkinson+Hyperlegible:wght@400;700&family=Space+Mono:wght@400;700&display=swap">
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
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
<span>© ${SITE.year} ${SITE.name}. Information only. Turn off power to the furnace before opening any panel. When in doubt, call a licensed technician.</span>
<span><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/affiliate-disclosure/">Affiliate disclosure</a></span>
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

page("/", {
  nav: "home", tool: true,
  title: "Why Is My Furnace Doing That? Free Furnace Troubleshooter",
  description: "Answer a few questions to find out why your furnace is blowing cold air, not turning on, leaking water or making noise, and whether you can fix it yourself.",
  schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }],
  body: `<div class="hero"><div><div class="label">Free diagnostic tool</div>
<h1 style="margin-top:10px">Why is my furnace <span>doing that?</span></h1>
<p class="lede">Answer a few quick questions and find out whether it's a five-minute fix or a job for a technician, before you pay for a service call.</p>
<div class="label" style="margin-bottom:8px">Pick your problem</div>
<div class="searches">${SYM.map((s) => `<button data-pick="${s.tree}" aria-pressed="false">${esc(s.label)}</button>`).join("")}</div></div>
${toolBox()}</div>
<section class="block"><h2>Common furnace problems</h2><p class="sub">Each guide ranks the causes from most to least likely, with step-by-step fixes and clear signs that it's time to call a pro.</p>${symCards}</section>
${PARTS}`,
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
