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

  /* ---- 3D-купол: сетка на мачтах, дрон подлетает и вязнет ---- */
  var c = $('#dome');
  if (c && c.getContext) (function () {
    var g = c.getContext('2d'), box = $('#media');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2), lite = innerWidth < 620;
    var NX = lite ? 22 : 30, NZ = lite ? 13 : 18, SX = 1.75, SZ = 1.05, CAM = 5.2;
    var t = 0, yaw = .55, pit = .5, mx = 0, my = 0, rip = [], drones = [], next = 1.2, on = true;
    var MU = [0, .5, 1], MV = [0, 1];
    function size() { var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0); }
    function hgt(u, v) {
      var su = Math.sin(u * Math.PI * 2), sv = Math.sin(v * Math.PI);
      var y = .98 - .13 * su * su - .2 * sv + .012 * Math.sin(t * 1.3 + u * 9 + v * 5);
      for (var i = 0; i < rip.length; i++) { var r = rip[i], d = Math.hypot((u - r.u) * SX * 2, (v - r.v) * SZ * 2); y -= .11 * Math.exp(-r.a * 1.5) * Math.cos(d * 9 - r.a * 9) * Math.exp(-d * 2.2); }
      return y;
    }
    function proj(X, Y, Z) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
      var x = X * cy - Z * sy, z = X * sy + Z * cy, y = Y * cp - z * sp; z = Y * sp + z * cp;
      var f = Math.min(W * 1.02, H * 1.75), narrow = W < 620, s = f / (z + CAM);
      return [W * (narrow ? .5 : .58) + x * s, H * (narrow ? .8 : .76) - y * s, z, s];
    }
    function P(u, v) { return proj((u - .5) * 2 * SX, hgt(u, v), (v - .5) * 2 * SZ); }
    function line(a, b) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    function frame(dt) {
      t += dt;
      yaw += ((.55 + .32 * Math.sin(t * .22) + mx * .7) - yaw) * .06;
      pit += ((.5 + my * .22) - pit) * .06;
      for (var i = rip.length - 1; i >= 0; i--) { rip[i].a += dt; if (rip[i].a > 3.5) rip.splice(i, 1); }
      g.clearRect(0, 0, W, H);
      g.lineWidth = 1; g.strokeStyle = 'rgba(160,140,255,.10)';
      for (var k = -4; k <= 4; k++) { line(proj(k * .55, 0, -1.8), proj(k * .55, 0, 1.8)); line(proj(-2.2, 0, k * .45), proj(2.2, 0, k * .45)); }
      MU.forEach(function (u) { MV.forEach(function (v) {
        var X = (u - .5) * 2 * SX, Z = (v - .5) * 2 * SZ, top = hgt(u, v), a = proj(X, top, Z), w = .035;
        g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1; line(a, proj(X + (u - .5) * .9, 0, Z + (v - .5) * 1.1));
        g.strokeStyle = 'rgba(235,230,255,.9)'; g.lineWidth = 1.4;
        line(proj(X - w, 0, Z), proj(X - w, top, Z)); line(proj(X + w, 0, Z), proj(X + w, top, Z));
        g.lineWidth = .8; g.strokeStyle = 'rgba(235,230,255,.55)';
        for (var j = 0; j < 9; j++) { var s1 = j % 2 ? 1 : -1; line(proj(X - w * s1, top * j / 9, Z), proj(X + w * s1, top * (j + 1) / 9, Z)); }
        g.fillStyle = '#C9F55B'; g.beginPath(); g.arc(a[0], a[1], 3.2, 0, 7); g.fill();
      }); });
      var pts = [], i2, j2;
      for (i2 = 0; i2 <= NX; i2++) { pts[i2] = []; for (j2 = 0; j2 <= NZ; j2++) pts[i2][j2] = P(i2 / NX, j2 / NZ); }
      var half = Math.round(NX / 2);
      function seg(a, b, strong) {
        var al = Math.max(.12, Math.min(1, 1.15 - (a[2] + b[2]) * .22));
        g.strokeStyle = strong ? 'rgba(255,255,255,' + al + ')' : 'rgba(190,175,255,' + (al * .62) + ')';
        g.lineWidth = strong ? 1.8 : .8; line(a, b);
      }
      for (i2 = 0; i2 <= NX; i2++) for (j2 = 0; j2 < NZ; j2++) seg(pts[i2][j2], pts[i2][j2 + 1], i2 % half === 0);
      for (j2 = 0; j2 <= NZ; j2++) for (i2 = 0; i2 < NX; i2++) seg(pts[i2][j2], pts[i2 + 1][j2], j2 === 0 || j2 === NZ);
      rip.forEach(function (r) {
        if (r.a > 1.2) return; var p = P(r.u, r.v), k2 = r.a / 1.2;
        g.strokeStyle = 'rgba(201,245,91,' + (1 - k2) + ')'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(p[0], p[1], 10 + k2 * 70, (10 + k2 * 70) * .42, 0, 0, 7); g.stroke();
      });
      next -= dt;
      if (next <= 0 && drones.length < 2) {
        var an = Math.random() * 6.28;
        drones.push({ u: .14 + Math.random() * .72, v: .2 + Math.random() * .6, a: 0, sx: Math.cos(an) * 2.4, sz: Math.sin(an) * 1.6, hit: false });
        next = 2.4 + Math.random() * 2;
      }
      for (i2 = drones.length - 1; i2 >= 0; i2--) {
        var d = drones[i2]; d.a += dt;
        var tx = (d.u - .5) * 2 * SX, tz = (d.v - .5) * 2 * SZ, ty = hgt(d.u, d.v), kk, p, al = 1;
        if (d.a < 1.5) { kk = d.a / 1.5; kk *= kk; p = proj(tx + d.sx * (1 - kk), ty + 1.5 * (1 - kk) + .06, tz + d.sz * (1 - kk)); }
        else {
          if (!d.hit) { d.hit = true; rip.push({ u: d.u, v: d.v, a: 0 }); }
          kk = (d.a - 1.5) / 1.1; al = 1 - kk;
          if (kk >= 1) { drones.splice(i2, 1); continue; }
          p = proj(tx - d.sx * .12 * kk, ty + .06 + .28 * Math.sin(kk * 3.14) - .1 * kk, tz - d.sz * .12 * kk);
        }
        var s = p[3] * .035;
        g.strokeStyle = 'rgba(255,255,255,' + al + ')'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(p[0] - s, p[1] - s * .5); g.lineTo(p[0] + s, p[1] + s * .5); g.moveTo(p[0] + s, p[1] - s * .5); g.lineTo(p[0] - s, p[1] + s * .5); g.stroke();
        g.fillStyle = 'rgba(255,92,122,' + al + ')';
        [[-1, -.5], [1, .5], [1, -.5], [-1, .5]].forEach(function (qq) { g.beginPath(); g.arc(p[0] + qq[0] * s, p[1] + qq[1] * s, Math.max(1.6, s * .34), 0, 7); g.fill(); });
      }
    }
    size(); addEventListener('resize', function () { size(); if (calm) frame(0); });
    if (calm) { t = 2; frame(0); return; }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; });
    box.addEventListener('pointerleave', function () { mx = 0; my = 0; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (l) { on = l[0].isIntersecting; }).observe(c);
    var last = 0;
    requestAnimationFrame(function loop(ts) { var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; if (on && !document.hidden) frame(dt); requestAnimationFrame(loop); });
  })();
})();
