// Small spreadsheet formula engine for practice exercises.
// Supports numbers, "strings", TRUE/FALSE, A1 refs, A1:B9 ranges, + - * / ^ & = <> < > <= >=,
// and common functions. Errors are objects like {err:"#N/A"}.
(function (root) {
  var E = function (code) { return { err: code }; };
  var isErr = function (v) { return v && typeof v === "object" && "err" in v; };

  function tokenize(src) {
    var t = [], i = 0, s = src;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"') { var j = i + 1, str = ""; while (j < s.length) { if (s[j] === '"') { if (s[j + 1] === '"') { str += '"'; j += 2; continue; } break; } str += s[j++]; } if (j >= s.length) throw "Missing closing quote"; t.push({ k: "str", v: str }); i = j + 1; continue; }
      var m = s.slice(i).match(/^\$?[A-Za-z]{1,2}\$?\d+(:\$?[A-Za-z]{1,2}\$?\d+)?/);
      if (m && !/^[A-Za-z]+\(/.test(s.slice(i)) ) { t.push({ k: "ref", v: m[0].replace(/\$/g, "").toUpperCase() }); i += m[0].length; continue; }
      m = s.slice(i).match(/^\d+(\.\d+)?%?/);
      if (m) { var n = parseFloat(m[0]); if (m[0].slice(-1) === "%") n /= 100; t.push({ k: "num", v: n }); i += m[0].length; continue; }
      m = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_.]*/);
      if (m) { var w = m[0].toUpperCase(); if (w === "TRUE" || w === "FALSE") t.push({ k: "bool", v: w === "TRUE" }); else t.push({ k: "name", v: w }); i += m[0].length; continue; }
      m = s.slice(i).match(/^(<=|>=|<>|[-+*\/^&=<>(),:])/);
      if (m) { t.push({ k: "op", v: m[0] }); i += m[0].length; continue; }
      throw "Unexpected character " + c;
    }
    return t;
  }

  // Grammar: compare > concat > add > mul > pow > unary > primary
  function parse(tokens) {
    var p = 0;
    var peek = function () { return tokens[p]; };
    var eat = function (v) { var t = tokens[p]; if (!t || (v && t.v !== v)) throw "Expected " + (v || "a value"); p++; return t; };
    function compare() { var l = concat(); while (peek() && /^(=|<>|<|>|<=|>=)$/.test(peek().v) && peek().k === "op") { var o = eat().v; l = { t: "bin", o: o, l: l, r: concat() }; } return l; }
    function concat() { var l = add(); while (peek() && peek().v === "&") { eat(); l = { t: "bin", o: "&", l: l, r: add() }; } return l; }
    function add() { var l = mul(); while (peek() && peek().k === "op" && (peek().v === "+" || peek().v === "-")) { var o = eat().v; l = { t: "bin", o: o, l: l, r: mul() }; } return l; }
    function mul() { var l = pow(); while (peek() && peek().k === "op" && (peek().v === "*" || peek().v === "/")) { var o = eat().v; l = { t: "bin", o: o, l: l, r: pow() }; } return l; }
    function pow() { var l = unary(); while (peek() && peek().v === "^") { eat(); l = { t: "bin", o: "^", l: l, r: unary() }; } return l; }
    function unary() { if (peek() && peek().k === "op" && (peek().v === "-" || peek().v === "+")) { var o = eat().v; var x = unary(); return o === "-" ? { t: "neg", x: x } : x; } return primary(); }
    function primary() {
      var t = peek(); if (!t) throw "Formula ended too early";
      if (t.k === "num" || t.k === "str" || t.k === "bool") { p++; return { t: "lit", v: t.v }; }
      if (t.k === "ref") { p++; return { t: "ref", v: t.v }; }
      if (t.k === "name") {
        p++; if (!peek() || peek().v !== "(") throw "Unknown name " + t.v;
        eat("("); var args = [];
        if (peek() && peek().v !== ")") { args.push(compare()); while (peek() && peek().v === ",") { eat(); args.push(compare()); } }
        eat(")"); return { t: "fn", n: t.v, a: args };
      }
      if (t.v === "(") { eat("("); var e = compare(); eat(")"); return e; }
      throw "Unexpected " + t.v;
    }
    var ast = compare();
    if (p < tokens.length) throw "Unexpected " + tokens[p].v;
    return ast;
  }

  function colNum(l) { var n = 0; for (var i = 0; i < l.length; i++) n = n * 26 + (l.charCodeAt(i) - 64); return n; }
  function splitRef(r) { var m = r.match(/^([A-Z]+)(\d+)$/); return [colNum(m[1]), +m[2]]; }
  function colName(n) { var s = ""; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

  function makeEvaluator(sheet) {
    // sheet: { "A1": value, ... }
    function cell(ref) { var v = sheet[ref]; return v === undefined ? null : v; }
    function range(r) {
      var parts = r.split(":"), a = splitRef(parts[0]), b = splitRef(parts[1] || parts[0]);
      var rows = [];
      for (var y = Math.min(a[1], b[1]); y <= Math.max(a[1], b[1]); y++) { var row = []; for (var x = Math.min(a[0], b[0]); x <= Math.max(a[0], b[0]); x++) row.push(cell(colName(x) + y)); rows.push(row); }
      return { range: true, rows: rows };
    }
    var flat = function (v) { if (v && v.range) return [].concat.apply([], v.rows); return [v]; };
    var num = function (v) { if (isErr(v)) return v; if (v === null || v === "") return 0; if (typeof v === "boolean") return v ? 1 : 0; if (typeof v === "number") return v; var n = Number(v); return isNaN(n) ? E("#VALUE!") : n; };
    var str = function (v) { if (v === null) return ""; if (typeof v === "boolean") return v ? "TRUE" : "FALSE"; return String(v); };
    var scalar = function (v) { if (v && v.range) return v.rows.length === 1 && v.rows[0].length === 1 ? v.rows[0][0] : E("#VALUE!"); return v; };
    function eq(a, b) { if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase(); return a === b || (a === null && b === "") || (a === "" && b === null); }
    function cmp(a, b) { if (typeof a === "number" && typeof b === "number") return a - b; var x = str(a).toLowerCase(), y = str(b).toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; }
    function criteria(c) {
      c = scalar(c);
      if (typeof c === "number") return function (v) { return v === c; };
      var m = str(c).match(/^(<=|>=|<>|<|>|=)?(.*)$/), op = m[1] || "=", rhs = m[2], n = Number(rhs), isNum = rhs !== "" && !isNaN(n);
      return function (v) {
        if (isNum && typeof v === "number") { switch (op) { case "=": return v === n; case "<>": return v !== n; case "<": return v < n; case ">": return v > n; case "<=": return v <= n; case ">=": return v >= n; } }
        if (op === "=") return str(v).toLowerCase() === rhs.toLowerCase();
        if (op === "<>") return str(v).toLowerCase() !== rhs.toLowerCase();
        return false;
      };
    }
    function need(args, min, max) { if (args.length < min || args.length > max) throw "Wrong number of arguments"; }
    var F = {
      SUM: function (a) { var s = 0; for (var i = 0; i < a.length; i++) { var vs = flat(a[i]); for (var j = 0; j < vs.length; j++) { var v = vs[j]; if (isErr(v)) return v; if (typeof v === "number") s += v; else if (!a[i].range) { var n = num(v); if (isErr(n)) return n; s += n; } } } return s; },
      AVERAGE: function (a) { var s = 0, c = 0; a.forEach(function (x) { flat(x).forEach(function (v) { if (typeof v === "number") { s += v; c++; } }); }); return c ? s / c : E("#DIV/0!"); },
      MIN: function (a) { var vs = []; a.forEach(function (x) { flat(x).forEach(function (v) { if (typeof v === "number") vs.push(v); }); }); return vs.length ? Math.min.apply(null, vs) : 0; },
      MAX: function (a) { var vs = []; a.forEach(function (x) { flat(x).forEach(function (v) { if (typeof v === "number") vs.push(v); }); }); return vs.length ? Math.max.apply(null, vs) : 0; },
      COUNT: function (a) { var c = 0; a.forEach(function (x) { flat(x).forEach(function (v) { if (typeof v === "number") c++; }); }); return c; },
      COUNTA: function (a) { var c = 0; a.forEach(function (x) { flat(x).forEach(function (v) { if (v !== null && v !== "") c++; }); }); return c; },
      COUNTIF: function (a) { need(a, 2, 2); var f = criteria(a[1]); return flat(a[0]).filter(f).length; },
      SUMIF: function (a) { need(a, 2, 3); var f = criteria(a[1]), r = flat(a[0]), s = a[2] ? flat(a[2]) : r, t = 0; r.forEach(function (v, i) { if (f(v) && typeof s[i] === "number") t += s[i]; }); return t; },
      AVERAGEIF: function (a) { need(a, 2, 3); var f = criteria(a[1]), r = flat(a[0]), s = a[2] ? flat(a[2]) : r, t = 0, c = 0; r.forEach(function (v, i) { if (f(v) && typeof s[i] === "number") { t += s[i]; c++; } }); return c ? t / c : E("#DIV/0!"); },
      IF: function (a) { need(a, 2, 3); var c = scalar(a[0]); if (isErr(c)) return c; var b = typeof c === "string" ? E("#VALUE!") : !!c; if (isErr(b)) return b; return b ? scalar(a[1]) : (a.length > 2 ? scalar(a[2]) : false); },
      IFERROR: function (a) { need(a, 2, 2); var v = scalar(a[0]); return isErr(v) ? scalar(a[1]) : v; },
      AND: function (a) { return a.every(function (x) { return flat(x).every(function (v) { return !!v; }); }); },
      OR: function (a) { return a.some(function (x) { return flat(x).some(function (v) { return !!v; }); }); },
      NOT: function (a) { need(a, 1, 1); return !scalar(a[0]); },
      ROUND: function (a) { need(a, 2, 2); var n = num(scalar(a[0])), d = num(scalar(a[1])); if (isErr(n)) return n; var f = Math.pow(10, d); return Math.round(n * f + (n >= 0 ? 1e-9 : -1e-9)) / f; },
      ABS: function (a) { var n = num(scalar(a[0])); return isErr(n) ? n : Math.abs(n); },
      VLOOKUP: function (a) {
        need(a, 3, 4); var key = scalar(a[0]), tbl = a[1], col = num(scalar(a[2])), exact = a.length > 3 ? !scalar(a[3]) : false;
        if (!tbl.range) return E("#VALUE!"); if (col < 1 || col > tbl.rows[0].length) return E("#REF!");
        if (exact) { for (var i = 0; i < tbl.rows.length; i++) if (eq(tbl.rows[i][0], key)) return tbl.rows[i][col - 1]; return E("#N/A"); }
        var hit = -1; for (var j = 0; j < tbl.rows.length; j++) { if (cmp(tbl.rows[j][0], key) <= 0) hit = j; else break; } return hit < 0 ? E("#N/A") : tbl.rows[hit][col - 1];
      },
      XLOOKUP: function (a) { need(a, 3, 4); var key = scalar(a[0]), look = flat(a[1]), ret = flat(a[2]); for (var i = 0; i < look.length; i++) if (eq(look[i], key)) return ret[i]; return a.length > 3 ? scalar(a[3]) : E("#N/A"); },
      MATCH: function (a) { need(a, 2, 3); var key = scalar(a[0]), look = flat(a[1]), type = a.length > 2 ? num(scalar(a[2])) : 1; if (type === 0) { for (var i = 0; i < look.length; i++) if (eq(look[i], key)) return i + 1; return E("#N/A"); } var hit = -1; for (var j = 0; j < look.length; j++) { if (cmp(look[j], key) <= 0) hit = j; else break; } return hit < 0 ? E("#N/A") : hit + 1; },
      INDEX: function (a) { need(a, 2, 3); var r = a[0], row = num(scalar(a[1])), col = a.length > 2 ? num(scalar(a[2])) : 1; if (isErr(row)) return row; if (!r.range) return E("#VALUE!"); if (r.rows.length === 1 && a.length === 2) { col = row; row = 1; } var v = r.rows[row - 1] && r.rows[row - 1][col - 1]; return v === undefined ? E("#REF!") : v; },
      LEFT: function (a) { var s = str(scalar(a[0])), n = a.length > 1 ? num(scalar(a[1])) : 1; return isErr(n) ? n : s.slice(0, n); },
      RIGHT: function (a) { var s = str(scalar(a[0])), n = a.length > 1 ? num(scalar(a[1])) : 1; return isErr(n) ? n : n === 0 ? "" : s.slice(-n); },
      MID: function (a) { need(a, 3, 3); var s = str(scalar(a[0])), st = num(scalar(a[1])), n = num(scalar(a[2])); return s.substr(st - 1, n); },
      LEN: function (a) { return str(scalar(a[0])).length; },
      FIND: function (a) { need(a, 2, 3); var f = str(scalar(a[0])), s = str(scalar(a[1])), st = a.length > 2 ? num(scalar(a[2])) : 1, i = s.indexOf(f, st - 1); return i < 0 ? E("#VALUE!") : i + 1; },
      SEARCH: function (a) { need(a, 2, 3); var f = str(scalar(a[0])).toLowerCase(), s = str(scalar(a[1])).toLowerCase(), st = a.length > 2 ? num(scalar(a[2])) : 1, i = s.indexOf(f, st - 1); return i < 0 ? E("#VALUE!") : i + 1; },
      UPPER: function (a) { return str(scalar(a[0])).toUpperCase(); },
      LOWER: function (a) { return str(scalar(a[0])).toLowerCase(); },
      PROPER: function (a) { return str(scalar(a[0])).toLowerCase().replace(/(^|[^a-z])([a-z])/g, function (m, p, c) { return p + c.toUpperCase(); }); },
      TRIM: function (a) { return str(scalar(a[0])).trim().replace(/ +/g, " "); },
      CONCAT: function (a) { return a.map(function (x) { return flat(x).map(str).join(""); }).join(""); },
      CONCATENATE: function (a) { return a.map(function (x) { return str(scalar(x)); }).join(""); },
      TEXTJOIN: function (a) { var d = str(scalar(a[0])), skip = !!scalar(a[1]), vs = []; a.slice(2).forEach(function (x) { flat(x).forEach(function (v) { if (!(skip && (v === null || v === ""))) vs.push(str(v)); }); }); return vs.join(d); }
    };
    function ev(n) {
      switch (n.t) {
        case "lit": return n.v;
        case "ref": return n.v.indexOf(":") > -1 ? range(n.v) : cell(n.v);
        case "neg": var x = num(scalar(ev(n.x))); return isErr(x) ? x : -x;
        case "fn": if (!F[n.n]) return E("#NAME?"); var args = n.a.map(ev); for (var i = 0; i < args.length; i++) if (isErr(args[i]) && n.n !== "IFERROR") return args[i]; return F[n.n](args);
        case "bin":
          var l = scalar(ev(n.l)), r = scalar(ev(n.r));
          if (isErr(l)) return l; if (isErr(r)) return r;
          if (n.o === "&") return str(l) + str(r);
          if (/^(=|<>|<|>|<=|>=)$/.test(n.o)) { var c = n.o === "=" || n.o === "<>" ? (eq(l, r) ? 0 : 1) : cmp(l, r); return n.o === "=" ? c === 0 : n.o === "<>" ? c !== 0 : n.o === "<" ? c < 0 : n.o === ">" ? c > 0 : n.o === "<=" ? c <= 0 : c >= 0; }
          var a = num(l), b = num(r); if (isErr(a)) return a; if (isErr(b)) return b;
          if (n.o === "+") return a + b; if (n.o === "-") return a - b; if (n.o === "*") return a * b; if (n.o === "^") return Math.pow(a, b);
          if (n.o === "/") return b === 0 ? E("#DIV/0!") : a / b;
      }
    }
    return function evaluate(formula) {
      var src = String(formula).trim();
      if (src[0] !== "=") return { error: "Formulas start with an equals sign (=)." };
      try { var v = ev(parse(tokenize(src.slice(1)))); return { value: scalar(v) }; }
      catch (e) { return { error: typeof e === "string" ? e : "Check the formula for typos." }; }
    };
  }

  function format(v) {
    if (v === null || v === undefined) return "";
    if (isErr(v)) return v.err;
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString("en-US") : String(Math.round(v * 1e6) / 1e6);
    return String(v);
  }
  function same(a, b) { if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9; if (typeof a === "string" && typeof b === "string") return a === b; if (isErr(a) || isErr(b)) return false; return a === b; }

  var api = { makeEvaluator: makeEvaluator, format: format, same: same, isErr: isErr, colName: colName };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Formula = api;
})(this);
