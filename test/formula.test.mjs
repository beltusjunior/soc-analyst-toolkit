// Run: node test/formula.test.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const F = require("../src/assets/formula.js");
const data = JSON.parse(readFileSync(new URL("../src/data/exercises.json", import.meta.url)));

const sheet = {};
data.sheet.rows.forEach((row, r) => row.forEach((v, c) => { if (v !== null) sheet[F.colName(c + 1) + (r + 1)] = v; }));
const ev = F.makeEvaluator(sheet);

const expected = {
  sum: 348000, average: 43500, "max-min": 61000, if: "Hit", countif: 4, "countif-greater-than": 3,
  sumif: 166000, averageif: 54500, vlookup: 61000, "vlookup-bonus-table": 0.05, xlookup: "West",
  "index-match": 35000, iferror: "Not found", "left-find": "Ava",
};
let fail = 0;
for (const x of data.exercises) {
  const r = ev(x.answer);
  const ok = !r.error && F.same(r.value, expected[x.slug]);
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${x.slug.padEnd(22)} ${x.answer.padEnd(48)} -> ${r.error || F.format(r.value)}`);
}
// Alternative correct answers and error handling
const extra = [
  ["=sum(d2:d9)", 348000], ["=D2+D3", 83000], ["=COUNTIF(B2:B9,\"sales\")", 4], ["=A2&\" - \"&C2", "Ava Chen - East"],
  ["=XLOOKUP(\"Nobody\",A2:A9,C2:C9)", { err: "#N/A" }], ["=1/0", { err: "#DIV/0!" }], ["=FOO(1)", { err: "#NAME?" }],
  ["=INDEX(A2:E9,MATCH(\"Finn Hale\",A2:A9,0),5)", 35000], ["=ROUND(43500/3,2)", 14500], ["=SUMIF(D2:D9,\">=50000\")", 170000],
  ["=IF(AND(D2>50000,C2=\"East\"),1,0)", 1], ["=TEXTJOIN(\", \",TRUE,A2:A3)", "Ava Chen, Ben Ortiz"], ["=MATCH(55000,{1})", null],
];
for (const [f, want] of extra) {
  const r = ev(f);
  const got = r.error ? null : r.value;
  const ok = want && typeof want === "object" ? F.isErr(got) && got.err === want.err : want === null ? r.error != null : F.same(got, want);
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  extra ${f.padEnd(44)} -> ${r.error || F.format(got)}`);
}
console.log(fail ? `\n${fail} FAILED` : "\nAll passed");
process.exit(fail ? 1 : 0);
