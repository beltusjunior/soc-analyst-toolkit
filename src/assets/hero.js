// Hero animation: types a formula, lights up the range it reads, then writes the result.
// The page ships in its finished state, so it reads correctly before (or without) this script.
(function () {
  var root = document.querySelector("[data-hero]");
  if (!root || !window.Formula) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var typed = root.querySelector(".typed"), addr = root.querySelector(".addr"), tag = root.querySelector(".art-tag b");
  var cells = function (sel) { return root.querySelectorAll(sel); };
  var SCENES = [
    { f: "=SUM(D2:D6)", in: "[data-c='D'][data-r]", res: "D7", label: "SUM" },
    { f: '=COUNTIF(C2:C6,"East")', in: "[data-c='C'][data-r]", res: "D7", label: "COUNTIF" },
    { f: '=XLOOKUP("Ema",A2:A6,D2:D6)', in: "[data-c='A'][data-r],[data-c='D'][data-r]", res: "D7", label: "XLOOKUP" },
    { f: '=SUMIF(C2:C6,"West",D2:D6)', in: "[data-c='C'][data-r],[data-c='D'][data-r]", res: "D7", label: "SUMIF" }
  ];
  var sheet = {};
  cells("[data-ref]").forEach(function (el) { var v = el.getAttribute("data-v"); if (v !== null) sheet[el.getAttribute("data-ref")] = isNaN(+v) ? v : +v; });
  var ev = Formula.makeEvaluator(sheet), i = 0, timers = [];
  var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
  function clear() { cells(".in").forEach(function (c) { c.classList.remove("in"); }); }
  function play() {
    var s = SCENES[i % SCENES.length], out = root.querySelector("[data-ref='" + s.res + "']");
    clear(); out.classList.remove("res"); out.textContent = ""; typed.innerHTML = '<span class="caret"></span>'; addr.textContent = s.res;
    var n = 0;
    (function type() {
      n++; typed.innerHTML = s.f.slice(0, n).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '<span class="caret"></span>';
      if (n === s.f.indexOf("(") + 2) cells(s.in).forEach(function (c) { var rr = +c.getAttribute("data-r"); if (rr >= 2 && rr <= 6) c.classList.add("in"); });
      if (n < s.f.length) later(type, 55 + Math.random() * 45);
      else later(function () { out.textContent = Formula.format(ev(s.f).value); out.classList.add("res"); tag.textContent = s.label; later(function () { i++; play(); }, 2600); }, 380);
    })();
  }
  // Start after a beat, so the finished first frame is what people see first.
  later(play, 1800);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { timers.forEach(clearTimeout); timers = []; } else if (!timers.length) later(play, 600); });
})();
