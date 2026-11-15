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

  /* ---- Заявка: собираем сообщение и открываем WhatsApp ---- */
  var lead = $('#lead');
  if (lead) {
    var agree = $('#f-agree', lead), btn = $('button[type=submit]', lead);
    var sync = function () { btn.disabled = !agree.checked; };
    agree.addEventListener('change', sync); sync();
    lead.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!agree.checked) return;
      var f = lead.elements, lines = ['Здравствуйте. Нужен расчёт монтажа.'];
      [['name', 'Компания'], ['tel', 'Телефон'], ['obj', 'Объект'], ['what', 'Что нужно'], ['scope', 'Объём и сроки']].forEach(function (p) {
        var v = (f[p[0]].value || '').trim(); if (v) lines.push(p[1] + ': ' + v);
      });
      var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n'));
      if (!window.open(url, '_blank')) location.href = url;
    });
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

  /* ---- 3D-купол: сетка на мачтах над объектом. Клик по сетке — дрон падает в эту точку,
        камера приближается к удару, время замедляется ---- */
  var c = $('#dome');
  if (c && c.getContext) (function () {
    var g = c.getContext('2d'), box = $('#media'), notch = $('.notch', box), hint = $('#hint');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2), lite = innerWidth < 620;
    var NX = lite ? 22 : 32, NZ = lite ? 14 : 20, SX = 1.75, SZ = 1.05, CAM = 5.2;
    var F = 800, CX = 0, CY = 0;
    var t = 0, yaw = .55, pit = .5, mx = 0, my = 0, on = true, hits = 0, next = 2.5;
    var rip = [], drones = [], sparks = [], labels = [], pts = [];
    var zoom = 1, fx = 0, fy = 0, ox = 0, oy = 0, shake = 0;
    var MU = [0, .5, 1], MV = [0, 1];

    function size() {
      var r = c.getBoundingClientRect(); W = r.width; H = r.height;
      c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
      var nh = notch ? notch.offsetHeight : 0, narrow = W < 700;
      var top = narrow ? nh : nh * .9, avail = Math.max(180, H - top - (narrow ? 110 : 70));
      F = Math.min(W * (narrow ? 1.15 : .85), avail / .4);
      CX = W * (narrow ? .5 : .6);
      CY = top + .264 * F + Math.max(0, avail - .4 * F) / 2;
      fx = CX; fy = CY;
    }
    function hgt(u, v) {
      var su = Math.sin(u * Math.PI * 2), sv = Math.sin(v * Math.PI);
      var y = .98 - .13 * su * su - .2 * sv + .012 * Math.sin(t * 1.3 + u * 9 + v * 5);
      for (var i = 0; i < rip.length; i++) {
        var r = rip[i], d = Math.hypot((u - r.u) * SX * 2, (v - r.v) * SZ * 2);
        y -= .11 * r.k * Math.exp(-r.a * 1.5) * Math.cos(d * 9 - r.a * 9) * Math.exp(-d * 2.2);
      }
      return y;
    }
    function proj(X, Y, Z) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
      var x = X * cy - Z * sy, z = X * sy + Z * cy, y = Y * cp - z * sp; z = Y * sp + z * cp;
      var s = F / (z + CAM);
      return [CX + x * s, CY - y * s, z, s];
    }
    function P(u, v) { return proj((u - .5) * 2 * SX, hgt(u, v), (v - .5) * 2 * SZ); }
    function line(a, b) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    function quad(a, b, cc, d) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(cc[0], cc[1]); g.lineTo(d[0], d[1]); g.closePath(); }

    function boxWire(x0, x1, h, z0, z1) {
      var b = [proj(x0, 0, z0), proj(x1, 0, z0), proj(x1, 0, z1), proj(x0, 0, z1)];
      var tp = [proj(x0, h, z0), proj(x1, h, z0), proj(x1, h, z1), proj(x0, h, z1)];
      g.fillStyle = 'rgba(120,100,255,.10)'; g.strokeStyle = 'rgba(205,195,255,.42)'; g.lineWidth = 1;
      for (var i = 0; i < 4; i++) { var j = (i + 1) % 4; quad(b[i], b[j], tp[j], tp[i]); g.fill(); g.stroke(); }
      g.fillStyle = 'rgba(150,130,255,.16)'; quad(tp[0], tp[1], tp[2], tp[3]); g.fill(); g.stroke();
    }

    function drawDrone(p, R, al, spin, tilt, dead) {
      g.save(); g.translate(p[0], p[1]); g.rotate(tilt); g.globalAlpha = al; g.lineCap = 'round';
      for (var i = 0; i < 4; i++) {
        var an = Math.PI / 4 + i * Math.PI / 2, ex = Math.cos(an) * R, ey = Math.sin(an) * R * .5;
        g.strokeStyle = '#E9E6FF'; g.lineWidth = Math.max(1.4, R * .1);
        g.beginPath(); g.moveTo(0, 0); g.lineTo(ex, ey); g.stroke();
        var rx = R * .46, ry = R * .22;
        g.fillStyle = dead ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.13)'; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, 7); g.fill(); g.stroke();
        var sp = dead ? i : spin + i;
        for (var b = 0; b < 2; b++) {
          var bx = Math.cos(sp + b * 1.57) * rx, by = Math.sin(sp + b * 1.57) * ry;
          g.strokeStyle = 'rgba(255,255,255,' + (dead ? .8 : .45) + ')'; g.lineWidth = Math.max(1, R * .05);
          g.beginPath(); g.moveTo(ex - bx, ey - by); g.lineTo(ex + bx, ey + by); g.stroke();
        }
      }
      g.fillStyle = '#15121F'; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.2, R * .07);
      g.beginPath(); g.ellipse(0, 0, R * .3, R * .19, 0, 0, 7); g.fill(); g.stroke();
      g.shadowColor = '#FF4D6D'; g.shadowBlur = dead ? 4 : 14; g.fillStyle = dead ? '#8a3344' : '#FF4D6D';
      g.beginPath(); g.arc(0, 0, Math.max(1.6, R * .09), 0, 7); g.fill();
      g.restore();
    }

    function spawn(u, v, user) {
      var an = Math.random() * 6.28;
      drones.push({ u: u, v: v, a: 0, T: user ? .95 : 1.5, h: user ? 1.9 : 1.5, sx: Math.cos(an) * (user ? 1.2 : 2.4), sz: Math.sin(an) * (user ? .8 : 1.6),
        user: user, hit: false, tilt: (Math.random() - .5) * 1.1, trail: [] });
    }
    function impact(d) {
      d.hit = true; hits++;
      rip.push({ u: d.u, v: d.v, a: 0, k: d.user ? 2.3 : 1 });
      var p = P(d.u, d.v), n = d.user ? 30 : 10;
      for (var i = 0; i < n; i++) { var an = Math.random() * 6.28, sp = 60 + Math.random() * 240; sparks.push({ x: p[0], y: p[1], vx: Math.cos(an) * sp, vy: Math.sin(an) * sp * .6 - 60, a: 0, life: .5 + Math.random() * .5 }); }
      if (d.user) { shake = 9; labels.push({ u: d.u, v: d.v, a: 0 }); }
      if (hint) { hint.classList.add('done'); hint.innerHTML = 'Остановлено дронов: <b>' + hits + '</b>'; }
    }

    function frame(dtReal) {
      var ts = 1, focus = null, i, j;
      drones.forEach(function (d) { if (!d.user) return; var rel = d.a - d.T; if (rel > -.22 && rel < .5) ts = .28; if (rel < 1.4) focus = d; });
      var dt = dtReal * ts; t += dt;
      yaw += ((.55 + .32 * Math.sin(t * .22) + mx * .7) - yaw) * .06;
      pit += ((.5 + my * .22) - pit) * .06;
      for (i = rip.length - 1; i >= 0; i--) { rip[i].a += dt; if (rip[i].a > 3.5) rip.splice(i, 1); }

      /* камера */
      var zt = 1, tx = CX, ty = CY;
      if (focus) { var fp = P(focus.u, focus.v); zt = lite ? 1.7 : 2.1; tx = fp[0]; ty = fp[1]; }
      var k = Math.min(1, dtReal * 3.2);
      zoom += (zt - zoom) * k; fx += (tx - fx) * k; fy += (ty - fy) * k;
      shake *= Math.pow(.01, dtReal);
      ox = fx + (W * .56 - fx) * (zoom - 1) * .5; oy = fy + (H * .58 - fy) * (zoom - 1) * .5;
      g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
      g.translate(ox + (Math.random() - .5) * shake, oy + (Math.random() - .5) * shake); g.scale(zoom, zoom); g.translate(-fx, -fy);
      g.lineCap = 'round'; g.lineJoin = 'round';

      /* земля */
      g.lineWidth = 1; g.strokeStyle = 'rgba(160,140,255,.11)';
      for (var q = -5; q <= 5; q++) { line(proj(q * .5, 0, -2), proj(q * .5, 0, 2)); line(proj(-2.5, 0, q * .4), proj(2.5, 0, q * .4)); }
      /* объект под защитой */
      boxWire(-1.0, .15, .44, -.48, .48); boxWire(.45, 1.1, .26, -.3, .3);

      /* мачты и оттяжки */
      MU.forEach(function (u) { MV.forEach(function (v) {
        var X = (u - .5) * 2 * SX, Z = (v - .5) * 2 * SZ, top = hgt(u, v), a = proj(X, top, Z), w = .04;
        g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1; line(a, proj(X + (u - .5) * .9, 0, Z + (v - .5) * 1.1));
        g.strokeStyle = 'rgba(240,236,255,.95)'; g.lineWidth = 1.6;
        line(proj(X - w, 0, Z), proj(X - w, top, Z)); line(proj(X + w, 0, Z), proj(X + w, top, Z));
        g.lineWidth = .9; g.strokeStyle = 'rgba(235,230,255,.6)';
        for (var m = 0; m < 10; m++) { var s1 = m % 2 ? 1 : -1; line(proj(X - w * s1, top * m / 10, Z), proj(X + w * s1, top * (m + 1) / 10, Z)); }
        g.fillStyle = '#C9F55B'; g.shadowColor = '#C9F55B'; g.shadowBlur = 10; g.beginPath(); g.arc(a[0], a[1], 3.6, 0, 7); g.fill(); g.shadowBlur = 0;
      }); });

      /* полотно: заливка ячеек даёт объём, сверху нити */
      for (i = 0; i <= NX; i++) { pts[i] = pts[i] || []; for (j = 0; j <= NZ; j++) pts[i][j] = P(i / NX, j / NZ); }
      for (i = 0; i < NX; i++) for (j = 0; j < NZ; j++) {
        var a0 = pts[i][j], b0 = pts[i + 1][j], c0 = pts[i + 1][j + 1], d0 = pts[i][j + 1];
        var near = Math.max(.15, Math.min(1, 1.15 - a0[2] * .42));
        var slope = Math.max(0, Math.min(1, .5 + ((b0[1] - a0[1]) - (b0[0] - a0[0]) * .12) * .05));
        quad(a0, b0, c0, d0);
        g.fillStyle = 'rgba(130,110,255,' + (.05 + slope * .12) * near + ')'; g.fill();
        g.strokeStyle = 'rgba(205,195,255,' + (.6 * near) + ')'; g.lineWidth = .8; g.stroke();
      }
      /* несущие тросы */
      g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2.2; g.shadowColor = 'rgba(160,140,255,.9)'; g.shadowBlur = 8;
      var half = Math.round(NX / 2);
      [0, half, NX].forEach(function (ii) { g.beginPath(); for (var jj = 0; jj <= NZ; jj++) { var pp = pts[ii][jj]; jj ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1]); } g.stroke(); });
      [0, NZ].forEach(function (jj) { g.beginPath(); for (var ii = 0; ii <= NX; ii++) { var pp = pts[ii][jj]; ii ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1]); } g.stroke(); });
      g.shadowBlur = 0;

      /* волна от удара */
      rip.forEach(function (r) {
        if (r.a > 1.3) return; var p = P(r.u, r.v), k2 = r.a / 1.3, rr = 8 + k2 * 80 * (r.k > 1 ? 1.25 : 1);
        g.strokeStyle = 'rgba(201,245,91,' + (1 - k2) + ')'; g.lineWidth = 2.2;
        g.beginPath(); g.ellipse(p[0], p[1], rr, rr * .42, 0, 0, 7); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,' + (1 - k2) * .5 + ')'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(p[0], p[1], rr * .55, rr * .23, 0, 0, 7); g.stroke();
      });

      /* дроны */
      next -= dt;
      if (next <= 0) { if (!drones.length) spawn(.14 + Math.random() * .72, .2 + Math.random() * .6, false); next = 4 + Math.random() * 2.5; }
      for (i = drones.length - 1; i >= 0; i--) {
        var d = drones[i]; d.a += dt;
        var X0 = (d.u - .5) * 2 * SX, Z0 = (d.v - .5) * 2 * SZ, Y0 = hgt(d.u, d.v), p, R, al = 1;
        if (d.a < d.T) {
          var kk = d.a / d.T; kk *= kk;
          p = proj(X0 + d.sx * (1 - kk), Y0 + d.h * (1 - kk) + .05, Z0 + d.sz * (1 - kk));
          if (d.user) { /* прицел в точке удара */
            var tp = P(d.u, d.v), pr = 11 + 3 * Math.sin(t * 14);
            g.strokeStyle = '#C9F55B'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(tp[0], tp[1], pr, pr * .45, 0, 0, 7); g.stroke();
            line([tp[0] - pr - 6, tp[1]], [tp[0] - pr + 3, tp[1]]); line([tp[0] + pr - 3, tp[1]], [tp[0] + pr + 6, tp[1]]);
          }
          d.trail.push([p[0], p[1]]); if (d.trail.length > 16) d.trail.shift();
          for (j = 1; j < d.trail.length; j++) { g.strokeStyle = 'rgba(255,77,109,' + (j / d.trail.length) * .7 + ')'; g.lineWidth = 1 + j / d.trail.length * 2; line(d.trail[j - 1], d.trail[j]); }
          R = p[3] * (d.user ? .12 : .06);
          drawDrone(p, R, 1, t * 40, Math.sin(t * 9) * .12, false);
        } else {
          if (!d.hit) impact(d);
          var rel = d.a - d.T; if (rel > 2.6) { drones.splice(i, 1); continue; }
          al = rel > 2 ? 1 - (rel - 2) / .6 : 1;
          p = proj(X0, Y0 + .04, Z0); R = p[3] * (d.user ? .12 : .06);
          drawDrone(p, R, al, 0, d.tilt * (1 - Math.exp(-rel * 7)), true);
          if (rel < 1.7) { /* рамка захвата */
            var bs = R * 1.5 + 6 * Math.exp(-rel * 6), bl = bs * .35; g.strokeStyle = 'rgba(201,245,91,' + Math.min(1, (1.7 - rel) * 2) + ')'; g.lineWidth = 1.8;
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { var cx = p[0] + s[0] * bs, cy = p[1] + s[1] * bs * .62; g.beginPath(); g.moveTo(cx - s[0] * bl, cy); g.lineTo(cx, cy); g.lineTo(cx, cy - s[1] * bl); g.stroke(); });
          }
        }
      }
      /* искры */
      for (i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i]; s.a += dt; if (s.a > s.life) { sparks.splice(i, 1); continue; }
        s.vy += 420 * dt; var nx2 = s.x + s.vx * dt, ny2 = s.y + s.vy * dt, sa = 1 - s.a / s.life;
        g.strokeStyle = (i % 3 ? 'rgba(201,245,91,' : 'rgba(255,255,255,') + sa + ')'; g.lineWidth = 1.6;
        line([s.x, s.y], [nx2 + s.vx * .012, ny2 + s.vy * .012]); s.x = nx2; s.y = ny2;
      }
      /* подпись */
      for (i = labels.length - 1; i >= 0; i--) {
        var l = labels[i]; l.a += dtReal; if (l.a > 2.3) { labels.splice(i, 1); continue; }
        var lp = P(l.u, l.v), la = Math.min(1, l.a * 6) * Math.min(1, (2.3 - l.a) * 2.5), fs = 14 / Math.max(1, zoom * .75);
        g.font = '600 ' + fs + 'px Onest, Segoe UI, Arial, sans-serif'; g.textAlign = 'center';
        var tw = g.measureText('Дрон остановлен').width + fs * 1.4, ly = lp[1] - lp[3] * .12 * 1.35 - 12 / zoom - l.a * 5;
        g.fillStyle = 'rgba(201,245,91,' + la + ')'; g.beginPath();
        if (g.roundRect) g.roundRect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75, fs); else g.rect(lp[0] - tw / 2, ly - fs * 1.15, tw, fs * 1.75);
        g.fill(); g.fillStyle = 'rgba(11,11,15,' + la + ')'; g.fillText('Дрон остановлен', lp[0], ly);
      }
    }

    size(); addEventListener('resize', function () { size(); if (calm) frame(0); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    if (calm) { t = 2; frame(0); if (hint) hint.hidden = true; return; }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; });
    box.addEventListener('pointerleave', function () { mx = 0; my = 0; });
    /* клик по сетке: дрон падает в ближайший узел */
    c.addEventListener('click', function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left - ox) / zoom + fx, y = (e.clientY - r.top - oy) / zoom + fy;
      var best = 1e9, bu = .5, bv = .5;
      for (var i = 0; i <= NX; i++) for (var j = 0; j <= NZ; j++) { var p = pts[i] && pts[i][j]; if (!p) continue; var dd = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (dd < best) { best = dd; bu = i / NX; bv = j / NZ; } }
      if (best > 110 * 110) return;
      if (drones.filter(function (d) { return d.user && !d.hit; }).length >= 2) return;
      spawn(Math.max(.04, Math.min(.96, bu)), Math.max(.06, Math.min(.94, bv)), true);
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (l) { on = l[0].isIntersecting; }).observe(c);
    var last = 0;
    requestAnimationFrame(function loop(ts) { var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; if (on && !document.hidden) frame(dt); requestAnimationFrame(loop); });
  })();
})();
