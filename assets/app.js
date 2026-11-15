/* Купол — общий скрипт для всех страниц */
(function () {
  'use strict';
  var PHONE = '79816666670';
  /* Номер счётчика Яндекс Метрики. Пока 0 — Метрика не грузится вовсе.
     Когда заведёте счётчик под Директ, впишите номер сюда. */
  var YM_ID = 0;

  document.documentElement.classList.add('js');
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ---- Мобильное меню ---- */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    $$('.sheet a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') document.body.classList.remove('menu-open'); });
  }

  /* ---- Появление блоков ---- */
  var els = $$('.rv');
  if (!('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- Значок прячется над тёмным блоком и подвалом ---- */
  var badge = $('.badge');
  if (badge && 'IntersectionObserver' in window) {
    var hide = new Set();
    var bo = new IntersectionObserver(function (l) {
      l.forEach(function (en) { en.isIntersecting ? hide.add(en.target) : hide.delete(en.target); });
      badge.classList.toggle('off', hide.size > 0);
    }, { rootMargin: '0px 0px -60% 0px' });
    $$('.dark, footer, #form').forEach(function (s) { bo.observe(s); });
  }

  /* ---- Наклон карточек за курсором ---- */
  if (!calm && matchMedia('(hover: hover)').matches) {
    $$('.work').forEach(function (w) {
      var ph = $('.ph', w);
      w.addEventListener('pointermove', function (e) {
        var r = ph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        ph.style.transform = 'rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg) translateZ(8px)';
      });
      w.addEventListener('pointerleave', function () { ph.style.transform = ''; });
    });
  }

  /* ---- Параллакс фото в карточке с цитатой ---- */
  var q = $('#quote');
  if (q && !calm) {
    var qi = $('img', q), tick = false;
    var upd = function () {
      tick = false;
      var r = q.getBoundingClientRect(), p = (r.top + r.height / 2) / innerHeight - .5;
      qi.style.transform = 'translateY(' + (-7 - p * 7) + '%)';
    };
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---- FAQ: открыт один вопрос за раз ---- */
  $$('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) $$('.faq details').forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---- Заявка: собираем сообщение и открываем выбранный мессенджер ---- */
  var lead = $('#lead');
  if (lead) {
    var agree = $('#f-agree', lead), btns = $$('button[data-ch]', lead);
    var sync = function () { btns.forEach(function (b) { b.disabled = !agree.checked; }); };
    agree.addEventListener('change', sync); sync();
    lead.addEventListener('submit', function (e) { e.preventDefault(); });
    btns.forEach(function (b) { b.addEventListener('click', function () {
      if (!agree.checked) return;
      var f = lead.elements, lines = ['Здравствуйте. Нужен расчёт монтажа.'];
      [['name', 'Компания'], ['tel', 'Телефон'], ['obj', 'Объект'], ['what', 'Что нужно'], ['scope', 'Объём и сроки']].forEach(function (p) {
        var v = (f[p[0]].value || '').trim(); if (v) lines.push(p[1] + ': ' + v);
      });
      var txt = encodeURIComponent(lines.join('\n'));
      var url = b.getAttribute('data-ch') === 'tg' ? 'https://t.me/+' + PHONE + '?text=' + txt : 'https://wa.me/' + PHONE + '?text=' + txt;
      if (!window.open(url, '_blank')) location.href = url;
    }); });
  }

  /* ---- Копирование номера ---- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.textContent, num = '+' + PHONE;
      var done = function () { b.textContent = 'Номер скопирован'; setTimeout(function () { b.textContent = label; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(num).then(done, function () { b.textContent = num; });
      else b.textContent = num;
    });
  });

  /* ---- Cookie: баннер и загрузка Метрики только после согласия ---- */
  var KEY = 'kupol-cookies';
  function loadYM() {
    if (!YM_ID || window.ym) return;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(YM_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }
  function banner() {
    var c = $('#cookie'); if (!c) return;
    c.hidden = false; requestAnimationFrame(function () { c.classList.add('show'); });
    var close = function (v) { store(KEY, v); c.classList.remove('show'); setTimeout(function () { c.hidden = true; }, 500); if (v === 'all') loadYM(); };
    $('[data-ck=all]', c).onclick = function () { close('all'); };
    $('[data-ck=need]', c).onclick = function () { close('need'); };
  }
  var choice = store(KEY);
  if (choice === 'all') loadYM(); else if (!choice) setTimeout(banner, 1200);
  $$('[data-cookie-settings]').forEach(function (b) { b.addEventListener('click', banner); });

  /* ---- 3D-модель: здание под куполом из двух сеток на мачтах.
        Свой 3D-движок на canvas: перспектива, сортировка граней, освещение, вращение мышью/пальцем.
        Клик по любой стороне купола — дрон бьёт в эту точку, сетка прогибается и держит. ---- */
  var c = $('#dome');
  if (c && c.getContext) (function () {
    var g = c.getContext('2d'), box = $('#media'), notch = $('.notch', box), hint = $('#hint');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2), lite = innerWidth < 620;
    var PX = 2, PZ = 1.25, MH = 1.15, NMX = 4, CAM = 7.5, OFF = .05;
    var NU = lite ? 28 : 40, NV = lite ? 16 : 24, NB = lite ? 6 : 8;
    var F = 0, CX = 0, CY = 0, yaw = .62, pit = .5, yawT = .62, pitT = .5, idle = 9;
    var cy = 1, sy = 0, cp = 1, sp = 0;
    var t = 0, on = true, hits = 0, next = 3;
    var rip = [], drones = [], sparks = [], labels = [], G = [];
    var zoom = 1, fx = 0, fy = 0, ox = 0, oy = 0, shake = 0, lowQ = false, slow = 0, weak = false;
    var LX = -.45, LY = .75, LZ = .5, LL = Math.hypot(LX, LY, LZ); LX /= LL; LY /= LL; LZ /= LL;
    /* поверхности: 0 — кровля, 1 — фасад z+, 2 — фасад z−, 3 — торец x+, 4 — торец x− */
    var NRM = [[0, 1, 0], [0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]];
    var DIM = [[2 * PX, 2 * PZ], [2 * PX, MH], [2 * PX, MH], [2 * PZ, MH], [2 * PZ, MH]];
    var CNT = [[NU, NV], [NU, NB], [NU, NB], [NV, NB], [NV, NB]];

    function setCam() { cy = Math.cos(yaw); sy = Math.sin(yaw); cp = Math.cos(pit); sp = Math.sin(pit); }
    function vw(X, Y, Z) { var x = X * cy - Z * sy, z = X * sy + Z * cy; return [x, Y * cp + z * sp, z * cp - Y * sp]; }
    function pr(v) { var s = F / (v[2] + CAM); return [CX + v[0] * s, CY - v[1] * s, v[2], s]; }
    function P3(X, Y, Z) { return pr(vw(X, Y, Z)); }
    function size() {
      var r = c.getBoundingClientRect(); W = r.width; H = r.height;
      c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); F = 0;
    }
    /* вписываем модель в свободную часть экрана при любом повороте */
    function fit(k) {
      var nh = notch ? notch.offsetHeight : 0, narrow = W < 700;
      var x0 = W * (narrow ? .03 : .16), x1 = W * .98, y0 = (narrow ? nh : nh * .86) + 14, y1 = H - (narrow ? 118 : 74);
      if (y1 - y0 < 160) y0 = y1 - 160;
      var a = 1e9, b = -1e9, cc = 1e9, d = -1e9;
      [-1, 1].forEach(function (i) { [-1, 1].forEach(function (j) { [0, MH].forEach(function (y) {
        var v = vw(i * (PX + .12), y, j * (PZ + .12)), s = 1 / (v[2] + CAM), x = v[0] * s, yy = -v[1] * s;
        if (x < a) a = x; if (x > b) b = x; if (yy < cc) cc = yy; if (yy > d) d = yy;
      }); }); });
      var Ft = Math.min((x1 - x0) / (b - a), (y1 - y0) / (d - cc));
      var CXt = (x0 + x1) / 2 - (a + b) / 2 * Ft, CYt = (y0 + y1) / 2 - (cc + d) / 2 * Ft;
      if (!F) { F = Ft; CX = CXt; CY = CYt; fx = CX; fy = CY; }
      else { F += (Ft - F) * k; CX += (CXt - CX) * k; CY += (CYt - CY) * k; }
    }

    /* ---------- сетка ---------- */
    function roofY(u, v) {
      var eu = .1 * Math.pow(Math.sin(Math.PI * u * NMX), 2), ev = .1 * Math.pow(Math.sin(Math.PI * v * 2), 2);
      var wu = 4 * u * (1 - u), wv = 4 * v * (1 - v);
      return MH - eu * (1 - wv) - ev * (1 - wu) - .17 * Math.pow(wu, .8) * Math.pow(wv, .8);
    }
    function disp(s, a, b) {
      var val = 0, dm = DIM[s];
      for (var i = 0; i < rip.length; i++) {
        var r = rip[i]; if (r.s !== s) continue;
        var d = Math.hypot((a - r.a) * dm[0], (b - r.b) * dm[1]);
        val += .1 * r.k * Math.exp(-r.t * 1.5) * Math.cos(d * 9 - r.t * 9) * Math.exp(-d * 2.2);
        if (r.hold) val += .085 * Math.min(1, r.t * 8) * (r.t < 2.5 ? 1 : Math.max(0, 1 - (r.t - 2.5) / .6)) * Math.exp(-d * d * 26);
      }
      return val;
    }
    function edgeH(s, a) { return s < 3 ? roofY(a, s === 1 ? 1 : 0) : roofY(s === 3 ? 1 : 0, a); }
    function S(s, a, b, off) {
      var d = off + disp(s, a, b);
      if (s === 0) return [(a - .5) * 2 * PX, roofY(a, b) - d, (b - .5) * 2 * PZ];
      var y = b * edgeH(s, a);
      if (s === 1) return [(a - .5) * 2 * PX, y, PZ - d];
      if (s === 2) return [(a - .5) * 2 * PX, y, -PZ + d];
      if (s === 3) return [PX - d, y, (a - .5) * 2 * PZ];
      return [-PX + d, y, (a - .5) * 2 * PZ];
    }
    function SP(s, a, b, off) { var w = S(s, a, b, off); return P3(w[0], w[1], w[2]); }
    function grid(s) {
      var n = CNT[s][0], m = CNT[s][1], L = [[], []];
      for (var i = 0; i <= n; i++) { L[0][i] = []; L[1][i] = []; for (var j = 0; j <= m; j++) { L[0][i][j] = SP(s, i / n, j / m, 0); L[1][i][j] = SP(s, i / n, j / m, OFF); } }
      G[s] = L;
    }
    function drawNet(s, far) {
      var n = CNT[s][0], m = CNT[s][1], A = G[s][0], M = G[s][1], i, j, k = far ? .42 : 1;
      /* лёгкая заливка для объёма */
      g.beginPath(); g.moveTo(A[0][0][0], A[0][0][1]);
      for (i = 1; i <= n; i++) g.lineTo(A[i][0][0], A[i][0][1]);
      for (j = 1; j <= m; j++) g.lineTo(A[n][j][0], A[n][j][1]);
      for (i = n - 1; i >= 0; i--) g.lineTo(A[i][m][0], A[i][m][1]);
      for (j = m - 1; j > 0; j--) g.lineTo(A[0][j][0], A[0][j][1]);
      g.closePath(); g.fillStyle = 'rgba(120,100,255,' + (s ? .05 : .06) * k + ')'; g.fill();
      /* внутренний слой — «Манье», ромбическая ячейка */
      g.beginPath();
      for (i = 0; i < n; i++) for (j = 0; j < m; j++) {
        g.moveTo(M[i][j][0], M[i][j][1]); g.lineTo(M[i + 1][j + 1][0], M[i + 1][j + 1][1]);
        g.moveTo(M[i + 1][j][0], M[i + 1][j][1]); g.lineTo(M[i][j + 1][0], M[i][j + 1][1]);
      }
      g.strokeStyle = 'rgba(201,245,91,' + .27 * k + ')'; g.lineWidth = .7; g.stroke();
      /* внешний слой — антидроновая сетка, прямая ячейка */
      g.beginPath();
      for (i = 0; i <= n; i++) { g.moveTo(A[i][0][0], A[i][0][1]); for (j = 1; j <= m; j++) g.lineTo(A[i][j][0], A[i][j][1]); }
      for (j = 0; j <= m; j++) { g.moveTo(A[0][j][0], A[0][j][1]); for (i = 1; i <= n; i++) g.lineTo(A[i][j][0], A[i][j][1]); }
      g.strokeStyle = 'rgba(222,214,255,' + .5 * k + ')'; g.lineWidth = .8; g.stroke();
      /* тросы */
      function cable(pts, w) { g.beginPath(); pts.forEach(function (p, q) { q ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.lineWidth = w; g.stroke(); }
      function col(i2) { var a = []; for (var q = 0; q <= m; q++) a.push(A[i2][q]); return a; }
      function row(j2) { var a = []; for (var q = 0; q <= n; q++) a.push(A[q][j2]); return a; }
      g.strokeStyle = 'rgba(255,255,255,' + .95 * k + ')'; g.shadowColor = 'rgba(160,140,255,.9)'; g.shadowBlur = far || lowQ ? 0 : 7;
      if (s === 0) {
        for (i = 0; i <= NMX; i++) cable(col(i * n / NMX), i % NMX ? 1.6 : 2.3);
        cable(row(0), 2.3); cable(row(m), 2.3); cable(row(m / 2), 1.6);
      } else { cable(row(m), 2.3); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,' + .5 * k + ')'; cable(row(0), 1.2); }
      g.shadowBlur = 0;
    }

    /* ---------- мачты ---------- */
    var MASTS = [];
    for (var mi = 0; mi <= NMX; mi++) { MASTS.push([(mi / NMX - .5) * 2 * PX, PZ, 0, 1]); MASTS.push([(mi / NMX - .5) * 2 * PX, -PZ, 0, -1]); }
    MASTS.push([PX, 0, 1, 0]); MASTS.push([-PX, 0, -1, 0]);
    function drawMast(m) {
      var X = m[0], Z = m[1], w = .045, top = MH, n = 9, q, L = [[-w, -w], [w, -w], [w, w], [-w, w]];
      var a = P3(X, top, Z);
      g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1;
      var gx = m[2] || (X > 0 ? .5 : X < 0 ? -.5 : 0), gz = m[3];
      g.beginPath(); g.moveTo(a[0], a[1]); var e = P3(X + gx * .75, 0, Z + gz * .75); g.lineTo(e[0], e[1]); g.stroke();
      g.strokeStyle = 'rgba(240,236,255,.95)'; g.lineWidth = 1.5; g.beginPath();
      L.forEach(function (l) { var p0 = P3(X + l[0], 0, Z + l[1]), p1 = P3(X + l[0], top, Z + l[1]); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); });
      g.stroke();
      g.strokeStyle = 'rgba(235,230,255,.55)'; g.lineWidth = .8; g.beginPath();
      for (q = 0; q < n; q++) for (var f = 0; f < 4; f++) {
        var l0 = L[f], l1 = L[(f + 1) % 4], y0 = top * q / n, y1 = top * (q + 1) / n, fl = q % 2;
        var p = P3(X + (fl ? l0 : l1)[0], y0, Z + (fl ? l0 : l1)[1]), r = P3(X + (fl ? l1 : l0)[0], y1, Z + (fl ? l1 : l0)[1]);
        g.moveTo(p[0], p[1]); g.lineTo(r[0], r[1]);
      }
      g.stroke();
      g.fillStyle = '#C9F55B'; g.beginPath(); g.arc(a[0], a[1], 3.4, 0, 7); g.fill();
    }

    /* ---------- здание: грани с нормалями, освещение, сортировка по глубине ---------- */
    var FACES = [];
    function face(pts, col, decor, nrm) {
      var a = pts[0], b = pts[1], d = pts[2], ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      var n = nrm || [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], l = Math.hypot(n[0], n[1], n[2]) || 1;
      FACES.push({ p: pts, n: [n[0] / l, n[1] / l, n[2] / l], c: col, d: decor || {} });
    }
    function boxF(x0, x1, y1, z0, z1, wc, rc, dec) {
      dec = dec || {};
      face([[x0, 0, z1], [x1, 0, z1], [x1, y1, z1], [x0, y1, z1]], wc, dec.front);
      face([[x1, 0, z0], [x0, 0, z0], [x0, y1, z0], [x1, y1, z0]], wc, dec.back);
      face([[x1, 0, z1], [x1, 0, z0], [x1, y1, z0], [x1, y1, z1]], wc, dec.right);
      face([[x0, 0, z0], [x0, 0, z1], [x0, y1, z1], [x0, y1, z0]], wc, dec.left);
      if (!dec.noTop) face([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], rc, dec.top);
    }
    function vlines(x0, x1, y0, y1, z, step) { var a = []; for (var x = x0 + step; x < x1 - .01; x += step) a.push([[x, y0, z], [x, y1, z]]); return a; }
    function zlines(z0, z1, y0, y1, x, step) { var a = []; for (var z = z0 + step; z < z1 - .01; z += step) a.push([[x, y0, z], [x, y1, z]]); return a; }
    (function build() {
      var WALL = [118, 110, 196], ROOF = [156, 150, 228], DARK = [36, 30, 84], LIT = [201, 245, 91];
      var x0 = -1.4, x1 = .95, z0 = -.62, z1 = .62, h = .5, gb = .13;
      function wall(z, flip) {
        var polys = [{ p: [[x0 + .1, h * .66, z], [x1 - .1, h * .66, z], [x1 - .1, h * .8, z], [x0 + .1, h * .8, z]], c: LIT, a: .75 }];
        if (!flip) [-1.05, -.35, .35].forEach(function (dx) { polys.push({ p: [[dx, 0, z], [dx + .34, 0, z], [dx + .34, h * .52, z], [dx, h * .52, z]], c: DARK, a: 1 }); });
        return { lines: vlines(x0, x1, 0, h, z, .13), polys: polys };
      }
      boxF(x0, x1, h, z0, z1, WALL, ROOF, { noTop: true, front: wall(z1), back: wall(z0, true), right: { lines: zlines(z0, z1, 0, h, x1, .13) }, left: { lines: zlines(z0, z1, 0, h, x0, .13) } });
      var ribs1 = [], ribs2 = []; for (var x = x0 + .16; x < x1 - .05; x += .16) { ribs1.push([[x, h, z1], [x, h + gb, 0]]); ribs2.push([[x, h, z0], [x, h + gb, 0]]); }
      face([[x0, h, z1], [x1, h, z1], [x1, h + gb, 0], [x0, h + gb, 0]], ROOF, { lines: ribs1 });
      face([[x1, h, z0], [x0, h, z0], [x0, h + gb, 0], [x1, h + gb, 0]], ROOF, { lines: ribs2 });
      face([[x1, h, z1], [x1, h, z0], [x1, h + gb, 0]], WALL); face([[x0, h, z0], [x0, h, z1], [x0, h + gb, 0]], WALL);
      /* пристройка, вентблоки, щитовые */
      boxF(.95, 1.45, .3, -.36, .36, [104, 96, 180], [140, 134, 214], { front: { lines: vlines(.95, 1.45, 0, .3, .36, .1), polys: [{ p: [[1.08, 0, .36], [1.3, 0, .36], [1.3, .2, .36], [1.08, .2, .36]], c: DARK, a: 1 }] }, right: { polys: [{ p: [[1.45, .16, .26], [1.45, .16, -.26], [1.45, .24, -.26], [1.45, .24, .26]], c: LIT, a: .7 }] } });
      boxF(-1.0, -.8, .12, -1.0, -.82, [96, 90, 170], [130, 124, 204]); boxF(-.6, -.4, .12, -1.0, -.82, [96, 90, 170], [130, 124, 204]);
      /* резервуары */
      function tank(cx, cz, r, hh) {
        var n = 16, top = [], i;
        for (i = 0; i < n; i++) {
          var a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, p0 = [cx + r * Math.cos(a0), cz + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cz + r * Math.sin(a1)], am = (a0 + a1) / 2;
          face([[p1[0], 0, p1[1]], [p0[0], 0, p0[1]], [p0[0], hh, p0[1]], [p1[0], hh, p1[1]]], [168, 164, 236], { soft: 1 }, [Math.cos(am), 0, Math.sin(am)]);
          top.push([p0[0], hh, p0[1]]);
        }
        face(top, [190, 186, 246], {}, [0, 1, 0]);
      }
      tank(1.55, .82, .24, .36); tank(1.02, .9, .2, .3);
    })();
    function drawBuilding() {
      /* тень на земле */
      var sh = [P3(-1.5, 0, -.72), P3(1.75, 0, -.72), P3(1.75, 0, 1.12), P3(-1.5, 0, 1.12)];
      g.fillStyle = 'rgba(4,2,16,.5)'; g.beginPath(); sh.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill();
      var vis = [];
      FACES.forEach(function (f) {
        var n = vw(f.n[0], f.n[1], f.n[2]), cx2 = 0, cy2 = 0, cz2 = 0, k = f.p.length;
        var v = f.p.map(function (p) { var q = vw(p[0], p[1], p[2]); cx2 += q[0]; cy2 += q[1]; cz2 += q[2]; return q; });
        cx2 /= k; cy2 /= k; cz2 /= k;
        if (n[0] * cx2 + n[1] * cy2 + n[2] * (cz2 + CAM) >= 0) return;
        vis.push({ f: f, v: v, z: cz2 });
      });
      vis.sort(function (a, b) { return b.z - a.z; });
      vis.forEach(function (o) {
        var f = o.f, sh2 = .42 + .62 * Math.max(0, f.n[0] * LX + f.n[1] * LY + f.n[2] * LZ);
        function path(v) { g.beginPath(); v.forEach(function (q, i) { var p = pr(q); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); }
        function rgb(cc, a) { return 'rgba(' + Math.min(255, cc[0] * sh2 | 0) + ',' + Math.min(255, cc[1] * sh2 | 0) + ',' + Math.min(255, cc[2] * sh2 | 0) + ',' + a + ')'; }
        path(o.v); g.fillStyle = rgb(f.c, 1); g.fill();
        g.strokeStyle = f.d.soft ? rgb(f.c, 1) : 'rgba(255,255,255,.3)'; g.lineWidth = f.d.soft ? 1 : .8; g.stroke();
        if (f.d.lines) { g.beginPath(); f.d.lines.forEach(function (l) { var a = P3(l[0][0], l[0][1], l[0][2]), b = P3(l[1][0], l[1][1], l[1][2]); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }); g.strokeStyle = 'rgba(20,14,70,.22)'; g.lineWidth = .8; g.stroke(); }
        if (f.d.polys) f.d.polys.forEach(function (pl) {
          path(pl.p.map(function (p) { return vw(p[0], p[1], p[2]); }));
          if (pl.c[0] === 201) { g.fillStyle = 'rgba(201,245,91,' + pl.a + ')'; g.fill(); }
          else { g.fillStyle = rgb(pl.c, pl.a); g.fill(); }
        });
      });
    }

    /* ---------- дрон ---------- */
    function drawDrone(p, R, al, spin, tilt, dead) {
      g.save(); g.translate(p[0], p[1]); g.rotate(tilt); g.globalAlpha = al; g.lineCap = 'round';
      for (var i = 0; i < 4; i++) {
        var an = Math.PI / 4 + i * Math.PI / 2, ex = Math.cos(an) * R, ey = Math.sin(an) * R * .5, rx = R * .46, ry = R * .22;
        g.strokeStyle = '#E9E6FF'; g.lineWidth = Math.max(1.4, R * .1); g.beginPath(); g.moveTo(0, 0); g.lineTo(ex, ey); g.stroke();
        g.fillStyle = dead ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.14)'; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, 7); g.fill(); g.stroke();
        var s2 = dead ? i : spin + i;
        for (var b = 0; b < 2; b++) { var bx = Math.cos(s2 + b * 1.57) * rx, by = Math.sin(s2 + b * 1.57) * ry; g.strokeStyle = 'rgba(255,255,255,' + (dead ? .85 : .45) + ')'; g.lineWidth = Math.max(1, R * .05); g.beginPath(); g.moveTo(ex - bx, ey - by); g.lineTo(ex + bx, ey + by); g.stroke(); }
      }
      g.fillStyle = '#15121F'; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.2, R * .07);
      g.beginPath(); g.ellipse(0, 0, R * .3, R * .19, 0, 0, 7); g.fill(); g.stroke();
      g.shadowColor = '#FF4D6D'; g.shadowBlur = dead ? 4 : 14; g.fillStyle = dead ? '#8a3344' : '#FF4D6D';
      g.beginPath(); g.arc(0, 0, Math.max(1.6, R * .09), 0, 7); g.fill();
      g.restore();
    }
    function spawn(s, a, b, user) {
      var n = NRM[s], w = S(s, a, b, 0), r1 = (Math.random() - .5) * 1.6, r2 = (Math.random() - .5) * 1.6, far = user ? 2.3 : 2.9;
      var from = s === 0 ? [w[0] + r1, w[1] + far, w[2] + r2] : [w[0] + n[0] * far + (n[0] ? 0 : r1), w[1] + .5 + Math.abs(r2) * .6, w[2] + n[2] * far + (n[2] ? 0 : r1)];
      drones.push({ s: s, a: a, b: b, t: 0, T: user ? 1.0 : 1.6, from: from, user: user, hit: false, tilt: (Math.random() - .5) * 1.1, trail: [] });
    }
    function impact(d) {
      d.hit = true; hits++;
      rip.push({ s: d.s, a: d.a, b: d.b, t: 0, k: d.user ? 2.2 : 1.1, hold: 1 });
      var p = SP(d.s, d.a, d.b, 0), n = d.user ? 30 : 12;
      for (var i = 0; i < n; i++) { var an = Math.random() * 6.28, v = 60 + Math.random() * 240; sparks.push({ x: p[0], y: p[1], vx: Math.cos(an) * v, vy: Math.sin(an) * v * .6 - 60, a: 0, life: .5 + Math.random() * .5 }); }
      if (d.user) { shake = 9; labels.push({ s: d.s, a: d.a, b: d.b, t: 0 }); }
      if (hint) { hint.classList.add('done'); hint.innerHTML = 'Остановлено дронов: <b>' + hits + '</b>'; }
    }
    /* слабые места: провис между мачтами, провис кровли и отступ сетки от стены */
    function pill(text, p, bg, fg) {
      var fs = 12.5 / Math.max(1, zoom * .8); g.font = '600 ' + fs + 'px Segoe UI, Roboto, Arial, sans-serif'; g.textAlign = 'center';
      var tw = g.measureText(text).width + fs * 1.3; g.fillStyle = bg; g.beginPath();
      if (g.roundRect) g.roundRect(p[0] - tw / 2, p[1] - fs * 1.15, tw, fs * 1.7, fs); else g.rect(p[0] - tw / 2, p[1] - fs * 1.15, tw, fs * 1.7);
      g.fill(); g.fillStyle = fg; g.fillText(text, p[0], p[1]);
    }
    function zone(s, a0, a1, b0, b1) {
      var e, q = 8; g.beginPath();
      for (e = 0; e <= q; e++) { var p = SP(s, a0 + (a1 - a0) * e / q, b1, -.012); e ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
      for (e = q; e >= 0; e--) { var p2 = SP(s, a0 + (a1 - a0) * e / q, b0, -.012); g.lineTo(p2[0], p2[1]); }
      g.closePath(); g.fillStyle = 'rgba(255,77,109,' + (.2 + .06 * Math.sin(t * 3)) + ')'; g.fill(); g.strokeStyle = 'rgba(255,77,109,.9)'; g.lineWidth = 1.4; g.stroke();
    }
    function drawWeak(nearS) {
      nearS.forEach(function (s) { var n = s < 3 ? NMX : 2; for (var k = 0; k < n; k++) zone(s, (k + .14) / n, (k + .86) / n, .32, .9); });
      zone(0, .3, .7, .28, .72);
      var lbl = [];
      nearS.forEach(function (s) { var n = s < 3 ? NMX : 2, k = s < 3 ? 1 : 0; lbl.push([SP(s, (k + .5) / n, .62, -.02), 'Провис между мачтами']); });
      lbl.push([SP(0, .5, .5, -.02), 'Провис кровли']);
      var s1 = nearS.indexOf(1) >= 0 ? 1 : nearS.indexOf(2) >= 0 ? 2 : 0;
      if (s1) {
        var zs = s1 === 1 ? PZ : -PZ, zw = s1 === 1 ? .62 : -.62, a = P3(.4, .22, zs), b = P3(.4, .22, zw);
        g.strokeStyle = '#C9F55B'; g.lineWidth = 2; g.setLineDash([5, 4]); line2(a, b); g.setLineDash([]);
        g.fillStyle = '#C9F55B'; [a, b].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 3.5, 0, 7); g.fill(); });
        pill('Отступ от стены', [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 12], '#C9F55B', '#0B0B0F');
      }
      lbl.forEach(function (l) { pill(l[1], l[0], '#FF4D6D', '#fff'); });
    }
    function isFar(s) { var n = NRM[s], v = vw(n[0], n[1], n[2]); return v[2] > .02; }
    function line2(a, b) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }

    function frame(dtReal) {
      var ts = 1, focus = null, i, j;
      drones.forEach(function (d) { if (!d.user) return; var rel = d.t - d.T; if (rel > -.22 && rel < .5) ts = .28; if (rel < 1.5) focus = d; });
      var dt = dtReal * ts; t += dt; idle += dtReal;
      if (idle > 3.5 && !focus) yawT += dtReal * .09;
      yaw += (yawT - yaw) * Math.min(1, dtReal * 6); pit += (pitT - pit) * Math.min(1, dtReal * 6); setCam(); fit(Math.min(1, dtReal * 5));
      for (i = rip.length - 1; i >= 0; i--) { rip[i].t += dt; if (rip[i].t > 3.6) rip.splice(i, 1); }
      for (i = 0; i < 5; i++) grid(i);

      var zt = 1, tx = CX, ty = CY;
      if (focus) { var fp = SP(focus.s, focus.a, focus.b, 0); zt = lite ? 1.7 : 2.1; tx = fp[0]; ty = fp[1]; }
      var k = Math.min(1, dtReal * 3.2);
      zoom += (zt - zoom) * k; fx += (tx - fx) * k; fy += (ty - fy) * k; shake *= Math.pow(.01, dtReal);
      ox = fx + (W * .56 - fx) * (zoom - 1) * .5; oy = fy + (H * .58 - fy) * (zoom - 1) * .5;
      g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
      g.translate(ox + (Math.random() - .5) * shake, oy + (Math.random() - .5) * shake); g.scale(zoom, zoom); g.translate(-fx, -fy);
      g.lineCap = 'round'; g.lineJoin = 'round';

      /* земля */
      g.lineWidth = 1; g.strokeStyle = 'rgba(160,140,255,.11)'; g.beginPath();
      for (var q = -7; q <= 7; q++) { var a1 = P3(q * .5, 0, -2.6), a2 = P3(q * .5, 0, 2.6), b1 = P3(-3.5, 0, q * .37), b2 = P3(3.5, 0, q * .37); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); }
      g.stroke();

      var farM = [], nearM = [];
      MASTS.forEach(function (m) { (vw(m[0], MH / 2, m[1])[2] > 0 ? farM : nearM).push(m); });
      var farS = [], nearS = []; for (i = 1; i < 5; i++) (isFar(i) ? farS : nearS).push(i);
      farM.forEach(drawMast);
      farS.forEach(function (s) { drawNet(s, true); });
      drawBuilding();
      drawNet(0, false);
      nearS.forEach(function (s) { drawNet(s, false); });
      nearM.forEach(drawMast);
      if (weak) drawWeak(nearS);

      /* волна от удара — кольцо лежит на поверхности сетки */
      rip.forEach(function (r) {
        if (r.t > 1.3) return; var k2 = r.t / 1.3, rr = (.06 + k2 * .5) * (r.k > 2 ? 1.25 : 1), dm = DIM[r.s];
        g.strokeStyle = 'rgba(201,245,91,' + (1 - k2) + ')'; g.lineWidth = 2.2; g.beginPath();
        for (var e = 0; e <= 28; e++) { var an = e / 28 * 6.2832, p = SP(r.s, r.a + Math.cos(an) * rr / dm[0], r.b + Math.sin(an) * rr / dm[1], -.01); e ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
        g.stroke();
      });

      /* дроны */
      next -= dt;
      if (next <= 0) { if (!drones.length) { var pool = [0, 0].concat(nearS), ss = pool[Math.random() * pool.length | 0]; spawn(ss, .12 + Math.random() * .76, ss ? .35 + Math.random() * .5 : .15 + Math.random() * .7, false); } next = 4.5 + Math.random() * 2.5; }
      for (i = drones.length - 1; i >= 0; i--) {
        var d = drones[i]; d.t += dt; var p, R;
        if (d.t < d.T) {
          var kk = d.t / d.T; kk *= kk; var w = S(d.s, d.a, d.b, -.04);
          p = P3(d.from[0] + (w[0] - d.from[0]) * kk, d.from[1] + (w[1] - d.from[1]) * kk, d.from[2] + (w[2] - d.from[2]) * kk);
          if (d.user) { /* прицел */
            var tp = SP(d.s, d.a, d.b, 0), prr = 11 + 3 * Math.sin(t * 14);
            g.strokeStyle = '#C9F55B'; g.lineWidth = 1.6; g.beginPath(); g.arc(tp[0], tp[1], prr, 0, 7); g.stroke();
            line2([tp[0] - prr - 6, tp[1]], [tp[0] - prr + 3, tp[1]]); line2([tp[0] + prr - 3, tp[1]], [tp[0] + prr + 6, tp[1]]);
            line2([tp[0], tp[1] - prr - 6], [tp[0], tp[1] - prr + 3]); line2([tp[0], tp[1] + prr - 3], [tp[0], tp[1] + prr + 6]);
          }
          d.trail.push([p[0], p[1]]); if (d.trail.length > 16) d.trail.shift();
          for (j = 1; j < d.trail.length; j++) { g.strokeStyle = 'rgba(255,77,109,' + (j / d.trail.length) * .7 + ')'; g.lineWidth = 1 + j / d.trail.length * 2; line2(d.trail[j - 1], d.trail[j]); }
          R = p[3] * (d.user ? .11 : .07);
          drawDrone(p, R, 1, t * 40, Math.sin(t * 9) * .12, false);
        } else {
          if (!d.hit) impact(d);
          var rel = d.t - d.T; if (rel > 2.7) { drones.splice(i, 1); continue; }
          p = SP(d.s, d.a, d.b, -.03); R = p[3] * (d.user ? .11 : .07);
          drawDrone(p, R, rel > 2.1 ? 1 - (rel - 2.1) / .6 : 1, 0, d.tilt * (1 - Math.exp(-rel * 7)), true);
          if (rel < 1.7) {
            var bs = R * 1.5 + 6 * Math.exp(-rel * 6), bl = bs * .35; g.strokeStyle = 'rgba(201,245,91,' + Math.min(1, (1.7 - rel) * 2) + ')'; g.lineWidth = 1.8;
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s3) { var cx3 = p[0] + s3[0] * bs, cy3 = p[1] + s3[1] * bs * .62; g.beginPath(); g.moveTo(cx3 - s3[0] * bl, cy3); g.lineTo(cx3, cy3); g.lineTo(cx3, cy3 - s3[1] * bl); g.stroke(); });
          }
        }
      }
      /* искры */
      for (i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i]; s.a += dt; if (s.a > s.life) { sparks.splice(i, 1); continue; }
        s.vy += 420 * dt; var nx2 = s.x + s.vx * dt, ny2 = s.y + s.vy * dt;
        g.strokeStyle = (i % 3 ? 'rgba(201,245,91,' : 'rgba(255,255,255,') + (1 - s.a / s.life) + ')'; g.lineWidth = 1.6;
        line2([s.x, s.y], [nx2 + s.vx * .012, ny2 + s.vy * .012]); s.x = nx2; s.y = ny2;
      }
      /* подпись */
      for (i = labels.length - 1; i >= 0; i--) {
        var l = labels[i]; l.t += dtReal; if (l.t > 2.3) { labels.splice(i, 1); continue; }
        var lp = SP(l.s, l.a, l.b, 0), la = Math.min(1, l.t * 6) * Math.min(1, (2.3 - l.t) * 2.5), fs = 14 / Math.max(1, zoom * .75);
        g.font = '600 ' + fs + 'px Segoe UI, Roboto, Arial, sans-serif'; g.textAlign = 'center';
        var tw = g.measureText('Дрон остановлен').width + fs * 1.4, ly = lp[1] - lp[3] * .11 * 1.4 - 12 / zoom - l.t * 5;
        g.fillStyle = 'rgba(201,245,91,' + la + ')'; g.beginPath();
        if (g.roundRect) g.roundRect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75, fs); else g.rect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75);
        g.fill(); g.fillStyle = 'rgba(11,11,15,' + la + ')'; g.fillText('Дрон остановлен', lp[0], ly);
      }
    }

    size(); setCam(); addEventListener('resize', function () { size(); if (calm) frame(0); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { F = 0; });
    if (calm) { frame(0); if (hint) hint.hidden = true; return; }

    var wb = $('#weak');
    if (wb) wb.addEventListener('click', function () { weak = !weak; wb.classList.toggle('on', weak); wb.setAttribute('aria-pressed', weak); wb.textContent = weak ? 'Скрыть слабые места' : 'Слабые места'; idle = 0; });
    /* вращение: тянем мышью или пальцем */
    var drag = null, moved = false;
    c.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, yaw: yawT, pit: pitT }; moved = false; });
    addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) { moved = true; c.classList.add('grab'); }
      if (moved) { yawT = drag.yaw + dx * .007; pitT = Math.max(.24, Math.min(.95, drag.pit + dy * .004)); idle = 0; }
    });
    function up() { drag = null; c.classList.remove('grab'); }
    addEventListener('pointerup', up); addEventListener('pointercancel', up);

    /* клик: бьём в ближайшую к курсору точку видимой сетки, ближняя поверхность важнее */
    c.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left - ox) / zoom + fx, y = (e.clientY - r.top - oy) / zoom + fy;
      var best = null, near = null;
      for (var s = 0; s < 5; s++) {
        if (s && isFar(s)) continue; var n = CNT[s][0], m = CNT[s][1], A = G[s] && G[s][0]; if (!A) continue;
        for (var i = 0; i <= n; i++) for (var j = 0; j <= m; j++) {
          var p = A[i][j], dd = Math.hypot(p[0] - x, p[1] - y), o = { s: s, a: i / n, b: j / m, d: dd, z: p[2] };
          if (dd < 20 && (!near || o.z < near.z)) near = o;
          if (!best || dd < best.d) best = o;
        }
      }
      var hitp = near || (best && best.d < 70 ? best : null); if (!hitp) return;
      if (drones.filter(function (d) { return d.user && !d.hit; }).length >= 2) return;
      idle = 0;
      spawn(hitp.s, Math.max(.04, Math.min(.96, hitp.a)), hitp.s ? Math.max(.12, Math.min(.92, hitp.b)) : Math.max(.06, Math.min(.94, hitp.b)), true);
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (l) { on = l[0].isIntersecting; }).observe(c);
    var last = 0;
    requestAnimationFrame(function loop(ts) {
      var raw = (ts - last) / 1000 || 0, dt = Math.min(.05, raw); last = ts;
      if (on && !document.hidden) {
        frame(dt);
        if (!lowQ && raw < .5) { slow = raw > .03 ? slow + 1 : Math.max(0, slow - 1); if (slow > 45) { lowQ = true; DPR = Math.min(DPR, 1.25); size(); } }
      }
      requestAnimationFrame(loop);
    });
  })();
})();
