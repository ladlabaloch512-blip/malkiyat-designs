// Mobile menu: slide-in sidebar drawer with backdrop
(function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('nav.main');
  if (!burger || !nav) return;
  var scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  document.body.appendChild(scrim);
  var closeBtn = nav.querySelector('.drawer-close');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    scrim.classList.toggle('on', open);
    document.body.classList.toggle('menu-lock', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  scrim.addEventListener('click', function () { setMenu(false); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
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

// Quick estimate calculator: covered area = floors x plot sq ft + mumty (auto by plot size)
var QC_RATES = { silver: 6500, gold: 7500, platinum: 8500, grey: 4000 };
function qcFmt(n) {
  if (n >= 10000000) return 'Rs ' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' crore';
  if (n >= 100000) return 'Rs ' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' lakh';
  return 'Rs ' + n.toLocaleString('en-PK');
}
(function () {
  var root = document.querySelector('.qcalc');
  if (!root) return;
  var state = { type: 'finishing', pkg: 'gold', plot: '10', floors: 2 };
  function seg(name) { return root.querySelector('[data-seg="' + name + '"]'); }
  function setOn(group, val) {
    group.querySelectorAll('button').forEach(function (btn) {
      btn.classList.toggle('on', btn.getAttribute('data-v') === String(val));
    });
  }
  function plotSqft() {
    if (state.plot === 'other') {
      var v = parseFloat(document.getElementById('qcSize').value);
      if (!v || v <= 0) return null;
      var u = document.getElementById('qcUnit').value;
      return v * (u === 'kanal' ? 5000 : u === 'sqft' ? 1 : 250);
    }
    return parseInt(state.plot, 10) * 250;
  }
  function plotLabel() {
    if (state.plot === 'other') {
      var v = document.getElementById('qcSize').value;
      var u = document.getElementById('qcUnit').value;
      return v + ' ' + (u === 'kanal' ? 'Kanal' : u === 'sqft' ? 'sq ft' : 'Marla');
    }
    return state.plot === '20' ? '1 Kanal' : state.plot + ' Marla';
  }
  function render() {
    var sq = plotSqft();
    var areaEl = document.getElementById('qcArea');
    var priceEl = document.getElementById('qcPrice');
    var noteEl = document.getElementById('qcNote');
    var wa = document.getElementById('waCalc');
    if (sq === null) {
      areaEl.textContent = '0';
      priceEl.textContent = 'Rs 0';
      noteEl.textContent = 'Enter your plot size. A first guide; your written quotation follows a site visit.';
      wa.href = 'https://wa.me/923315161679';
      return;
    }
    var marlaEq = sq / 250;
    var mumty = marlaEq <= 6 ? 200 : marlaEq < 20 ? 300 : 500;
    var area = Math.round(state.floors * sq + mumty);
    var rate = state.type === 'grey' ? QC_RATES.grey : QC_RATES[state.pkg];
    var total = area * rate;
    areaEl.textContent = area.toLocaleString('en-PK');
    priceEl.textContent = qcFmt(total);
    noteEl.textContent = 'Rs ' + rate.toLocaleString('en-PK') + ' per sq ft \u00d7 ' + area.toLocaleString('en-PK') + ' sq ft, including a ' + mumty + ' sq ft mumty. A first guide; your written quotation follows a site visit.';
    var pkgNames = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
    var msg = 'Assalam-o-Alaikum, I used the cost calculator on the Malkiyat Constructions website.\n' +
      'Type: ' + (state.type === 'grey' ? 'Grey structure' : 'With finishing') + '\n' +
      (state.type === 'grey' ? '' : 'Package: ' + pkgNames[state.pkg] + '\n') +
      'Plot: ' + plotLabel() + ', Floors: ' + state.floors + '\n' +
      'Covered area: ' + area.toLocaleString('en-PK') + ' sq ft (including ' + mumty + ' sq ft mumty)\n' +
      'Estimated cost: ' + qcFmt(total) + '\n' +
      'Please share the details.';
    wa.href = 'https://wa.me/923315161679?text=' + encodeURIComponent(msg);
  }
  ['type', 'pkg', 'plot', 'floors'].forEach(function (name) {
    var g = seg(name);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var v = btn.getAttribute('data-v');
      if (name === 'type') {
        state.type = v; setOn(g, v);
        var pkgSeg = seg('pkg');
        var greyBlock = root.querySelector('[data-greyblock]');
        if (v === 'grey') { pkgSeg.hidden = true; greyBlock.hidden = false; }
        else { pkgSeg.hidden = false; greyBlock.hidden = true; state.pkg = 'gold'; setOn(pkgSeg, 'gold'); }
      } else if (name === 'pkg') { state.pkg = v; setOn(g, v); }
      else if (name === 'plot') { state.plot = v; setOn(g, v); root.querySelector('[data-other]').hidden = v !== 'other'; }
      else if (name === 'floors') { state.floors = parseInt(v, 10); setOn(g, v); }
      render();
    });
  });
  document.getElementById('qcSize').addEventListener('input', render);
  document.getElementById('qcUnit').addEventListener('change', render);
  render();
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
