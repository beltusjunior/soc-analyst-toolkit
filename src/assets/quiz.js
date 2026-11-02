// Practice test widget. Mount: <div class="quiz" data-test="general" data-title="..."></div>
// with a <script type="application/json" id="q-general"> holding [{q,o,a,e}] on the page.
(function () {
  var PASS = 0.7;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(key) { try { var s = JSON.parse(localStorage.getItem(key) || "null"); if (s && Array.isArray(s.picks)) return s; } catch (e) {} return { i: 0, picks: [] }; }
  function store(key, st) { try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {} }

  function mount(el) {
    var id = el.getAttribute("data-test");
    var title = el.getAttribute("data-title") || "Practice test";
    var Q = JSON.parse(document.getElementById("q-" + id).textContent);
    var key = "ept-" + id;
    var st = load(key);
    if (st.picks.length > Q.length) st = { i: 0, picks: [] };

    function correct() { return st.picks.filter(function (p, k) { return p === Q[k].a; }).length; }

    function render() {
      var n = Q.length;
      if (st.picks.length >= n && st.i >= n) {
        var r = correct(), pct = r / n, ok = pct >= PASS;
        el.innerHTML = '<div class="sheet result" aria-live="polite"><div class="label">' + esc(title) + '</div>' +
          '<div class="stamp ' + (ok ? "" : "fail") + '"><span>' + (ok ? "Passed" : "Keep going") + '<b>' + Math.round(pct * 100) + '%</b>' + r + ' of ' + n + '</span></div>' +
          '<p>' + (ok ? "You cleared the 70% mark. Employers often expect 80% or more, so keep practicing until you get there." : "The passing mark here is 70%. Review the questions you missed below, then try again.") + '</p>' +
          '<div class="qfoot" style="justify-content:center"><button class="btn primary" data-act="restart">Retake test</button><a class="btn ghost" href="/pro/">Get unlimited tests</a></div>' +
          '<div class="review">' + Q.map(function (x, k) {
            var good = st.picks[k] === x.a;
            return '<div><span class="' + (good ? "ok" : "x") + '">' + (good ? "✓" : "✗") + " " + String(k + 1).padStart(2, "0") + "</span> " + esc(x.q) +
              (good ? "" : '<br><span class="note">Answer: ' + esc(x.o[x.a]) + "</span>") + "</div>";
          }).join("") + "</div></div>";
        return;
      }
      var x = Q[st.i], picked = st.picks[st.i], done = picked !== undefined && picked !== null;
      el.innerHTML = '<div class="sheet" aria-live="polite">' +
        '<div class="qhead"><span class="label">' + esc(title) + '</span><span class="label">Question ' + (st.i + 1) + " / " + n + "</span></div>" +
        '<div class="bar"><i style="width:' + (st.i / n) * 100 + '%"></i></div>' +
        '<p class="q">' + esc(x.q) + "</p>" +
        '<div class="opts" role="group" aria-label="Answers">' + x.o.map(function (o, k) {
          var c = ""; if (done) { if (k === x.a) c = "right"; else if (k === picked) c = "wrong"; }
          return '<button class="opt ' + c + '" data-k="' + k + '" ' + (done ? "disabled" : "") + '><span class="k">' + "ABCD"[k] + "</span><span>" + esc(o) + "</span></button>";
        }).join("") + "</div>" +
        (done ? '<div class="explain ' + (picked === x.a ? "" : "bad") + '"><b>' + (picked === x.a ? "Correct." : "Not quite. The answer is " + "ABCD"[x.a] + ".") + "</b>" + esc(x.e) + "</div>" : "") +
        '<div class="qfoot"><span class="note">Score so far: ' + correct() + ' correct</span><button class="btn primary" data-act="next" ' + (done ? "" : "disabled") + ">" + (st.i === n - 1 ? "See my score" : "Next question") + "</button></div></div>";
    }

    el.addEventListener("click", function (ev) {
      var o = ev.target.closest(".opt");
      if (o && !o.disabled) { st.picks[st.i] = +o.getAttribute("data-k"); store(key, st); render(); return; }
      var a = ev.target.closest("[data-act]");
      if (!a) return;
      if (a.getAttribute("data-act") === "next") { st.i = Math.min(st.i + 1, Q.length); store(key, st); render(); }
      if (a.getAttribute("data-act") === "restart") { st = { i: 0, picks: [] }; store(key, st); render(); }
    });
    render();
  }
  document.querySelectorAll(".quiz[data-test]").forEach(mount);
})();
