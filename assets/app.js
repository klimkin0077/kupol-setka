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
    var PX = 2, PZ = 1.25, MH = 1.15, NMX = 4, CAM = 7.5, OFF = -.035, OUT = .55, HF = lite ? 2 : 3;
    var NU = lite ? 32 : 40, NV = lite ? 16 : 24, NB = lite ? 6 : 8;
    var F = 0, CX = 0, CY = 0, yaw = .62, pit = .5, yawT = .62, pitT = .5, idle = 9;
    var cy = 1, sy = 0, cp = 1, sp = 0;
    var t = 0, on = true, hits = 0, next = 3;
    var rip = [], drones = [], sparks = [], labels = [], G = [], frags = [], smoke = [], flash = [];
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
      var wide = W >= 1000, x0 = W * (narrow ? .02 : wide ? .33 : .1), x1 = W * .99, y0 = narrow ? nh + 4 : wide ? 46 : nh * .85, y1 = H - (narrow ? 236 : W < 1500 ? 118 : 78);
      if (y1 - y0 < 160) y0 = y1 - 160;
      var a = 1e9, b = -1e9, cc = 1e9, d = -1e9;
      [-1, 1].forEach(function (i) { [-1, 1].forEach(function (j) { [0, MH].forEach(function (y) {
        var v = vw(i * (PX + .62), y, j * (PZ + .62)), s = 1 / (v[2] + CAM), x = v[0] * s, yy = -v[1] * s;
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
      var y = .07 + b * (edgeH(s, a) - .07), o = OUT * (1 - b), kx = 1 + o / PX, kz = 1 + o / PZ;
      if (s === 1) return [(a - .5) * 2 * PX * kx, y, PZ + o - d];
      if (s === 2) return [(a - .5) * 2 * PX * kx, y, -PZ - o + d];
      if (s === 3) return [PX + o - d, y, (a - .5) * 2 * PZ * kz];
      return [-PX - o + d, y, (a - .5) * 2 * PZ * kz];
    }
    function SP(s, a, b, off) { var w = S(s, a, b, off); return P3(w[0], w[1], w[2]); }
    function grid(s) {
      var n = CNT[s][0], m = CNT[s][1], A = [], Hx = [], i, j;
      for (i = 0; i <= n; i++) { A[i] = []; for (j = 0; j <= m; j++) A[i][j] = SP(s, i / n, j / m, 0); }
      var n2 = n * HF, m2 = m * HF; for (j = 0; j <= m2; j++) { Hx[j] = []; for (i = 0; i <= n2; i++) Hx[j][i] = SP(s, i / n2, Math.min(1, (j + (((i % 2 === 1) !== (j % 2 === 1)) ? .36 : 0)) / (m2 + .36)), OFF); }
      G[s] = [A, Hx];
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
      /* глубина: дальний край тусклее; zf держит толщину линий при приближении камеры */
      var pa = A[n >> 1][0], pb = A[n >> 1][m], gf = pa[2] > pb[2] ? [pa, pb] : [pb, pa], zf = 1 / Math.pow(zoom, .75);
      function dgrad(rgb, al, lo) { var gr = g.createLinearGradient(gf[0][0], gf[0][1], gf[1][0], gf[1][1]); gr.addColorStop(0, 'rgba(' + rgb + ',' + al * lo + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',' + al + ')'); return gr; }
      /* «Барьер»: крупная овальная ячейка — две встречные волны */
      var prev, pt, y2, fam;
      g.beginPath();
      for (fam = 0; fam < 2; fam++) for (j = 0; j <= m; j += 2) {
        prev = null;
        for (i = 0; i <= n; i++) {
          y2 = j + (((i % 2 === 0) === (fam === 0)) ? 1 : -1); y2 = y2 < 0 ? 0 : y2 > m ? m : y2; pt = A[i][y2];
          if (!prev) g.moveTo(pt[0], pt[1]); else g.quadraticCurveTo(prev[0], prev[1], (prev[0] + pt[0]) / 2, (prev[1] + pt[1]) / 2);
          prev = pt;
        }
        g.lineTo(prev[0], prev[1]);
      }
      g.strokeStyle = dgrad('240,236,255', .58 * k, .4); g.lineWidth = 1.05 * zf; g.stroke();
      /* «Манье»: мелкая шестигранная ячейка двойного кручения, лежит поверх «Барьера» */
      var mm = M.length - 1, nn = M[0].length - 1;
      g.beginPath();
      for (j = 0; j <= mm; j++) { g.moveTo(M[j][0][0], M[j][0][1]); for (i = 1; i <= nn; i++) g.lineTo(M[j][i][0], M[j][i][1]); }
      var mk = k * Math.min(1, .5 + (zoom - 1) * .6); g.strokeStyle = dgrad('201,245,91', .85 * mk, .55); g.lineWidth = .8 * zf; g.stroke();
      g.beginPath();
      for (j = 0; j < mm; j++) for (i = 0; i <= nn; i++) if ((i % 2 === 1) !== (j % 2 === 1)) { g.moveTo(M[j][i][0], M[j][i][1]); g.lineTo(M[j + 1][i][0], M[j + 1][i][1]); }
      g.strokeStyle = dgrad('226,255,150', mk, .55); g.lineWidth = 1.3 * zf; g.stroke();
      /* тросы */
      function col(i2) { var a2 = []; for (var q = 0; q <= m; q++) a2.push(A[i2][q]); return a2; }
      function row(j2) { var a2 = []; for (var q = 0; q <= n; q++) a2.push(A[q][j2]); return a2; }
      var C30 = '77,216,255', C19 = '255,122,217';
      if (s === 0) {
        for (i = 1; i < NMX * 2; i += 2) tube(col(i * n / (NMX * 2)), 1.5, C19, far);
        tube(row(m / 4), 1.5, C19, far); tube(row(3 * m / 4), 1.5, C19, far);
        for (i = 0; i <= NMX; i++) tube(col(i * n / NMX), 2.6, C30, far, 1);
        tube(row(0), 2.6, C30, far, 1); tube(row(m), 2.6, C30, far, 1); tube(row(m / 2), 2.6, C30, far, 1);
      } else {
        var ns = s < 3 ? NMX * 2 : 4; for (i = 1; i < ns; i += 2) tube(col(Math.round(i * n / ns)), 1.5, C19, far);
        tube(row(m / 2), 1.4, C19, far); tube(row(0), 1.5, C19, far); tube(row(m), 2.6, C30, far, 1);
      }
    }
    /* стальной канат: тёмный контур, цвет, тонкий блик; Ø30 с лёгким свечением */
    function tube(pts, w, rgb, far, glow) {
      var zf = 1 / Math.pow(zoom, .75), ww = w * zf * (far ? .8 : 1);
      function path() { g.beginPath(); for (var q = 0; q < pts.length; q++) q ? g.lineTo(pts[q][0], pts[q][1]) : g.moveTo(pts[q][0], pts[q][1]); }
      path(); g.strokeStyle = 'rgba(6,8,20,' + (far ? .3 : .7) + ')'; g.lineWidth = ww + 1.1 * zf; g.stroke();
      if (glow && !far && !lowQ) { g.shadowColor = 'rgba(' + rgb + ',.8)'; g.shadowBlur = 6; }
      path(); g.strokeStyle = 'rgba(' + rgb + ',' + (far ? .5 : 1) + ')'; g.lineWidth = ww; g.stroke(); g.shadowBlur = 0; g.shadowColor = 'transparent';
      if (!far) { g.save(); g.translate(-ww * .2, -ww * .22); path(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(.3, ww * .26); g.stroke(); g.restore(); }
    }

    /* ---------- мачты ---------- */
    var MASTS = [];
    for (var mi = 0; mi <= NMX; mi++) { MASTS.push([(mi / NMX - .5) * 2 * PX, PZ, 0, 1]); MASTS.push([(mi / NMX - .5) * 2 * PX, -PZ, 0, -1]); }
    MASTS.push([PX, 0, 1, 0]); MASTS.push([-PX, 0, -1, 0]);
    function drawMast(m) {
      var X = m[0], Z = m[1], w = .045, top = MH, n = 9, q, L = [[-w, -w], [w, -w], [w, w], [-w, w]];
      var a = P3(X, top, Z);
      drawBuilding(m.f);
      m.g.forEach(function (e2) {
        var e = P3(e2[0], .085, e2[1]), zf = 1 / Math.pow(zoom, .75); tube([a, e], 2.6, '77,216,255', false);
        var t0 = [e[0] + (a[0] - e[0]) * .08, e[1] + (a[1] - e[1]) * .08], t1 = [e[0] + (a[0] - e[0]) * .19, e[1] + (a[1] - e[1]) * .19];
        g.strokeStyle = 'rgba(10,12,24,.8)'; g.lineWidth = 5 * zf; line2(t0, t1); g.strokeStyle = '#D9DEEA'; g.lineWidth = 3.2 * zf; line2(t0, t1);
      });
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
    var FACES = [], TL = FACES;
    function face(pts, col, decor, nrm) {
      var a = pts[0], b = pts[1], d = pts[2], ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      var n = nrm || [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], l = Math.hypot(n[0], n[1], n[2]) || 1;
      TL.push({ p: pts, n: [n[0] / l, n[1] / l, n[2] / l], c: col, d: decor || {} });
    }
    function boxF(x0, x1, y1, z0, z1, wc, rc, dec) {
      dec = dec || {}; var yb = dec.y0 || 0;
      face([[x0, yb, z1], [x1, yb, z1], [x1, y1, z1], [x0, y1, z1]], wc, dec.front);
      face([[x1, yb, z0], [x0, yb, z0], [x0, y1, z0], [x1, y1, z0]], wc, dec.back);
      face([[x1, yb, z1], [x1, yb, z0], [x1, y1, z0], [x1, y1, z1]], wc, dec.right);
      face([[x0, yb, z0], [x0, yb, z1], [x0, y1, z1], [x0, y1, z0]], wc, dec.left);
      if (!dec.noTop) face([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], rc, dec.top);
    }
    function vlines(x0, x1, y0, y1, z, step) { var a = []; for (var x = x0 + step; x < x1 - .01; x += step) a.push([[x, y0, z], [x, y1, z]]); return a; }
    function zlines(z0, z1, y0, y1, x, step) { var a = []; for (var z = z0 + step; z < z1 - .01; z += step) a.push([[x, y0, z], [x, y1, z]]); return a; }
    (function build() {
      var WALL = [190, 194, 206], BASE = [98, 104, 122], ROOF = [136, 142, 158], GLASS = [104, 160, 226], GATE = [80, 88, 110], CONC = [164, 164, 172], CONCT = [188, 188, 196], DARK = [44, 48, 66];
      function rz(xa, xb, ya, yb, z) { return [[xa, ya, z], [xb, ya, z], [xb, yb, z], [xa, yb, z]]; }
      function rx(za, zb, ya, yb, x) { return [[x, ya, za], [x, ya, zb], [x, yb, zb], [x, yb, za]]; }
      function winsZ(xa, xb, n, ya, yb, z, w) { var a = [], st = (xb - xa) / n; for (var i = 0; i < n; i++) { var c0 = xa + st * (i + .5); a.push({ p: rz(c0 - w / 2, c0 + w / 2, ya, yb, z), c: GLASS, a: .92, e: 1, s: 1 }); } return a; }
      function winsX(za, zb, n, ya, yb, x, w) { var a = [], st = (zb - za) / n; for (var i = 0; i < n; i++) { var c0 = za + st * (i + .5); a.push({ p: rx(c0 - w / 2, c0 + w / 2, ya, yb, x), c: GLASS, a: .92, e: 1, s: 1 }); } return a; }
      /* ---- цех: сэндвич-панели, цоколь, ленточные окна, секционные ворота, зенитные фонари ---- */
      var x0 = -1.4, x1 = .9, z0 = -.62, z1 = .62, h = .5, gb = .13;
      function hallWall(z, gates) {
        var polys = [{ p: rz(x0, x1, 0, .05, z), c: BASE, a: 1 }].concat(winsZ(x0 + .1, x1 - .1, 10, .31, .43, z, .15)), lines = vlines(x0, x1, .05, h, z, .115);
        if (gates) [-1.12, -.42, .28].forEach(function (gx) {
          polys.push({ p: rz(gx, gx + .36, 0, .25, z), c: GATE, a: 1, s: 1 });
          for (var q = 1; q < 5; q++) lines.push([[gx, .05 * q, z], [gx + .36, .05 * q, z]]);
          polys.push({ p: rz(gx + .4, gx + .47, 0, .14, z), c: DARK, a: 1, s: 1 });
        });
        return { lines: lines, polys: polys };
      }
      function sideWall(x) { return { lines: zlines(z0, z1, .05, h, x, .115), polys: [{ p: rx(z0, z1, 0, .05, x), c: BASE, a: 1 }].concat(winsX(z0 + .1, z1 - .1, 5, .31, .43, x, .15)) }; }
      boxF(x0, x1, h, z0, z1, WALL, ROOF, { noTop: true, front: hallWall(z1, true), back: hallWall(z0, false), right: sideWall(x1), left: sideWall(x0) });
      function slope(zs, sgn) {
        var ribs = [], sky = [], x, yy = function (z) { return h + gb * (1 - Math.abs(z) / z1); };
        for (x = x0 + .115; x < x1 - .05; x += .115) ribs.push([[x, h, zs], [x, h + gb, 0]]);
        for (x = x0 + .22; x < x1 - .3; x += .42) sky.push({ p: [[x, yy(.46 * sgn), .46 * sgn], [x + .2, yy(.46 * sgn), .46 * sgn], [x + .2, yy(.2 * sgn), .2 * sgn], [x, yy(.2 * sgn), .2 * sgn]], c: GLASS, a: .8, e: 1, s: 1 });
        return { lines: ribs, polys: sky };
      }
      face([[x0, h, z1], [x1, h, z1], [x1, h + gb, 0], [x0, h + gb, 0]], ROOF, slope(z1, 1));
      face([[x1, h, z0], [x0, h, z0], [x0, h + gb, 0], [x1, h + gb, 0]], ROOF, slope(z0, -1));
      face([[x1, h, z1], [x1, h, z0], [x1, h + gb, 0]], WALL); face([[x0, h, z0], [x0, h, z1], [x0, h + gb, 0]], WALL);
      /* ---- АБК: три этажа, окна по сетке, вход с козырьком, вентблоки на кровле ---- */
      var ax0 = .9, ax1 = 1.52, az0 = -.42, az1 = .42, ah = .48, AB = [204, 206, 214], fl, rows = [];
      function abkZ(z, door) { var p = [{ p: rz(ax0, ax1, 0, .05, z), c: BASE, a: 1 }]; for (fl = 0; fl < 3; fl++) p = p.concat(winsZ(ax0 + .04, ax1 - .04, 4, .09 + fl * .14, .18 + fl * .14, z, .09)); if (door) { p.push({ p: rz(1.15, 1.27, 0, .12, z), c: DARK, a: 1, s: 1 }); } return { polys: p, lines: [[[ax0, .19, z], [ax1, .19, z]], [[ax0, .33, z], [ax1, .33, z]]] }; }
      function abkX(x) { var p = [{ p: rx(az0, az1, 0, .05, x), c: BASE, a: 1 }]; for (fl = 0; fl < 3; fl++) p = p.concat(winsX(az0 + .05, az1 - .05, 6, .09 + fl * .14, .18 + fl * .14, x, .08)); return { polys: p, lines: [[[x, .19, az0], [x, .19, az1]], [[x, .33, az0], [x, .33, az1]]] }; }
      boxF(ax0, ax1, ah, az0, az1, AB, [150, 154, 168], { front: abkZ(az1, true), back: abkZ(az0, false), right: abkX(ax1) });
      boxF(1.1, 1.32, .065, az1, az1 + .1, DARK, [120, 126, 142], { y0: .13 });
      boxF(1.0, 1.16, ah + .07, -.25, -.08, [150, 154, 166], [176, 180, 190], { y0: ah }); boxF(1.25, 1.42, ah + .06, .05, .25, [150, 154, 166], [176, 180, 190], { y0: ah });
      /* ---- трансформаторы и щитовые ---- */
      [[-1.05, -.92], [-.62, -.92]].forEach(function (c0) {
        boxF(c0[0], c0[0] + .24, .15, c0[1] - .08, c0[1] + .08, [88, 96, 118], [116, 124, 146], { front: { lines: vlines(c0[0], c0[0] + .24, .02, .15, c0[1] + .08, .03) } });
        boxF(c0[0] + .06, c0[0] + .1, .2, c0[1] - .02, c0[1] + .02, [170, 150, 140], [190, 170, 160], { y0: .15 }); boxF(c0[0] + .14, c0[0] + .18, .2, c0[1] - .02, c0[1] + .02, [170, 150, 140], [190, 170, 160], { y0: .15 });
      });
      /* ---- резервуары ---- */
      function tank(cx, cz, r, hh) {
        var n = 18, top = [], i;
        for (i = 0; i < n; i++) {
          var a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, p0 = [cx + r * Math.cos(a0), cz + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cz + r * Math.sin(a1)], am = (a0 + a1) / 2;
          face([[p1[0], 0, p1[1]], [p0[0], 0, p0[1]], [p0[0], hh, p0[1]], [p1[0], hh, p1[1]]], [214, 216, 224], { soft: 1, lines: [[[p0[0], hh * .5, p0[1]], [p1[0], hh * .5, p1[1]]], [[p0[0], hh * .96, p0[1]], [p1[0], hh * .96, p1[1]]]] }, [Math.cos(am), 0, Math.sin(am)]);
          top.push([p0[0], hh, p0[1]]);
        }
        face(top, [232, 234, 240], {}, [0, 1, 0]);
      }
      tank(1.62, .86, .22, .36); tank(1.12, .9, .19, .3);
      /* ---- фундаменты мачт и якорные блоки ФБС под оттяжки ---- */
      MASTS.forEach(function (m) {
        TL = m.f = []; m.g = [];
        var X = m[0], Z = m[1], ox2 = m[2], oz2 = m[3], dirs;
        boxF(X - .1, X + .1, .05, Z - .1, Z + .1, CONC, CONCT);
        var sx = X > 0 ? 1 : -1, sz = Z > 0 ? 1 : -1, corner = Math.abs(X) > PX - .01 && Math.abs(Z) > PZ - .01;
        if (corner) dirs = [[sx * OUT, sz * OUT], [-sx * .3, sz * OUT], [sx * OUT, -sz * .3]];
        else if (oz2) dirs = [[X * OUT / PX - .3, sz * OUT], [X * OUT / PX + .3, sz * OUT]];
        else dirs = [[sx * OUT, -.3], [sx * OUT, .3]];
        dirs.forEach(function (d) {
          var cx = X + d[0], cz = Z + d[1], lx = Math.abs(d[0]) > Math.abs(d[1]) ? .06 : .12, lz = lx === .06 ? .12 : .06;
          boxF(cx - lx, cx + lx, .085, cz - lz, cz + lz, CONC, CONCT, { front: { lines: [[[cx - lx, .042, cz + lz], [cx + lx, .042, cz + lz]]] } });
          m.g.push([cx, cz]);
        });
      });
      TL = FACES;
    })();
    function drawBuilding(LIST) {
      if (!LIST) { /* площадка и тень на земле */
        var pad = [P3(-PX + .06, 0, -PZ + .06), P3(PX - .06, 0, -PZ + .06), P3(PX - .06, 0, PZ - .06), P3(-PX + .06, 0, PZ - .06)];
        g.fillStyle = 'rgba(190,196,220,.07)'; g.beginPath(); pad.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill();
        var sh = [P3(-1.5, 0, -.72), P3(1.72, 0, -.72), P3(1.9, 0, 1.14), P3(-1.5, 0, .76)];
        g.fillStyle = 'rgba(4,2,16,.5)'; g.beginPath(); sh.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill();
      }
      var vis = [];
      (LIST || FACES).forEach(function (f) {
        var n = vw(f.n[0], f.n[1], f.n[2]), cx2 = 0, cy2 = 0, cz2 = 0, k = f.p.length;
        var v = f.p.map(function (p) { var q = vw(p[0], p[1], p[2]); cx2 += q[0]; cy2 += q[1]; cz2 += q[2]; return q; });
        cx2 /= k; cy2 /= k; cz2 /= k;
        if (n[0] * cx2 + n[1] * cy2 + n[2] * (cz2 + CAM) >= 0) return;
        vis.push({ f: f, v: v, z: cz2 });
      });
      vis.sort(function (a, b) { return b.z - a.z; });
      vis.forEach(function (o) {
        var f = o.f, sh2 = .5 + .56 * Math.max(0, f.n[0] * LX + f.n[1] * LY + f.n[2] * LZ);
        function path(v) { g.beginPath(); v.forEach(function (q, i) { var p = pr(q); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); }
        function rgb(cc, a) { return 'rgba(' + Math.min(255, cc[0] * sh2 | 0) + ',' + Math.min(255, cc[1] * sh2 | 0) + ',' + Math.min(255, cc[2] * sh2 | 0) + ',' + a + ')'; }
        path(o.v); g.fillStyle = rgb(f.c, 1); g.fill();
        g.strokeStyle = f.d.soft ? rgb(f.c, 1) : 'rgba(18,22,40,.45)'; g.lineWidth = f.d.soft ? 1 : .8; g.stroke();
        if (f.d.lines) { g.beginPath(); f.d.lines.forEach(function (l) { var a = P3(l[0][0], l[0][1], l[0][2]), b = P3(l[1][0], l[1][1], l[1][2]); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }); g.strokeStyle = 'rgba(20,24,50,.26)'; g.lineWidth = .7; g.stroke(); }
        if (f.d.polys) f.d.polys.forEach(function (pl) {
          path(pl.p.map(function (p) { return vw(p[0], p[1], p[2]); }));
          g.fillStyle = pl.e ? 'rgba(' + pl.c[0] + ',' + pl.c[1] + ',' + pl.c[2] + ',' + pl.a + ')' : rgb(pl.c, pl.a); g.fill();
          if (pl.s) { g.strokeStyle = 'rgba(16,20,38,.6)'; g.lineWidth = .7; g.stroke(); }
        });
      });
    }

    /* ---------- дрон ---------- */
    var UAV = [{ r: .17, k: 2.2 }, { r: .14, k: 1.8 }, { r: .25, k: 3 }], utype = 0;
    /* беспилотник самолётного типа: объёмная заливка, крен, диск винта, бортовые огни, тень */
    function drawUAV(p, R, al, spin, ang, dead, ty, bank, seed) {
      bank = bank || 0;
      g.save(); g.translate(p[0], p[1]); g.rotate(ang); g.scale(R, R * (.74 + bank * .5)); g.globalAlpha = al; g.lineJoin = 'round'; g.lineCap = 'round';
      var px = 1 / R, edge = 'rgba(14,16,30,.85)';
      function grad(x0, y0, x1, y1, c0, c1) { var gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
      function poly(pts, fill, shadow) {
        g.beginPath(); pts.forEach(function (q, i) { i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath();
        if (shadow && !lowQ) { g.shadowColor = 'rgba(0,0,10,.55)'; g.shadowBlur = 14; g.shadowOffsetY = R * .45 * DPR; }
        g.fillStyle = fill; g.fill(); g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
        g.strokeStyle = edge; g.lineWidth = .9 * px; g.stroke();
      }
      function seg(x0, y0, x1, y1, w, col) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      function body(nose, w, x1, tail, tw) {
        g.beginPath(); g.moveTo(nose, 0); g.bezierCurveTo(nose - .12, -w * 1.15, x1, -w * 1.1, tail, -tw); g.lineTo(tail, tw); g.bezierCurveTo(x1, w * 1.1, nose - .12, w * 1.15, nose, 0); g.closePath();
        g.fillStyle = grad(0, -w, 0, w, '#C9D0E2', '#8E97B0'); g.fill();
        g.strokeStyle = edge; g.lineWidth = .9 * px; g.stroke();
        seg(nose - .1, 0, tail + .05, 0, w * .5, 'rgba(255,255,255,.55)');
      }
      function prop(x, r) {
        if (dead) { for (var q = 0; q < 3; q++) { var a0 = .5 + q * 2.094; seg(x, 0, x + Math.cos(a0) * .03, Math.sin(a0) * r, 2 * px, '#DDE2F0'); } return; }
        g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(x, 0, .045, r, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .8 * px; g.stroke();
        var c2 = Math.cos(spin); seg(x, -c2 * r, x, c2 * r, 1.6 * px, 'rgba(255,255,255,.75)');
      }
      function light(x, y, col, on) { if (dead || !on) return; g.shadowColor = col; g.shadowBlur = 10; g.fillStyle = col; g.beginPath(); g.arc(x, y, 2.1 * px, 0, 7); g.fill(); g.shadowBlur = 0; g.shadowColor = 'transparent'; }
      var wingL = grad(0, -1.2, 0, 0, '#F6F8FD', '#B4BCD2'), wingR = grad(0, 0, 0, 1.2, '#AEB6CC', '#8891AA'), blink = Math.sin(t * 9) > 0, strobe = (t * 1.4) % 1 < .12;
      if (ty === 0) { /* самолётная схема: прямое крыло, толкающий винт, оперение на двух балках */
        poly([[.34, 0], [.27, -1], [.12, -1], [.06, 0]], wingL, 1); poly([[.34, 0], [.27, 1], [.12, 1], [.06, 0]], wingR);
        seg(.16, -.92, .13, -.5, 1.2 * px, 'rgba(20,24,44,.5)'); seg(.16, .92, .13, .5, 1.2 * px, 'rgba(20,24,44,.5)');
        seg(.12, -.28, -.66, -.28, .045, '#B9C1D6'); seg(.12, .28, -.66, .28, .045, '#B9C1D6');
        poly([[-.56, -.3], [-.7, -.3], [-.7, .3], [-.56, .3]], '#C3CADD');
        poly([[-.52, -.28], [-.76, -.4], [-.76, -.3]], '#8E97B0'); poly([[-.52, .28], [-.76, .4], [-.76, .3]], '#8E97B0');
        body(.95, .12, .1, -.2, .06);
        g.fillStyle = '#1A1D2C'; g.beginPath(); g.arc(.84, 0, .04, 0, 7); g.fill();
        prop(-.22, .26); light(.2, -1, '#FF4D6D', blink); light(.2, 1, '#5BFF9A', blink); light(-.7, 0, '#fff', strobe);
      } else if (ty === 1) { /* «утка»: переднее оперение, стреловидное крыло сзади, законцовки, толкающий винт */
        poly([[.05, 0], [-.3, -1], [-.5, -1], [-.36, 0]], wingL, 1); poly([[.05, 0], [-.3, 1], [-.5, 1], [-.36, 0]], wingR);
        seg(-.4, -.9, -.37, -.45, 1.2 * px, 'rgba(20,24,44,.5)'); seg(-.4, .9, -.37, .45, 1.2 * px, 'rgba(20,24,44,.5)');
        poly([[-.26, -1], [-.58, -1.07], [-.58, -.97]], '#7F88A2'); poly([[-.26, 1], [-.58, 1.07], [-.58, .97]], '#7F88A2');
        poly([[.8, 0], [.7, -.37], [.62, -.37], [.68, 0]], wingL); poly([[.8, 0], [.7, .37], [.62, .37], [.68, 0]], wingR);
        body(1, .095, 0, -.52, .07);
        g.fillStyle = '#1A1D2C'; g.beginPath(); g.arc(.9, 0, .032, 0, 7); g.fill();
        prop(-.56, .24); light(-.4, -1, '#FF4D6D', blink); light(-.4, 1, '#5BFF9A', blink); light(.98, 0, '#fff', strobe);
      } else { /* на базе лёгкого самолёта: высокоплан, тянущий винт, кабина, подкосы, шасси */
        g.fillStyle = '#20232F'; [-.2, .2].forEach(function (y) { g.beginPath(); g.ellipse(.3, y, .06, .03, 0, 0, 7); g.fill(); });
        poly([[-.76, 0], [-.8, -.4], [-.95, -.4], [-.97, 0]], wingL); poly([[-.76, 0], [-.8, .4], [-.95, .4], [-.97, 0]], wingR);
        body(.8, .17, .1, -1, .035);
        poly([[.46, -.1], [.62, -.085], [.62, .085], [.46, .1]], grad(.46, 0, .62, 0, '#3E6FB8', '#9CC8FF'));
        seg(.24, -.15, .2, -.62, 1.4 * px, '#9099B2'); seg(.24, .15, .2, .62, 1.4 * px, '#9099B2');
        poly([[.36, 0], [.34, -1.25], [.1, -1.25], [.08, 0]], wingL, 1); poly([[.36, 0], [.34, 1.25], [.1, 1.25], [.08, 0]], wingR);
        seg(.14, -1.15, .13, -.6, 1.2 * px, 'rgba(20,24,44,.5)'); seg(.14, 1.15, .13, .6, 1.2 * px, 'rgba(20,24,44,.5)');
        seg(-.7, 0, -.98, 0, .03, '#7F88A2');
        g.fillStyle = '#C9D0E2'; g.beginPath(); g.arc(.83, 0, .045, 0, 7); g.fill();
        prop(.86, .3); light(.22, -1.25, '#FF4D6D', blink); light(.22, 1.25, '#5BFF9A', blink); light(-.98, 0, '#fff', strobe);
      }
      if (dead) { /* нити сетки поверх: аппарат запутался */
        var sd = (seed || .3) * 17; g.strokeStyle = 'rgba(201,245,91,.85)'; g.lineWidth = 1.1 * px;
        for (var e = 0; e < 5; e++) { var a1 = sd + e * 1.3, x0 = Math.cos(a1) * 1.05, y0 = Math.sin(a1) * 1.05, a2 = a1 + 2.4 + (e % 2) * .5; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(Math.cos(a1 + 1.2) * .25, Math.sin(a1 + 1.2) * .25, Math.cos(a2) * 1.05, Math.sin(a2) * 1.05); g.stroke(); }
      }
      g.restore();
    }
    function spawn(s, a, b, user) {
      var n = NRM[s], w = S(s, a, b, 0), r1 = (Math.random() - .5) * 1.6, r2 = (Math.random() - .5) * 1.6, far = user ? 2.3 : 2.9;
      var from = s === 0 ? [w[0] + r1, w[1] + far, w[2] + r2] : [w[0] + n[0] * far + (n[0] ? 0 : r1), w[1] + .5 + Math.abs(r2) * .6, w[2] + n[2] * far + (n[2] ? 0 : r1)];
      drones.push({ s: s, a: a, b: b, t: 0, T: user ? 1.0 : 1.6, from: from, user: user, hit: false, tilt: (Math.random() - .5) * 1.1, trail: [], ty: user ? utype : (Math.random() * 3 | 0), ang: 0 });
    }
    /* удар: аппарат разваливается на части — консоли крыла, оперение, двигатель, лопасти, мелкие осколки обшивки */
    var SH = { wing: [[-1, -.17], [1, -.09], [1, .09], [-1, .2]], fus: [[-1, -.26], [-.35, -.38], [.65, -.32], [1, 0], [.65, .32], [-.35, .38], [-1, .26]], fin: [[-1, .5], [.2, -.6], [1, -.5], [.7, .5]], eng: [[-1, -.6], [.6, -.7], [1, 0], [.6, .7], [-1, .6]], blade: [[-1, -.1], [1, -.04], [1, .04], [-1, .1]] };
    function shard() { var n = 3 + (Math.random() * 3 | 0), a = [], i; for (i = 0; i < n; i++) { var an = i / n * 6.283 + Math.random() * .7, r = .45 + Math.random() * .55; a.push([Math.cos(an) * r, Math.sin(an) * r * .7]); } return a; }
    function boom(d) {
      var w = S(d.s, d.a, d.b, -.05), n0 = NRM[d.s], r0 = UAV[d.ty].r * (d.user ? 1 : .8), i;
      function add(pts, sz, c0, c1, sp, stuck) {
        var r1 = Math.random() - .5, r2 = Math.random() - .5, v = sp * (.6 + Math.random() * .8);
        frags.push({ p: pts, x: w[0], y: w[1], z: w[2], vx: n0[0] * v * .7 + r1 * 1.6 * sp, vy: (n0[1] ? v : .4 * sp) + Math.random() * .8 * sp, vz: n0[2] * v * .7 + r2 * 1.6 * sp, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 12, ph: Math.random() * 6, sz: sz, c0: c0, c1: c1, t: 0, rest: 0, st: stuck ? d : null });
      }
      add(SH.fus, r0 * .5, '#D5DBEA', '#7C859E', 0, 1);
      add(SH.wing, r0 * .55, '#F2F5FB', '#9AA3BC', 1); add(SH.wing, r0 * .5, '#E6EAF4', '#8E97B0', 1);
      if (d.ty === 2) { add(SH.wing, r0 * .36, '#F2F5FB', '#9AA3BC', 1.2); add(SH.wing, r0 * .32, '#E6EAF4', '#8E97B0', 1.2); }
      add(SH.fin, r0 * .22, '#C3CADD', '#7F88A2', 1.1); add(SH.fin, r0 * .18, '#C3CADD', '#7F88A2', 1.2);
      add(SH.eng, r0 * .13, '#4A5068', '#1E2130', .8);
      add(SH.blade, r0 * .2, '#DDE2F0', '#8891AA', 1.5); add(SH.blade, r0 * .2, '#DDE2F0', '#8891AA', 1.5);
      var cnt = (d.user ? 18 : 9) + d.ty * 5;
      for (i = 0; i < cnt; i++) add(shard(), r0 * (.035 + Math.random() * .08), i % 4 ? '#DCE1EE' : '#5A6078', i % 4 ? '#8C95AE' : '#23263A', 1.35);
      for (i = 0; i < 6; i++) smoke.push({ x: w[0] + (Math.random() - .5) * .16, y: w[1] + .03, z: w[2] + (Math.random() - .5) * .16, t: -i * .07, life: 1.5 + Math.random() * .7, r: .07 + Math.random() * .06 });
      flash.push({ s: d.s, a: d.a, b: d.b, t: 0, k: 1 + d.ty * .35 });
    }
    function impact(d) {
      d.hit = true; hits++; boom(d);
      rip.push({ s: d.s, a: d.a, b: d.b, t: 0, k: UAV[d.ty].k * (d.user ? 1 : .6), hold: 1 });
      var p = SP(d.s, d.a, d.b, 0), n = d.user ? 30 : 12;
      for (var i = 0; i < n; i++) { var an = Math.random() * 6.28, v = 60 + Math.random() * 240; sparks.push({ x: p[0], y: p[1], vx: Math.cos(an) * v, vy: Math.sin(an) * v * .6 - 60, a: 0, life: .5 + Math.random() * .5 }); }
      if (d.user) { shake = 10 + d.ty * 3; labels.push({ s: d.s, a: d.a, b: d.b, t: 0 }); }
      if (hint) { hint.classList.add('done'); hint.innerHTML = 'Остановлено беспилотников: <b>' + hits + '</b>'; }
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
        var wq = S(s1, .6, .3, 0), zw = s1 === 1 ? .62 : -.62, a = P3(wq[0], wq[1], wq[2]), b = P3(wq[0], wq[1], zw);
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
          p = P3(d.from[0] + (w[0] - d.from[0]) * kk, d.from[1] + (w[1] - d.from[1]) * kk + Math.sin(kk * Math.PI) * .22, d.from[2] + (w[2] - d.from[2]) * kk);
          if (d.user) { /* прицел */
            var tp = SP(d.s, d.a, d.b, 0), prr = 11 + 3 * Math.sin(t * 14);
            g.strokeStyle = '#C9F55B'; g.lineWidth = 1.6; g.beginPath(); g.arc(tp[0], tp[1], prr, 0, 7); g.stroke();
            line2([tp[0] - prr - 6, tp[1]], [tp[0] - prr + 3, tp[1]]); line2([tp[0] + prr - 3, tp[1]], [tp[0] + prr + 6, tp[1]]);
            line2([tp[0], tp[1] - prr - 6], [tp[0], tp[1] - prr + 3]); line2([tp[0], tp[1] + prr - 3], [tp[0], tp[1] + prr + 6]);
          }
          if (d.trail.length) { var l0 = d.trail[d.trail.length - 1]; if (Math.hypot(p[0] - l0[0], p[1] - l0[1]) > .4) d.ang = Math.atan2(p[1] - l0[1], p[0] - l0[0]); }
          d.trail.push([p[0], p[1]]); if (d.trail.length > 28) d.trail.shift();
          var tw2 = p[3] * UAV[d.ty].r * .2; for (j = 1; j < d.trail.length; j++) { var q2 = j / d.trail.length; g.strokeStyle = 'rgba(235,240,255,' + q2 * .3 + ')'; g.lineWidth = 1 + (1 - q2) * tw2; line2(d.trail[j - 1], d.trail[j]); }
          R = p[3] * UAV[d.ty].r * (d.user ? 1 : .8);
          drawUAV(p, R, 1, t * 46, d.ang, false, d.ty, Math.sin(t * 2.6 + d.tilt * 9) * .16);
        } else {
          if (!d.hit) impact(d);
          var rel = d.t - d.T; if (rel > 2.7) { drones.splice(i, 1); continue; }
          p = SP(d.s, d.a, d.b, -.05); R = p[3] * UAV[d.ty].r * (d.user ? 1 : .8);
          
          if (rel < 1.7) {
            var bs = R * 1.25 + 6 * Math.exp(-rel * 6), bl = bs * .35; g.strokeStyle = 'rgba(201,245,91,' + Math.min(1, (1.7 - rel) * 2) + ')'; g.lineWidth = 1.8;
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s3) { var cx3 = p[0] + s3[0] * bs, cy3 = p[1] + s3[1] * bs * .62; g.beginPath(); g.moveTo(cx3 - s3[0] * bl, cy3); g.lineTo(cx3, cy3); g.lineTo(cx3, cy3 - s3[1] * bl); g.stroke(); });
          }
        }
      }
      /* вспышка */
      for (i = flash.length - 1; i >= 0; i--) {
        var fl = flash[i]; fl.t += dt; if (fl.t > .34) { flash.splice(i, 1); continue; }
        var fp2 = SP(fl.s, fl.a, fl.b, -.05), fr = (12 + fl.t * 190) * fl.k * fp2[3] / (F / CAM) / Math.sqrt(zoom), fa = 1 - fl.t / .34, gr2 = g.createRadialGradient(fp2[0], fp2[1], 0, fp2[0], fp2[1], fr);
        gr2.addColorStop(0, 'rgba(255,255,255,' + fa + ')'); gr2.addColorStop(.35, 'rgba(255,176,196,' + fa * .7 + ')'); gr2.addColorStop(1, 'rgba(255,77,109,0)');
        g.fillStyle = gr2; g.beginPath(); g.arc(fp2[0], fp2[1], fr, 0, 7); g.fill();
      }
      /* дым */
      for (i = smoke.length - 1; i >= 0; i--) {
        var sm = smoke[i]; sm.t += dt; if (sm.t < 0) continue; if (sm.t > sm.life) { smoke.splice(i, 1); continue; }
        sm.y += .22 * dt; var sp2 = P3(sm.x, sm.y, sm.z), q3 = sm.t / sm.life;
        g.fillStyle = 'rgba(196,202,220,' + .2 * (1 - q3) + ')'; g.beginPath(); g.arc(sp2[0], sp2[1], (sm.r + q3 * .24) * sp2[3], 0, 7); g.fill();
      }
      /* обломки: летят по баллистике, кувыркаются, ложатся на сетку или землю; фюзеляж остаётся в сетке */
      for (i = frags.length - 1; i >= 0; i--) {
        var fg = frags[i], life = fg.st ? 3.2 : 4.8; fg.t += dt; if (fg.t > life) { frags.splice(i, 1); continue; }
        if (fg.st) { var ws = S(fg.st.s, fg.st.a, fg.st.b, -.04); fg.x = ws[0]; fg.y = ws[1]; fg.z = ws[2]; fg.rot = fg.st.ang + fg.st.tilt * .5; }
        else if (!fg.rest) {
          fg.vy -= 2.4 * dt; fg.x += fg.vx * dt; fg.y += fg.vy * dt; fg.z += fg.vz * dt; fg.rot += fg.vr * dt;
          var fu = fg.x / (2 * PX) + .5, fv = fg.z / (2 * PZ) + .5, floor = (fu > 0 && fu < 1 && fv > 0 && fv < 1) ? roofY(fu, fv) - disp(0, fu, fv) + .012 : .02;
          if (fg.y < floor) { fg.y = floor; fg.vx *= .45; fg.vz *= .45; fg.vr *= .4; if (fg.vy < -.5) fg.vy = -fg.vy * .28; else { fg.rest = 1; fg.vy = 0; } }
        }
        var pf = P3(fg.x, fg.y, fg.z), ps = fg.sz * pf[3];
        g.save(); g.translate(pf[0], pf[1]); g.rotate(fg.rot); g.scale(ps, ps * (fg.st ? .78 : .3 + .7 * Math.abs(Math.cos(fg.rot * 1.7 + fg.ph))));
        g.globalAlpha = fg.t > life - .8 ? (life - fg.t) / .8 : 1;
        g.beginPath(); for (j = 0; j < fg.p.length; j++) j ? g.lineTo(fg.p[j][0], fg.p[j][1]) : g.moveTo(fg.p[j][0], fg.p[j][1]); g.closePath();
        var gr3 = g.createLinearGradient(0, -.5, 0, .5); gr3.addColorStop(0, fg.c0); gr3.addColorStop(1, fg.c1); g.fillStyle = gr3; g.fill();
        if (ps * zoom > 3) { g.strokeStyle = 'rgba(10,12,24,.8)'; g.lineWidth = .8 / (ps * Math.sqrt(zoom)); g.stroke(); }
        if (fg.st) { g.strokeStyle = 'rgba(214,250,120,.9)'; g.lineWidth = 1 / ps; g.beginPath(); g.moveTo(-1.1, -.5); g.quadraticCurveTo(-.2, .1, .3, .6); g.moveTo(-.4, -.6); g.quadraticCurveTo(.2, 0, 1.1, .4); g.moveTo(.5, -.6); g.quadraticCurveTo(.1, .1, -.8, .55); g.stroke(); }
        g.restore();
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
        var tw = g.measureText('Беспилотник остановлен').width + fs * 1.4, ly = lp[1] - lp[3] * .11 * 1.4 - 12 / zoom - l.t * 5;
        g.fillStyle = 'rgba(201,245,91,' + la + ')'; g.beginPath();
        if (g.roundRect) g.roundRect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75, fs); else g.rect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75);
        g.fill(); g.fillStyle = 'rgba(11,11,15,' + la + ')'; g.fillText('Беспилотник остановлен', lp[0], ly);
      }
    }

    size(); setCam(); addEventListener('resize', function () { size(); if (calm) frame(0); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { F = 0; });
    if (calm) { frame(0); if (hint) hint.hidden = true; return; }

    $$('.sel button', box).forEach(function (bt) { bt.addEventListener('click', function () { utype = +bt.getAttribute('data-ty'); $$('.sel button', box).forEach(function (o) { o.classList.toggle('on', o === bt); o.setAttribute('aria-pressed', o === bt); }); idle = 0; }); });
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
        if (raw < .5) { slow = raw > .042 ? slow + 1 : Math.max(0, slow - 1); if (slow > 50) { slow = 0; if (!lowQ) lowQ = true; else if (HF > (lite ? 1 : 2)) HF--; else if (DPR > 1) { DPR = 1; size(); } } }
      }
      requestAnimationFrame(loop);
    });
  })();
})();
