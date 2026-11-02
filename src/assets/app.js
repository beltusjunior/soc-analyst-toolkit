// Furnace troubleshooter. Mount: <div class="tool" data-tree="cold"></div> (data-tree optional)
// with <script type="application/json" id="trees"> on the page.
(function () {
  var host = document.querySelector(".tool");
  if (!host) return;
  var T = JSON.parse(document.getElementById("trees").textContent);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var fixed = host.getAttribute("data-tree");
  var S = { tree: fixed || "cold", path: [] };
  if (!fixed) { try { var s = JSON.parse(localStorage.getItem("wimf") || "null"); if (s && T[s.tree] && Array.isArray(s.path)) S = s; } catch (e) {} }
  function save() { if (fixed) return; try { localStorage.setItem("wimf", JSON.stringify(S)); } catch (e) {} }
  function cur() { var t = T[S.tree]; return S.path.length ? S.path[S.path.length - 1][1] : t.start; }

  function render() {
    var t = T[S.tree], node = t.n[cur()];
    if (!node) { S.path = []; node = t.n[t.start]; }
    var trail = '<div class="trail">' + [t.name].concat(S.path.map(function (p) { return p[0]; })).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>";
    var body;
    if (node.t) {
      var tag = { diy: "You can fix this", pro: "Likely needs a pro", stop: "Safety first" }[node.t];
      body = '<div class="verdict ' + node.t + '"><span class="tag">' + tag + "</span><h3>" + esc(node.h) + "</h3><ol>" + node.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        '<div class="meta"><div><b>' + esc(node.time) + "</b>Time</div><div><b>" + esc(node.cost) + "</b>Typical cost</div></div></div>" +
        '<div class="actions"><button class="btn ghost" data-act="back">Back one step</button><button class="btn ghost" data-act="reset">Start over</button>' + (node.t === "diy" ? "" : '<a class="btn primary" href="/find-a-pro/">Find a local technician</a>') + "</div>";
    } else {
      body = '<p class="step-q">' + esc(node.q) + '</p><p class="step-help">' + esc(node.help) + '</p><div class="choices">' + node.c.map(function (c, k) { return '<button class="choice" data-c="' + k + '">' + esc(c[0]) + "</button>"; }).join("") + "</div>" +
        (S.path.length ? '<div class="actions"><button class="btn ghost" data-act="back">Back one step</button></div>' : "");
    }
    host.innerHTML = '<div class="clip" aria-live="polite"><div class="clip-head"><span class="label">Furnace troubleshooter</span><span class="label">Step ' + (S.path.length + 1) + '</span></div><div class="clip-body">' + trail + body + "</div></div>";
    document.querySelectorAll("[data-pick]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-pick") === S.tree); });
  }
  document.addEventListener("click", function (ev) {
    var pick = ev.target.closest("[data-pick]");
    if (pick) { S = { tree: pick.getAttribute("data-pick"), path: [] }; save(); render(); return; }
    if (!host.contains(ev.target)) return;
    var c = ev.target.closest(".choice");
    if (c) { var ch = T[S.tree].n[cur()].c[+c.getAttribute("data-c")]; S.path.push([ch[0], ch[1]]); save(); render(); return; }
    var a = ev.target.closest("[data-act]");
    if (a) { if (a.getAttribute("data-act") === "back") S.path.pop(); else S.path = []; save(); render(); }
  });
  render();
})();
