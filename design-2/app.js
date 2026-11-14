/* Malkiyat Associates & Builders, Design 2 "The Day House"
   Calculator config is editable: change rates or the covered-area table
   in CONFIG and the whole calculator follows. */
"use strict";

/* ================= CONFIG (editable) ================= */
var CONFIG = {
  whatsapp: "923315161679",
  ratesPerSqft: { grey: 4000, silver: 6500, gold: 7500, platinum: 8500 },
  /* Covered area: ground floor base by plot size in Marla.
     Other sizes use sqftPerMarlaFloor1. */
  floor1BaseSqft: { 5: 1100, 10: 2500, 20: 4500 },
  sqftPerMarlaFloor1: 250,
  floor2Factor: 1.0,   /* floor 2 adds 100% of floor 1 */
  floor3Factor: 0.95,  /* floor 3 adds 95% of floor 1 */
  mumtySqft: 300       /* added when floors is 2 or 3 */
};

/* ================= small helpers ================= */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
function fmtPrice(total) {
  if (total >= 1e7) return "Rs " + (total / 1e7).toFixed(2) + " crore";
  return "Rs " + (total / 1e5).toFixed(1) + " lakh";
}

/* ================= mobile nav ================= */
(function () {
  var toggle = $("#navToggle"), nav = $("#mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
})();

/* ================= calculator ================= */
(function () {
  var state = { type: "finishing", pkg: "gold", plot: "10", floors: 2 };

  function bindSeg(id, attr, apply) {
    var seg = $(id);
    if (!seg) return;
    seg.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      $$("button", seg).forEach(function (b) { b.classList.toggle("is-selected", b === btn); });
      apply(btn.getAttribute(attr));
      update();
    });
  }
  bindSeg("#segType", "data-type", function (v) { state.type = v; });
  bindSeg("#segPkg", "data-pkg", function (v) { state.pkg = v; });
  bindSeg("#segPlot", "data-plot", function (v) { state.plot = v; });
  bindSeg("#segFloors", "data-floors", function (v) { state.floors = parseInt(v, 10); });
  var otherInput = $("#otherMarla");
  if (otherInput) otherInput.addEventListener("input", update);

  function floor1Area() {
    if (state.plot === "other") {
      var m = parseFloat(otherInput && otherInput.value);
      if (!isFinite(m) || m <= 0) m = 0;
      return m * CONFIG.sqftPerMarlaFloor1;
    }
    return CONFIG.floor1BaseSqft[state.plot] || 0;
  }
  function plotLabel() {
    if (state.plot === "other") {
      var m = parseFloat(otherInput && otherInput.value);
      return (isFinite(m) && m > 0 ? m : 0) + " Marla";
    }
    return state.plot === "20" ? "1 Kanal" : state.plot + " Marla";
  }

  function update() {
    var pkgGroup = $("#pkgGroup");
    if (pkgGroup) pkgGroup.classList.toggle("is-disabled", state.type === "grey");
    var otherWrap = $("#otherWrap");
    if (otherWrap) otherWrap.hidden = state.plot !== "other";

    var f1 = floor1Area();
    var area = f1;
    if (state.floors >= 2) area += f1 * CONFIG.floor2Factor;
    if (state.floors >= 3) area += f1 * CONFIG.floor3Factor;
    var mumty = state.floors >= 2 ? CONFIG.mumtySqft : 0;
    area += mumty;
    area = Math.round(area);

    var rate = state.type === "grey" ? CONFIG.ratesPerSqft.grey : CONFIG.ratesPerSqft[state.pkg];
    var total = area * rate;
    var price = fmtPrice(total);

    $("#resArea").textContent = fmt(area);
    $("#resPrice").textContent = price;
    var working = "Rs " + fmt(rate) + " per sq ft x " + fmt(area) + " sq ft" +
      (mumty ? ", including a " + CONFIG.mumtySqft + " sq ft mumty" : "") +
      ". A first guide; your written quotation follows a site visit.";
    $("#resWorking").textContent = working;

    var typeLabel = state.type === "grey" ? "Grey structure" :
      "With finishing, " + state.pkg.charAt(0).toUpperCase() + state.pkg.slice(1) + " package";
    var msg = "Assalam o Alaikum, I used the cost calculator on the Malkiyat Associates & Builders website.\n" +
      "My estimate: " + typeLabel + ", plot " + plotLabel() + ", " + state.floors + (state.floors === 1 ? " floor" : " floors") + ".\n" +
      "Covered area: " + fmt(area) + " sq ft at Rs " + fmt(rate) + " per sq ft.\n" +
      "Estimate: " + price + ".\nPlease share a written quotation.";
    var wa = $("#waEstimate");
    if (wa) wa.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  update();
})();

/* ================= projects gallery + lightbox ================= */
(function () {
  var gallery = $("#gallery");
  if (!gallery) return;
  var TOTAL = 15, current = 0;
  var captions = [];
  for (var i = 1; i <= TOTAL; i++) {
    (function (n) {
      var cap = "Malkiyat project photo " + n + " of " + TOTAL;
      captions.push(cap);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__item";
      btn.setAttribute("aria-label", "Open " + cap);
      var img = document.createElement("img");
      img.src = "img/projects/p" + (n < 10 ? "0" : "") + n + ".webp";
      img.alt = "A house project by Malkiyat Associates & Builders";
      img.loading = "lazy";
      img.decoding = "async";
      var fc = document.createElement("span");
      fc.className = "gallery__cap";
      fc.textContent = "Malkiyat Associates & Builders project";
      btn.appendChild(img);
      btn.appendChild(fc);
      btn.addEventListener("click", function () { openLB(n - 1); });
      gallery.appendChild(btn);
    })(i);
  }

  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCaption");
  function openLB(idx) {
    current = idx;
    render();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }
  function closeLB() {
    lb.hidden = true;
    document.body.style.overflow = document.body.classList.contains("loading") ? "hidden" : "";
  }
  function step(d) { current = (current + d + TOTAL) % TOTAL; render(); }
  function render() {
    var n = current + 1;
    lbImg.src = "img/projects/p" + (n < 10 ? "0" : "") + n + ".webp";
    lbCap.textContent = captions[current];
  }
  $("#lbClose").addEventListener("click", closeLB);
  $("#lbPrev").addEventListener("click", function () { step(-1); });
  $("#lbNext").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

/* ================= scroll sequence engine =================
   Pattern verified against ApnaGhar (study, 2026-11-14):
   sticky stage inside a tall section, canvas cover-fit, tiered frame
   sets, keyframe-first loading, nearest-frame loading (max 6 parallel),
   nearest-loaded fallback, exponential smoothing in rAF. */
(function () {
  var sec = $(".seq");
  if (!sec) { window.__mktLoaderDone = true; return; }
  var canvas = $(".seq__canvas", sec);
  var ctx = canvas && canvas.getContext && canvas.getContext("2d", { alpha: false });

  var loader = $("#loader"), loaderFill = $("#loaderFill"),
      loaderPct = $("#loaderPct"), loaderEnter = $("#loaderEnter");
  var lifted = false;

  function liftLoader() {
    if (lifted) return;
    lifted = true;
    window.__mktLoaderDone = true;
    document.body.classList.remove("loading");
    document.body.style.overflow = "";
    if (loader) {
      loader.classList.add("done");
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 650);
    }
  }
  function staticMode() {
    sec.classList.add("is-static");
    liftLoader();
  }
  if (loaderEnter) loaderEnter.addEventListener("click", liftLoader);

  if (!ctx) { staticMode(); return; }

  /* Show the branded loader and lock scroll while it is up. */
  document.body.classList.add("loading");
  document.body.style.overflow = "hidden";
  setTimeout(function () { if (!lifted && loaderEnter) loaderEnter.hidden = false; }, 2500);
  setTimeout(liftLoader, 4000); /* hard cap */

  var COUNT = 143;
  var conn = navigator.connection || {};
  var slowConn = !!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || "") ||
    (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 8);

  function isPortrait() {
    return window.matchMedia("(max-aspect-ratio: 5/6)").matches || window.innerWidth <= 760;
  }
  function pickTier() {
    if (isPortrait()) return "m";
    var hd = (window.innerWidth >= 1400 && (window.devicePixelRatio || 1) >= 1.5) || window.innerWidth >= 1700;
    if (hd && !slowConn) return "hd";
    return "d";
  }
  var tier = pickTier();
  var basePath = "frames/seq2/" + tier + "/";
  function frameName(i) { return "f" + ("00" + i).slice(-3) + ".webp"; }

  /* WebP support test, like ApnaGhar. No WebP means the static poster. */
  var decided = false;
  function decide(ok) {
    if (decided) return;
    decided = true;
    if (!ok) { staticMode(); return; }
    startLoading();
  }
  var testImg = new Image();
  testImg.onload = function () { decide(testImg.width === 1); };
  testImg.onerror = function () { decide(false); };
  testImg.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  setTimeout(function () { decide(true); }, 1500);

  var frames = new Array(COUNT), loaded = new Array(COUNT), failed = new Array(COUNT);
  var keyList = [], keySet = {};
  (function () {
    var s = {};
    s[0] = true; s[COUNT - 1] = true;
    for (var i = 0; i < COUNT; i += 8) s[i] = true;
    Object.keys(s).forEach(function (k) { keyList.push(+k); keySet[k] = true; });
    keyList.sort(function (a, b) { return a - b; });
  })();
  var keysLoaded = 0, frame0Ready = false, fontsReady = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { fontsReady = true; maybeLift(); });
  } else { fontsReady = true; }

  function maybeLift() {
    if (frame0Ready && keysLoaded >= keyList.length && fontsReady) liftLoader();
  }
  function loaderProgress() {
    var pct = Math.round((keysLoaded / keyList.length) * 100);
    if (loaderFill) loaderFill.style.width = pct + "%";
    if (loaderPct) loaderPct.textContent = pct;
  }

  var inFlight = 0, queuePos = 0, errorsBeforeSuccess = 0, anySuccess = false;
  var targetIdx = 0;

  function nextIndex() {
    while (queuePos < keyList.length) {
      var k = keyList[queuePos++];
      if (!loaded[k] && !frames[k] && !failed[k]) return k;
    }
    /* Nearest to the current target, searching outward, direction aware. */
    var dir = lastDir || 1;
    for (var r = 0; r < COUNT; r++) {
      var a = targetIdx + dir * r, b = targetIdx - dir * r;
      if (a >= 0 && a < COUNT && !loaded[a] && !frames[a] && !failed[a]) return a;
      if (b >= 0 && b < COUNT && !loaded[b] && !frames[b] && !failed[b]) return b;
    }
    return -1;
  }

  function pump() {
    while (inFlight < 6) {
      var idx = nextIndex();
      if (idx === -1) return;
      frames[idx] = "loading";
      inFlight++;
      (function (i) {
        var img = new Image();
        img.decoding = "async";
        function done(ok) {
          inFlight--;
          if (ok) {
            frames[i] = img; loaded[i] = true; anySuccess = true;
            if (keySet[i]) { keysLoaded++; loaderProgress(); }
            if (i === 0) { frame0Ready = true; maybeLift(); }
            dirty = true;
            kick();
          } else {
            frames[i] = undefined; failed[i] = true;
            if (keySet[i]) { keysLoaded++; loaderProgress(); maybeLift(); }
            if (!anySuccess && ++errorsBeforeSuccess >= 3) { staticMode(); return; }
          }
          pump();
        }
        img.onload = function () {
          if (img.decode) { img.decode().then(function () { done(true); }, function () { done(true); }); }
          else done(true);
        };
        img.onerror = function () { done(false); };
        img.src = basePath + frameName(i);
      })(idx);
    }
  }
  function startLoading() { loaderProgress(); pump(); }

  /* ---------- geometry, drawing, smoothing ---------- */
  var stage = $(".seq__stage", sec), panel = $(".seq__panel", sec);
  var cw = 0, ch = 0, dirty = true;

  function sizeCanvas() {
    if (isPortrait()) {
      var w = Math.min(stage.clientWidth, 400);
      var frac = window.innerHeight < 720 ? 0.32 : 0.40;
      var h = Math.min(w * 16 / 9, window.innerHeight * frac);
      sec.style.setProperty("--media-h", Math.round(h) + "px");
    } else {
      sec.style.removeProperty("--media-h");
    }
    var rect = panel.getBoundingClientRect();
    var cap = isPortrait() ? 3 : 2;
    var dpr = Math.min(window.devicePixelRatio || 1, cap);
    var nw = Math.max(1, Math.round(rect.width * dpr));
    var nh = Math.max(1, Math.round(rect.height * dpr));
    if (nw !== cw || nh !== ch) { cw = canvas.width = nw; ch = canvas.height = nh; dirty = true; }
  }
  function drawCover(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var w = iw * scale, h = ih * scale;
    var x = Math.min(0, Math.max(cw - w, (cw - w) / 2));
    var y = Math.min(0, Math.max(ch - h, (ch - h) / 2));
    ctx.fillStyle = "#ebe8e0";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function nearestLoaded(idx) {
    if (loaded[idx]) return idx;
    for (var r = 1; r < COUNT; r++) {
      if (idx + r < COUNT && loaded[idx + r]) return idx + r;
      if (idx - r >= 0 && loaded[idx - r]) return idx - r;
    }
    return -1;
  }

  var thresholds = [0, 0.25, 0.5, 0.75];
  var captions = $$(".seq__caption", sec), railItems = $$("[data-rail]", sec);
  var railFill = $("#railFill");
  var activeStage = -1;
  function setStage(progress) {
    var s = 0;
    for (var i = 0; i < thresholds.length; i++) if (progress >= thresholds[i]) s = i;
    if (railFill) railFill.style.transform = "scaleX(" + Math.min(1, progress / 0.98).toFixed(4) + ")";
    if (s === activeStage) return;
    activeStage = s;
    captions.forEach(function (c, i) { c.classList.toggle("is-active", i === s); });
    railItems.forEach(function (c, i) {
      c.classList.toggle("is-active", i === s);
      c.classList.toggle("is-done", i < s);
    });
  }

  function sectionProgress() {
    var rect = sec.getBoundingClientRect();
    var total = sec.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    var p = -rect.top / total;
    return Math.min(1, Math.max(0, p));
  }

  var target = 0, smooth = 0, shown = 0, lastDir = 1, inView = true;
  var rafOn = false, lastT = 0;

  function frame() {
    if (!rafOn) return;
    var now = performance.now();
    var dt = lastT ? Math.min(now - lastT, 100) : 16;
    lastT = now;
    var k1 = 1 - Math.exp(-dt / 80);
    var k2 = 1 - Math.exp(-dt / 70);
    var prev = shown;
    smooth += (target - smooth) * k1;
    shown += (smooth - shown) * k2;
    if (Math.abs(target - shown) < 0.0002) shown = target;
    if (shown !== prev) {
      lastDir = shown > prev ? 1 : -1;
      targetIdx = Math.round(shown * (COUNT - 1));
      pump();
    }
    setStage(shown);
    var idx = Math.round(shown * (COUNT - 1));
    var use = nearestLoaded(idx);
    if (use !== -1 && (dirty || use !== frame._last || shown !== prev)) {
      drawCover(frames[use]);
      frame._last = use;
      if (!sec.classList.contains("has-frame")) sec.classList.add("has-frame");
      dirty = false;
    }
    if (shown !== target || dirty) {
      requestAnimationFrame(frame);
    } else {
      rafOn = false; lastT = 0;
    }
  }
  function kick() {
    if (!rafOn && inView) { rafOn = true; lastT = 0; requestAnimationFrame(frame); }
  }
  function onScroll() {
    target = sectionProgress();
    targetIdx = Math.round(target * (COUNT - 1));
    kick();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { sizeCanvas(); onScroll(); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { dirty = true; kick(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) kick();
    }).observe(sec);
  }

  var skip = $("#skipIntro");
  if (skip) skip.addEventListener("click", function (e) {
    var dest = document.getElementById("calculator");
    if (dest) {
      e.preventDefault();
      dest.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  sizeCanvas();
  target = smooth = shown = sectionProgress();
  setStage(shown);
  kick();
})();
