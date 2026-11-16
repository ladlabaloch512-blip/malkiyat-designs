// Mobile menu
(function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('nav.main');
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }
})();

// Project filters
(function () {
  var btns = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('.pcard');
  if (!btns.length) return;
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.getAttribute('data-filter');
      cards.forEach(function (c) {
        c.style.display = (f === 'all' || c.getAttribute('data-cat') === f) ? '' : 'none';
      });
    });
  });
})();

// Cost calculator (rates per sq ft of covered area)
var RATES = { grey: 4000, silver: 6500, gold: 7500, platinum: 8500 };
var BASE_AREA = { '5': 1100, '10': 2500, '20': 4500 }; // first floor covered area by plot size in Marla

function fmtRs(n) {
  if (n >= 10000000) { var c = Math.round(n / 100000) / 100; return 'Rs ' + c + ' crore'; }
  if (n >= 100000) { var l = Math.round(n / 1000) / 100; return 'Rs ' + l + ' lakh'; }
  return 'Rs ' + n.toLocaleString('en-PK');
}

function calcEstimate() {
  var sizeEl = document.getElementById('plotSize');
  if (!sizeEl) return null;
  var sizeVal = sizeEl.value;
  var base;
  var sizeLabel;
  if (sizeVal === 'other') {
    var marla = parseFloat(document.getElementById('marlaInput').value) || 0;
    base = marla * 250;
    sizeLabel = marla + ' Marla';
  } else {
    base = BASE_AREA[sizeVal];
    sizeLabel = sizeVal === '20' ? '1 Kanal' : sizeVal + ' Marla';
  }
  var floors = parseInt(document.getElementById('floors').value, 10) || 1;
  var area = base;
  if (floors >= 2) area += base;            // second floor, full cover
  if (floors >= 3) area += base * 0.95;     // third floor
  var mumty = document.getElementById('mumty').checked;
  if (mumty && floors >= 2) area += 300;
  area = Math.round(area);
  var pkgEl = document.querySelector('input[name="pkg"]:checked');
  var pkgKey = pkgEl ? pkgEl.value : 'gold';
  var rate = RATES[pkgKey];
  var total = area * rate;
  return { area: area, rate: rate, total: total, floors: floors, sizeLabel: sizeLabel, pkgKey: pkgKey, mumty: mumty };
}

function renderCalc() {
  var r = calcEstimate();
  if (!r) return;
  document.querySelectorAll('.pkg').forEach(function (p) {
    var input = p.querySelector('input');
    p.classList.toggle('sel', input && input.checked);
  });
  document.getElementById('rArea').textContent = r.area.toLocaleString('en-PK') + ' sq ft';
  document.getElementById('rRate').textContent = 'Rs ' + r.rate.toLocaleString('en-PK') + ' / sq ft';
  document.getElementById('rTotal').textContent = fmtRs(r.total);
  var pkgNames = { grey: 'Grey Structure', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
  var msg = 'Assalam-o-Alaikum, I used the cost calculator on the Malkiyat Constructions website.\n' +
    'Plot: ' + r.sizeLabel + ', Floors: ' + r.floors + (r.mumty ? ', with mumty' : '') + '\n' +
    'Package: ' + pkgNames[r.pkgKey] + '\n' +
    'Covered area: ' + r.area.toLocaleString('en-PK') + ' sq ft\n' +
    'Estimated cost: ' + fmtRs(r.total) + '\n' +
    'Please share the details.';
  document.getElementById('waCalc').href = 'https://wa.me/923315161679?text=' + encodeURIComponent(msg);
}

(function () {
  var sizeEl = document.getElementById('plotSize');
  if (!sizeEl) return;
  var marlaRow = document.getElementById('marlaRow');
  function syncMarla() { marlaRow.style.display = sizeEl.value === 'other' ? '' : 'none'; }
  ['plotSize', 'floors', 'mumty', 'marlaInput'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('change', function () { syncMarla(); renderCalc(); }); el.addEventListener('input', renderCalc); }
  });
  document.querySelectorAll('input[name="pkg"]').forEach(function (el) { el.addEventListener('change', renderCalc); });
  syncMarla();
  renderCalc();
})();

// Contact / quote form -> WhatsApp
(function () {
  var form = document.getElementById('leadForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('fName').value.trim();
    var phone = document.getElementById('fPhone').value.trim();
    var service = document.getElementById('fService').value;
    var message = document.getElementById('fMsg').value.trim();
    var text = 'Assalam-o-Alaikum, I am ' + name + '.\n' +
      'I am interested in: ' + service + '\n' +
      (message ? message + '\n' : '') +
      'My contact number: ' + phone;
    window.open('https://wa.me/923315161679?text=' + encodeURIComponent(text), '_blank');
  });
})();

// Wave Cascade reveal engine: targets hidden first (html.wv gate), reveal in a
// staggered cascade as they enter the viewport. Never re-hides. No reduced-motion gating.
window.__wvOn = true;
(function () {
  var targets = Array.prototype.slice.call(document.querySelectorAll(
    '.hero-inner > *, .page-hero .wrap > *, .sec-head, .card, .step, .pcard, .info-card, .form-card, .split, .cta, table.rates, .stats, .detail-layout'));
  if (!targets.length) return;
  targets.forEach(function (el) { el.setAttribute('data-rv', ''); });

  var counted = false;
  function countUp() {
    if (counted) return; counted = true;
    document.querySelectorAll('.stat .num').forEach(function (n) {
      var m = n.textContent.match(/(\d+)(.*)/);
      if (!m) return;
      var end = parseInt(m[1], 10), suf = m[2], t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1100, 1);
        n.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var queue = [], timer = null;
  function flush() {
    queue.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i, 8) * 70 + 'ms';
      el.classList.add('in');
      el.addEventListener('transitionend', function h() {
        el.style.transitionDelay = '';
        el.removeEventListener('transitionend', h);
      });
    });
    queue = []; timer = null;
  }
  function reveal(el) {
    if (el.classList.contains('in')) return;
    queue.push(el);
    if (!timer) timer = setTimeout(flush, 30);
    if (el.classList && el.classList.contains('stats')) countUp();
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92 && r.bottom > 0;
  }
  function sweep() {
    targets.forEach(function (el) { if (!el.classList.contains('in') && inView(el)) reveal(el); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('resize', sweep);
  setInterval(sweep, 1500); // viewport-scoped passes only, never reveals off-screen items early
  sweep();
})();
