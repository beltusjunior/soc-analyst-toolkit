export default [
{
slug: "excel-test-for-job-interview",
title: "Excel Test for a Job Interview: What to Expect and How to Pass",
description: "What employer Excel assessments cover at each level, the formats you'll see, and a one-week plan to prepare.",
minutes: 8, updated: "2026-11-02",
body: `
<p>Many employers test Excel skills before hiring for admin, finance, operations and analyst roles. The test is usually timed and taken online. Knowing what it covers takes away most of the stress.</p>
<h2>The two formats</h2>
<ul>
<li><b>Multiple choice:</b> questions about formulas, features and error messages. You don't need Excel open.</li>
<li><b>Hands-on (interactive):</b> you work in a real or simulated spreadsheet and must produce the right result, for example writing a VLOOKUP or building a pivot table. This is the format people fail most often, because recognising a formula is easier than writing one.</li>
</ul>
<h2>What each level covers</h2>
<div class="tablewrap"><table>
<tr><th>Level</th><th>Typical skills tested</th></tr>
<tr><td>Basic</td><td>Entering data, SUM, AVERAGE, MIN and MAX, sorting and filtering, basic formatting, relative vs. absolute references</td></tr>
<tr><td>Intermediate</td><td>IF, COUNTIF, SUMIF, VLOOKUP or XLOOKUP, conditional formatting, data validation, simple charts, pivot tables</td></tr>
<tr><td>Advanced</td><td>INDEX and MATCH, nested IFs, SUMIFS and COUNTIFS, text functions (LEFT, FIND, TRIM), IFERROR, pivot table grouping, data cleaning</td></tr>
</table></div>
<p>If the job ad says "proficient in Excel", expect intermediate. For analyst or finance roles, prepare for advanced.</p>
<h2>A one-week plan</h2>
<ol>
<li><b>Days 1–2:</b> SUM, AVERAGE, IF and absolute references. Do the beginner <a href="/practice/">practice exercises</a>.</li>
<li><b>Days 3–4:</b> COUNTIF, SUMIF, VLOOKUP and XLOOKUP. Write each formula from memory, not by copying.</li>
<li><b>Day 5:</b> INDEX/MATCH, IFERROR and text functions.</li>
<li><b>Day 6:</b> build a pivot table in Excel or Google Sheets from any sample data.</li>
<li><b>Day 7:</b> take the <a href="/excel-interview-test/">timed-style interview test</a> and redo the questions you missed.</li>
</ol>
<div class="callout"><b>On test day:</b> read each task twice, check whether it asks for an exact match, and confirm your ranges cover every row. Most wrong answers come from a range that stops one row short.</div>`
},
{
slug: "vlookup-vs-xlookup",
title: "VLOOKUP vs. XLOOKUP: Which Should You Use?",
description: "How the two lookup functions differ, when each one fails, and which one to use on an Excel test.",
minutes: 6, updated: "2026-11-02",
body: `
<p>VLOOKUP has been the standard lookup function for decades, and it still shows up on almost every Excel test. XLOOKUP is its modern replacement. Here's how they compare.</p>
<div class="tablewrap"><table>
<tr><th></th><th>VLOOKUP</th><th>XLOOKUP</th></tr>
<tr><td>Syntax</td><td><code>=VLOOKUP(value, table, col_num, FALSE)</code></td><td><code>=XLOOKUP(value, lookup_range, return_range)</code></td></tr>
<tr><td>Default match</td><td>Approximate (you must add FALSE)</td><td>Exact</td></tr>
<tr><td>Can return values to the left?</td><td>No</td><td>Yes</td></tr>
<tr><td>Breaks when columns are inserted?</td><td>Yes, the column number goes stale</td><td>No</td></tr>
<tr><td>Not-found message</td><td>Needs IFERROR</td><td>Built-in optional argument</td></tr>
<tr><td>Availability</td><td>Every version of Excel and Google Sheets</td><td>Excel 365, Excel 2021 and later, and Google Sheets</td></tr>
</table></div>
<h2>The most common VLOOKUP mistake</h2>
<p>Leaving out the last argument. Without FALSE, VLOOKUP does an approximate match and assumes the first column is sorted. On unsorted data it can quietly return the wrong row with no error.</p>
<h2>Which to use on a test</h2>
<p>Learn both. Many employers still use older Excel versions, and tests often ask for VLOOKUP by name. If the task allows either, XLOOKUP is shorter and harder to get wrong. INDEX with MATCH is a third option that works in every version.</p>
<p>Practise all three: <a href="/practice/vlookup/">VLOOKUP</a>, <a href="/practice/xlookup/">XLOOKUP</a> and <a href="/practice/index-match/">INDEX/MATCH</a>.</p>`
},
{
slug: "excel-errors-explained",
title: "Excel Errors Explained: #N/A, #REF!, #VALUE!, #DIV/0! and #NAME?",
description: "What each Excel error means, the usual cause, and how to fix it.",
minutes: 5, updated: "2026-11-02",
body: `
<p>Excel's error codes look cryptic, but each one points to a specific kind of mistake. Interview tests often ask you to identify them.</p>
<div class="tablewrap"><table>
<tr><th>Error</th><th>What it means</th><th>Usual fix</th></tr>
<tr><td><code>#N/A</code></td><td>A lookup couldn't find the value</td><td>Check spelling and extra spaces; confirm the lookup column; use exact match</td></tr>
<tr><td><code>#REF!</code></td><td>A reference points to a cell that no longer exists or is outside the range</td><td>Undo the deletion, or fix the column number in a lookup</td></tr>
<tr><td><code>#VALUE!</code></td><td>A value is the wrong type, such as text where a number is needed</td><td>Check for numbers stored as text and stray spaces</td></tr>
<tr><td><code>#DIV/0!</code></td><td>Division by zero or by an empty cell</td><td>Check the divisor, or wrap the formula in IFERROR</td></tr>
<tr><td><code>#NAME?</code></td><td>Excel doesn't recognise a name, usually a misspelled function or text missing quotes</td><td>Fix the spelling; put text in double quotes</td></tr>
</table></div>
<div class="callout"><b>Careful with IFERROR:</b> it hides every error, including real mistakes in your formula. Use it once you know the formula is right.</div>
<p>See how errors behave in the <a href="/practice/iferror/">IFERROR exercise</a>.</p>`
}
];
