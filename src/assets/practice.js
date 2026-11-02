// Interactive formula practice. Mount: <div class="practice" data-ex="slug"></div> (or data-ex="all" for a stepper)
// Needs window.Formula and <script type="application/json" id="ex-data"> on the page.
(function () {
  var hosts = document.querySelectorAll(".practice[data-ex]");
  if (!hosts.length || !window.Formula) return;
  var F = window.Formula, D = JSON.parse(document.getElementById("ex-data").textContent);
  var COLS = 10, ROWS = D.sheet.rows.length;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function baseSheet() { var s = {}; D.sheet.rows.forEach(function (row, r) { row.forEach(function (v, c) { if (v !== null) s[F.colName(c + 1) + (r + 1)] = v; }); }); return s; }
  function solved() { try { return JSON.parse(localStorage.getItem("ept-solved") || "{}"); } catch (e) { return {}; } }
  function markSolved(slug) { var s = solved(); s[slug] = 1; try { localStorage.setItem("ept-solved", JSON.stringify(s)); } catch (e) {} }

  hosts.forEach(function (host) {
    var mode = host.getAttribute("data-ex"), list = D.exercises;
    var idx = mode === "all" ? 0 : Math.max(0, list.findIndex(function (x) { return x.slug === mode; }));
    var state = { formula: "", result: null, msg: null, ok: false, shown: false };

    function ex() { return list[idx]; }
    function render() {
      var x = ex(), sheet = baseSheet(), done = solved();
      if (state.result !== null && !state.result.error) sheet[x.cell] = state.result.value;
      var head = '<tr><th class="corner"></th>' + Array.from({ length: COLS }, function (_, c) { var l = F.colName(c + 1); return '<th class="colh' + (x.cell[0] === l ? " on" : "") + '">' + l + "</th>"; }).join("") + "</tr>";
      var body = "";
      for (var r = 1; r <= ROWS; r++) {
        body += '<tr><th class="rowh' + (+x.cell.slice(1) === r ? " on" : "") + '">' + r + "</th>";
        for (var c = 1; c <= COLS; c++) {
          var ref = F.colName(c) + r, v = sheet[ref], target = ref === x.cell;
          var cls = (r === 1 ? "hdr " : "") + (typeof v === "number" ? "num " : "") + (target ? "target " + (state.ok ? "good" : state.result && (state.result.error || !state.ok) ? "bad" : "") : "");
          body += '<td class="' + cls + '" data-ref="' + ref + '" title="' + ref + '">' + (target && state.result === null ? "" : esc(F.format(v === undefined ? null : v))) + "</td>";
        }
        body += "</tr>";
      }
      var nav = mode === "all" ? '<div class="pnav"><button class="btn ghost" data-act="prev"' + (idx === 0 ? " disabled" : "") + '>Previous</button><span class="label">Exercise ' + (idx + 1) + " of " + list.length + '</span><button class="btn ghost" data-act="next"' + (idx === list.length - 1 ? " disabled" : "") + ">Next</button></div>" : "";
      host.innerHTML = '<div class="ws">' +
        '<div class="ws-head"><span class="chip lvl-' + x.level.toLowerCase() + '">' + x.level + "</span><span class=\"label\">" + esc(x.fn) + (done[x.slug] ? ' · <span class="solved">Solved</span>' : "") + "</span></div>" +
        '<p class="task">' + esc(x.task) + "</p>" +
        '<form class="fbar" autocomplete="off"><label class="fx" for="fx-' + x.slug + '">fx</label><span class="cellname">' + x.cell + '</span><input id="fx-' + x.slug + '" class="finput" spellcheck="false" placeholder="Type a formula, e.g. =SUM(D2:D9)" value="' + esc(state.formula) + '"><button class="btn primary" type="submit">Check</button></form>' +
        '<p class="note tip">Tip: click any cell to insert its reference into the formula.</p>' +
        '<div class="gridwrap"><table class="grid"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
        (state.msg ? '<div class="fb ' + (state.ok ? "fb-ok" : "fb-no") + '">' + state.msg + "</div>" : "") +
        '<div class="pactions"><button class="btn ghost" data-act="hint">Hint</button><button class="btn ghost" data-act="show">Show answer</button>' + (state.formula ? '<button class="btn ghost" data-act="clear">Clear</button>' : "") + "</div>" +
        (state.shown ? '<div class="reveal"><code>' + esc(x.answer) + "</code><p>" + esc(x.explain) + "</p></div>" : "") +
        nav + "</div>";
      var gw = host.querySelector(".gridwrap"), tc = host.querySelector("td.target");
      if (gw && tc && tc.offsetLeft + tc.offsetWidth > gw.clientWidth) gw.scrollLeft = tc.offsetLeft + tc.offsetWidth - gw.clientWidth + 24;
    }
    function check() {
      var x = ex(), ev = F.makeEvaluator(baseSheet()), want = ev(x.answer).value, f = state.formula.trim();
      if (!f) { state.msg = "Type a formula first. Formulas start with ="; state.ok = false; state.result = null; return; }
      var r = ev(f); state.result = r;
      if (r.error) { state.ok = false; state.msg = "<b>Excel would reject this formula.</b> " + esc(r.error); return; }
      var missing = x.requires.filter(function (fn) { return !new RegExp("\\b" + fn + "\\s*\\(", "i").test(f); });
      if (F.same(r.value, want) && !missing.length) { state.ok = true; markSolved(x.slug); state.msg = "<b>Correct.</b> " + esc(x.cell) + " shows " + esc(F.format(r.value)) + ". " + esc(x.explain); return; }
      state.ok = false;
      if (F.same(r.value, want)) state.msg = "<b>Right answer, different method.</b> This exercise is about " + missing.join(" and ") + ". Try again using " + (missing.length > 1 ? "them" : "it") + ".";
      else state.msg = "<b>Not quite.</b> Your formula returns " + esc(F.format(r.value)) + ". " + (F.isErr(r.value) ? errHelp(r.value.err) : "Check your ranges and conditions, or use a hint.");
    }
    function errHelp(code) {
      return { "#N/A": "#N/A means a lookup value was not found. Check spelling and that the lookup range is the first column.", "#NAME?": "#NAME? means Excel does not recognise a function name. Check the spelling.", "#DIV/0!": "#DIV/0! means something was divided by zero.", "#REF!": "#REF! means the formula points outside the table, often a column number that is too big.", "#VALUE!": "#VALUE! means a value is the wrong type, such as text where a number is needed." }[code] || "";
    }
    host.addEventListener("submit", function (e) { e.preventDefault(); state.formula = host.querySelector(".finput").value; check(); render(); var i = host.querySelector(".finput"); if (i) i.focus(); });
    host.addEventListener("input", function (e) { if (e.target.classList.contains("finput")) state.formula = e.target.value; });
    host.addEventListener("click", function (e) {
      var td = e.target.closest("td[data-ref]");
      if (td) { var inp = host.querySelector(".finput"), ref = td.getAttribute("data-ref"); var s = inp.selectionStart != null ? inp.selectionStart : inp.value.length; if (!inp.value) { inp.value = "="; s = 1; } inp.value = inp.value.slice(0, s) + ref + inp.value.slice(inp.selectionEnd != null ? inp.selectionEnd : s); state.formula = inp.value; inp.focus(); inp.setSelectionRange(s + ref.length, s + ref.length); return; }
      var a = e.target.closest("[data-act]"); if (!a) return;
      var act = a.getAttribute("data-act"), x = ex();
      if (act === "hint") { state.msg = "<b>Hint:</b> " + esc(x.hint); state.ok = false; }
      if (act === "show") state.shown = true;
      if (act === "clear") { state.formula = ""; state.result = null; state.msg = null; state.ok = false; }
      if (act === "next" || act === "prev") { idx += act === "next" ? 1 : -1; state = { formula: "", result: null, msg: null, ok: false, shown: false }; }
      render();
    });
    render();
  });
})();
