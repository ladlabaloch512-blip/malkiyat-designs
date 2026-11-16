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
