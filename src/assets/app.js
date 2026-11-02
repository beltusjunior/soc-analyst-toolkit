// Practice test (.quiz[data-test]) and equipment checker (#eq) widgets.
(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------- Practice test ----------
  document.querySelectorAll(".quiz[data-test]").forEach(function (el) {
    var id = el.getAttribute("data-test"), title = el.getAttribute("data-title");
    var Q = JSON.parse(document.getElementById("q-" + id).textContent), key = "bpt-" + id;
    var st = get(key, { i: 0, p: [] });
    if (!Array.isArray(st.p) || st.p.length > Q.length) st = { i: 0, p: [] };
    function right() { return st.p.filter(function (x, k) { return x === Q[k].a; }).length; }
    function bar() { return '<div class="bar" aria-hidden="true">' + Q.map(function (x, k) { var c = st.p[k] == null ? (k === st.i ? "c" : "") : (st.p[k] === x.a ? "r" : "w"); return '<i class="' + c + '"></i>'; }).join("") + "</div>"; }
    function render() {
      var n = Q.length;
      if (st.i >= n) {
        var r = right(), pct = Math.round((r / n) * 100), ok = pct >= 80;
        el.innerHTML = '<div class="card" aria-live="polite"><div class="qhead"><span class="label">' + esc(title) + '</span><span class="label">Complete</span></div>' + bar() +
          '<div class="score" style="color:var(' + (ok ? "--star" : "--port") + ')">' + pct + "%</div><p style=\"margin:0 0 6px\"><b>" + (ok ? "Passed." : "Not yet.") + "</b> " + r + " of " + n + " correct. Most state boater exams require 80% or higher, so that is the mark used here.</p>" +
          '<div class="qfoot"><button class="btn primary" data-act="restart">Retake test</button><a class="btn ghost" href="/exam-pass/">Get the full question bank</a></div>' +
          '<div class="review">' + Q.map(function (x, k) { var g = st.p[k] === x.a; return '<div><span class="' + (g ? "ok" : "x") + '">' + (g ? "✓" : "✗") + " " + String(k + 1).padStart(2, "0") + "</span> " + esc(x.q) + (g ? "" : '<br><span class="note">Answer: ' + esc(x.o[x.a]) + "</span>") + "</div>"; }).join("") + "</div></div>";
        return;
      }
      var x = Q[st.i], pk = st.p[st.i], done = pk != null;
      el.innerHTML = '<div class="card" aria-live="polite"><div class="qhead"><span class="label">' + esc(title) + '</span><span class="label">Q ' + (st.i + 1) + " of " + n + "</span></div>" + bar() +
        '<p class="q">' + esc(x.q) + '</p><div class="opts" role="group" aria-label="Answers">' + x.o.map(function (o, k) { var c = ""; if (done) { if (k === x.a) c = "right"; else if (k === pk) c = "wrong"; } return '<button class="opt ' + c + '" data-k="' + k + '" ' + (done ? "disabled" : "") + '><span class="k">' + "ABCD"[k] + "</span><span>" + esc(o) + "</span></button>"; }).join("") + "</div>" +
        (done ? '<div class="explain ' + (pk === x.a ? "" : "bad") + '"><b>' + (pk === x.a ? "Correct." : "Not quite. The answer is " + "ABCD"[x.a] + ".") + "</b>" + esc(x.e) + "</div>" : "") +
        '<div class="qfoot"><span class="note">' + right() + ' correct so far</span><button class="btn primary" data-act="next" ' + (done ? "" : "disabled") + ">" + (st.i === n - 1 ? "See my score" : "Next question") + "</button></div></div>";
    }
    el.addEventListener("click", function (ev) {
      var o = ev.target.closest(".opt"); if (o && !o.disabled) { st.p[st.i] = +o.getAttribute("data-k"); put(key, st); render(); return; }
      var a = ev.target.closest("[data-act]"); if (!a) return;
      if (a.getAttribute("data-act") === "next") st.i++;
      if (a.getAttribute("data-act") === "restart") st = { i: 0, p: [] };
      put(key, st); render();
    });
    render();
  });

  // ---------- Equipment checker: simplified U.S. Coast Guard federal minimums ----------
  var box = document.getElementById("eq");
  if (!box) return;
  var eq = Object.assign({ len: "16-26", power: "outboard", water: "inland", night: false }, get("bpt-eq", {}));
  function items() {
    var L = eq.len, paddle = eq.power === "none", out = [];
    out.push(["Required", "Wearable life jackets", "One U.S. Coast Guard-approved wearable life jacket for each person aboard, properly sized and readily accessible."]);
    if (L !== "under16" && !paddle) out.push(["Required", "Throwable device", "One throwable flotation device (Type IV ring or cushion) kept where you can reach it quickly."]);
    if (!paddle) {
      var n = { under16: "1", "16-26": "1", "26-40": "2", "40-65": "3" }[L];
      out.push([L === "under16" || L === "16-26" ? "If applicable" : "Required", "Fire extinguisher", n + " marine-rated Class B extinguisher" + (n === "1" ? "" : "s") + ". Boats under 26 feet need one if they have an enclosed engine compartment, closed living spaces or permanently installed fuel tanks. Outboard boats under 26 feet with none of these are exempt."]);
    }
    out.push(["Required", "Sound-producing device", L === "40-65" ? "A whistle or horn audible for at least half a nautical mile. Boats 65 feet and over also need a bell." : "A whistle, horn or other device that can make an efficient sound signal."]);
    if (eq.water === "coastal") {
      if (L === "under16" && !eq.night) out.push(["If applicable", "Visual distress signals", "Boats under 16 feet only need night signals when out between sunset and sunrise."]);
      else out.push(["Required", "Visual distress signals", L === "under16" ? "Night signals, such as an electric distress light or flares, when operating between sunset and sunrise." : "Day and night signals, such as three handheld red flares, or an orange distress flag plus an electric distress light."]);
    }
    if (eq.night) out.push(["Required", "Navigation lights", paddle ? "Paddlers and small rowboats need at least a white light (flashlight or lantern) ready to show in time to prevent a collision." : "Red and green sidelights plus a white all-round or masthead and stern light, shown from sunset to sunrise and in reduced visibility."]);
    if (eq.power === "gas-inboard") out.push(["Required", "Ventilation and backfire flame arrestor", "Gasoline engines in enclosed compartments need working ventilation and a Coast Guard-approved backfire flame arrestor."]);
    if (!paddle) out.push(["Required", "Registration and numbers", "Motorized boats must be registered with your state, with numbers displayed on both sides of the bow and the registration certificate aboard."]);
    return out;
  }
  function seg(k, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-eq="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (String(eq[k]) === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; }
  function render() {
    var list = items();
    box.innerHTML = '<div class="checker"><div class="card">' +
      '<div class="field"><span class="label" style="color:var(--navy)">Boat length</span>' + seg("len", [["under16", "Under 16 ft"], ["16-26", "16–26 ft"], ["26-40", "26–40 ft"], ["40-65", "40–65 ft"]]) + "</div>" +
      '<div class="field"><span class="label" style="color:var(--navy)">Engine</span>' + seg("power", [["gas-inboard", "Gas inboard"], ["outboard", "Outboard"], ["none", "Paddle / none"]]) + "</div>" +
      '<div class="field"><span class="label" style="color:var(--navy)">Where you boat</span>' + seg("water", [["inland", "Inland lakes &amp; rivers"], ["coastal", "Coastal / Great Lakes"]]) + "</div>" +
      '<div class="field"><span class="label" style="color:var(--navy)">Out after sunset?</span>' + seg("night", [["true", "Yes"], ["false", "No"]]) + "</div>" +
      '<p class="note" style="margin:0">Federal minimums for recreational boats. Your state may require more.</p></div>' +
      '<div class="card" aria-live="polite"><div class="label" style="margin-bottom:12px">Your checklist · ' + list.length + " items</div>" +
      '<ul class="list">' + list.map(function (i) { return '<li><span class="tag ' + (i[0] === "Required" ? "" : "cond") + '">' + i[0] + "</span><div><b>" + i[1] + '</b><span class="note">' + i[2] + "</span></div></li>"; }).join("") + "</ul></div></div>";
  }
  box.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-eq]"); if (!b) return;
    var k = b.getAttribute("data-eq"), v = b.getAttribute("data-v");
    eq[k] = k === "night" ? v === "true" : v; put("bpt-eq", eq); render();
  });
  render();
})();
