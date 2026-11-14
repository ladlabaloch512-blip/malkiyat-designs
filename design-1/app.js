/* Design 1, The Transformation. Scroll sequence engine + calculator + gallery.
   Pattern: sticky stage, canvas cover-fit frame sequence, hybrid smart loader. */
(function () {
  "use strict";

  /* ================= Calculator config (EDITABLE: rates and area model) ================= */
  var CALC = {
    rates: { grey: 4000, silver: 6500, gold: 7500, platinum: 8500 },
    rateLabels: { grey: "Grey structure", silver: "Silver", gold: "Gold", platinum: "Platinum" },
    baseArea: { "5": 1100, "10": 2500, "20": 4500 }, /* first floor sq ft by plot key */
    otherPerMarla: 250,        /* first floor sq ft per marla for Other size */
    floor2Factor: 1.0,         /* floor 2 adds 100% of floor 1 (anchor: 10 Marla, 2 floors = 5,300 incl. mumty) */
    floor3Factor: 0.95,        /* floor 3 adds 95% of floor 1 */
    mumty: 300                 /* sq ft, added when floors >= 2 */
  };

  var state = { type: "finishing", pkg: "gold", plot: "10", floors: 2, otherMarla: 7 };

  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtPrice(total) {
    var crore = total / 10000000;
    if (crore >= 1) return "Rs " + crore.toFixed(2) + " crore";
    return "Rs " + (total / 100000).toFixed(1) + " lakh";
  }

  function calcResult() {
    var base = state.plot === "other" ? state.otherMarla * CALC.otherPerMarla : CALC.baseArea[state.plot];
    var area = base;
    if (state.floors >= 2) area += base * CALC.floor2Factor;
    if (state.floors >= 3) area += base * CALC.floor3Factor;
    var mumty = state.floors >= 2 ? CALC.mumty : 0;
    area += mumty;
    var key = state.type === "grey" ? "grey" : state.pkg;
    var rate = CALC.rates[key];
    return { area: area, rate: rate, total: area * rate, mumty: mumty, key: key };
  }

  function plotLabel() {
    if (state.plot === "other") return state.otherMarla + " Marla (other size)";
    if (state.plot === "20") return "1 Kanal";
    return state.plot + " Marla";
  }

  function renderCalc() {
    var r = calcResult();
    document.getElementById("resArea").textContent = fmt(r.area);
    document.getElementById("resPrice").textContent = fmtPrice(r.total);
    var work = "Rs " + fmt(r.rate) + " per sq ft x " + fmt(r.area) + " sq ft";
    if (r.mumty) work += ", including a 300 sq ft mumty";
    work += ". A first guide; your written quotation follows a site visit.";
    document.getElementById("resWork").textContent = work;
    document.getElementById("pkgGroup").style.display = state.type === "grey" ? "none" : "";
    var msg = "Assalam-o-Alaikum, I used the cost calculator on the Malkiyat website.\n" +
      "What I want: " + (state.type === "grey" ? "Grey structure" : "With finishing (" + CALC.rateLabels[state.pkg] + " package)") + "\n" +
      "Plot size: " + plotLabel() + "\nFloors: " + state.floors + "\n" +
      "Covered area: " + fmt(r.area) + " sq ft\nEstimate: " + fmtPrice(r.total) +
      " (Rs " + fmt(r.rate) + " per sq ft)\nPlease contact me with the next steps.";
    document.getElementById("waEstimate").href =
      "https://wa.me/923315161679?text=" + encodeURIComponent(msg);
  }

  function seg(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      el.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      fn(b.getAttribute("data-val"));
      renderCalc();
    });
  }
  seg("segType", function (v) { state.type = v; });
  seg("segPkg", function (v) { state.pkg = v; });
  seg("segPlot", function (v) {
    state.plot = v;
    document.getElementById("otherWrap").hidden = v !== "other";
  });
  seg("segFloors", function (v) { state.floors = parseInt(v, 10); });
  var otherInput = document.getElementById("otherMarla");
  if (otherInput) otherInput.addEventListener("input", function () {
    var v = parseFloat(otherInput.value);
    if (v > 0) { state.otherMarla = v; renderCalc(); }
  });
  renderCalc();

  /* ================= Mobile nav ================= */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { mobileNav.hidden = true; navToggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ================= Lightbox ================= */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".g-item img"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    lbImg.src = galleryItems[lbIndex].src;
    lbImg.alt = galleryItems[lbIndex].alt;
  }
  document.getElementById("gallery").addEventListener("click", function (e) {
    var img = e.target.closest(".g-item") ? e.target.closest(".g-item").querySelector("img") : null;
    if (!img) return;
    lbShow(galleryItems.indexOf(img));
    lightbox.hidden = false;
    document.body.classList.add("locked");
  });
  function lbClose() { lightbox.hidden = true; document.body.classList.remove("locked"); }
  document.getElementById("lbClose").addEventListener("click", lbClose);
  document.getElementById("lbPrev").addEventListener("click", function () { lbShow(lbIndex - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { lbShow(lbIndex + 1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lbClose(); });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    if (e.key === "ArrowRight") lbShow(lbIndex + 1);
  });

  /* ================= Loader helpers ================= */
  var loader = document.getElementById("loader");
  var loaderFill = document.getElementById("loaderFill");
  var loaderPct = document.getElementById("loaderPct");
  var loaderEnter = document.getElementById("loaderEnter");
  var loaderLifted = false;
  function setProgress(frac) {
    var p = Math.round(Math.max(0, Math.min(1, frac)) * 100);
    loaderFill.style.width = p + "%";
    loaderPct.textContent = String(p);
  }
  function liftLoader() {
    if (loaderLifted) return;
    loaderLifted = true;
    setProgress(1);
    loader.classList.add("done");
    document.body.classList.remove("locked");
    setTimeout(function () { loader.style.display = "none"; }, 650);
  }
  loaderEnter.addEventListener("click", liftLoader);
  setTimeout(function () { if (!loaderLifted) loaderEnter.hidden = false; }, 2500);
  setTimeout(liftLoader, 4000); /* hard cap */

  /* ================= Scroll sequence engine ================= */
  var intro = document.getElementById("intro");
  var canvas = document.getElementById("introCanvas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d", { alpha: false }) : null;

  if (!intro || !ctx) {
    /* No canvas: poster stays visible, everything works. */
    liftLoader();
    return;
  }
  document.body.classList.add("locked");
  intro.classList.add("js-on");

  var COUNT = 143;
  var STAGE_AT = [0, 0.05, 0.14, 0.38, 0.52]; /* caption thresholds (share of pin progress) */
  var FRAME_END = 0.66;  /* frames play across first 66% of the pin */
  var FINAL_AT = 0.80;   /* final hero text from 80% */

  var portrait = window.matchMedia("(max-aspect-ratio: 5/6)").matches;
  var conn = navigator.connection || {};
  var slow = !!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || "") ||
    (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 8);
  var bigScreen = window.matchMedia("(min-width: 1600px), (min-width: 1280px) and (min-resolution: 1.25dppx), (min-width: 1067px) and (min-resolution: 1.5dppx)").matches;
  var tier = portrait ? "m" : (!slow && bigScreen ? "hd" : "d");
  var BASE = "frames/seq1/" + tier + "/";

  var frames = new Array(COUNT);
  var loadedFlag = new Array(COUNT).fill(false);
  var requested = new Array(COUNT).fill(false);
  var inFlight = 0, loadGen = 0;

  /* Keyframe list: every 8th frame + first + last */
  var keyframes = [];
  (function () {
    var seen = {};
    [0, COUNT - 1].forEach(function (i) { seen[i] = true; });
    for (var i = 0; i < COUNT; i += 8) seen[i] = true;
    Object.keys(seen).forEach(function (k) { keyframes.push(parseInt(k, 10)); });
    keyframes.sort(function (a, b) { return a - b; });
  })();
  var keysLoaded = 0;

  function frameName(i) { return ("00" + i).slice(-3); }
  function priorityList() {
    /* keyframes first, then nearest to current target frame, direction aware */
    var list = keyframes.slice();
    var target = Math.round(smoothP / FRAME_END * (COUNT - 1));
    target = Math.max(0, Math.min(COUNT - 1, target));
    var dir = target >= lastTarget ? 1 : -1;
    lastTarget = target;
    for (var d = 0; d < COUNT; d++) {
      var a = target + dir * d, b = target - dir * d;
      if (a >= 0 && a < COUNT && list.indexOf(a) === -1) list.push(a);
      if (b >= 0 && b < COUNT && list.indexOf(b) === -1) list.push(b);
    }
    return list;
  }
  var lastTarget = 0;

  function pump() {
    if (inFlight >= 6) return;
    var list = priorityList();
    for (var n = 0; n < list.length && inFlight < 6; n++) {
      var idx = list[n];
      if (requested[idx]) continue;
      requested[idx] = true;
      inFlight++;
      (function (i, gen) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          if (gen !== loadGen) return;
          var done = function () {
            frames[i] = img; loadedFlag[i] = true; inFlight--; needDraw = true;
            if (keyframes.indexOf(i) !== -1) {
              keysLoaded++;
              if (!loaderLifted) setProgress(keysLoaded / keyframes.length * 0.92);
              maybeReady();
            }
            pump(); requestTick();
          };
          if (img.decode) img.decode().then(done, done); else done();
        };
        img.onerror = function () {
          if (gen !== loadGen) return;
          inFlight--;
          if (tier === "hd" && i < 2) downgradeTier(); else pump();
        };
        img.src = BASE + "f" + frameName(i) + ".webp";
      })(idx, loadGen);
    }
  }
  function downgradeTier() {
    tier = "d"; BASE = "frames/seq1/d/";
    loadGen++; inFlight = 0; keysLoaded = 0;
    requested = new Array(COUNT).fill(false);
    pump();
  }

  var fontsReady = false;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontsReady = true; maybeReady(); });
  else fontsReady = true;
  function maybeReady() {
    if (loaderLifted) return;
    if (loadedFlag[0] && keysLoaded >= keyframes.length && fontsReady) liftLoader();
    else if (loadedFlag[0] && fontsReady && keysLoaded >= Math.ceil(keyframes.length * 0.6)) {
      /* playable threshold met early if most keyframes are in; hard cap still guards */
    }
  }
  /* Playable threshold check on a timer too (keyframe count may stall on one frame) */
  setInterval(function () {
    if (!loaderLifted && loadedFlag[0] && fontsReady && keysLoaded >= Math.ceil(keyframes.length * 0.75)) liftLoader();
  }, 400);

  /* ---------- Canvas sizing and drawing ---------- */
  var cw = 0, ch = 0, needDraw = true;
  function sizeCanvas() {
    var media = intro.querySelector(".intro__media");
    var r = media.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, portrait ? 3 : 2);
    cw = Math.max(1, Math.round(r.width * dpr));
    ch = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    needDraw = true;
  }
  function nearestLoaded(i) {
    if (loadedFlag[i]) return i;
    for (var d = 1; d < COUNT; d++) {
      if (i - d >= 0 && loadedFlag[i - d]) return i - d;
      if (i + d < COUNT && loadedFlag[i + d]) return i + d;
    }
    return -1;
  }
  function draw() {
    var idx = Math.round(Math.max(0, Math.min(1, smoothP / FRAME_END)) * (COUNT - 1));
    var use = nearestLoaded(idx);
    ctx.fillStyle = "#16140F";
    ctx.fillRect(0, 0, cw, ch);
    if (use === -1) return;
    var img = frames[use];
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var fx = portrait ? 0.5 : 0.5, fy = 0.5;
    var x = Math.min(0, Math.max(cw - w, cw / 2 - w * fx));
    var y = Math.min(0, Math.max(ch - h, ch / 2 - h * fy));
    ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    intro.classList.add("has-canvas", "has-frame");
  }

  /* ---------- Scroll progress, smoothing, captions ---------- */
  var captions = Array.prototype.slice.call(document.querySelectorAll(".intro__caption"));
  var railItems = Array.prototype.slice.call(document.querySelectorAll("#railList li"));
  var railFill = document.getElementById("railFill");
  var targetP = 0, smoothP = 0, lastStage = -1, ticking = false, lastTs = 0;

  function rawProgress() {
    var r = intro.getBoundingClientRect();
    var total = intro.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, -r.top / total));
  }
  function applyStage(p) {
    var stage = 0;
    for (var i = 0; i < STAGE_AT.length; i++) if (p >= STAGE_AT[i]) stage = i;
    if (stage !== lastStage) {
      lastStage = stage;
      captions.forEach(function (c, i) { c.classList.toggle("is-active", i === stage); });
      railItems.forEach(function (li, i) {
        li.classList.toggle("is-active", i === stage);
        li.classList.toggle("is-done", i < stage);
      });
    }
    railFill.style.transform = "scaleX(" + Math.min(1, p / FINAL_AT).toFixed(4) + ")";
    intro.classList.toggle("is-started", p > 0.012);
    intro.classList.toggle("is-final", p >= FINAL_AT);
  }
  function tick(ts) {
    ticking = false;
    var dt = lastTs ? Math.min(ts - lastTs, 100) : 16;
    lastTs = ts;
    var k = 1 - Math.exp(-dt / 78);
    var prev = smoothP;
    smoothP += (targetP - smoothP) * k;
    if (Math.abs(targetP - smoothP) < 0.0004) smoothP = targetP;
    if (needDraw || smoothP !== prev) { draw(); needDraw = false; }
    applyStage(smoothP);
    if (smoothP !== targetP) requestTick();
  }
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }
  function onScroll() {
    targetP = rawProgress();
    pump();
    requestTick();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    portrait = window.matchMedia("(max-aspect-ratio: 5/6)").matches;
    sizeCanvas(); onScroll();
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { lastTs = 0; needDraw = true; requestTick(); }
  });

  /* Skip intro: native anchor works; also ensure it lands on the calculator */
  document.getElementById("skipIntro").addEventListener("click", function (e) {
    var target = document.getElementById("calculator");
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });

  sizeCanvas();
  targetP = smoothP = rawProgress();
  pump();
  requestTick();
})();
