/* Malkiyat Associates & Builders, Design 3 (The Dusk House)
   Hybrid smart loader + pinned scroll frame engine + calculator + lightbox.
   No reduced-motion gating: the sequence works with reduced motion ON. */
(function () {
  "use strict";

  /* ============ EDITABLE CONFIG ============ */
  var CALC = {
    rates: { grey: 4000, silver: 6500, gold: 7500, platinum: 8500 }, // Rs per sq ft of covered area
    baseArea: { "5": 1100, "10": 2500, "20": 4500 },                  // floor 1 covered area by plot (marla key)
    otherPerMarla: 250,                                               // floor 1 sq ft per marla for Other size
    floor2Factor: 1.0,                                                // floor 2 adds this share of floor 1
    floor3Factor: 0.95,                                               // floor 3 adds this share of floor 1
    mumty: 300,                                                       // sq ft, added when floors is 2 or 3
    whatsapp: "923315161679"
  };
  var SEQ = {
    frames: 143,
    dir: "frames/seq3/",
    stageAt: [0, 0.30, 0.58, 0.84] // caption thresholds (slower stage changes)
  };

  /* ============ Mobile nav ============ */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ============ Calculator ============ */
  var state = { buildType: "finishing", pkg: "gold", plot: "10", floors: 2 };
  var otherWrap = document.getElementById("otherWrap");
  var otherInput = document.getElementById("otherMarla");
  var packageGroup = document.getElementById("packageGroup");
  var resArea = document.getElementById("resArea");
  var resPrice = document.getElementById("resPrice");
  var resWork = document.getElementById("resWork");
  var waBtn = document.getElementById("waEstimate");

  function fmtNum(n) { return n.toLocaleString("en-US"); }
  function fmtPrice(total) {
    if (total >= 10000000) {
      var cr = Math.round(total / 100000) / 100; // round to 0.01 crore, float safe
      return "Rs " + cr.toFixed(2) + " crore";
    }
    var lk = Math.round(total / 10000) / 10;
    return "Rs " + lk.toFixed(1) + " lakh";
  }
  function calc() {
    var marla, base;
    if (state.plot === "other") {
      marla = Math.max(1, parseInt(otherInput.value, 10) || 0);
      base = marla * CALC.otherPerMarla;
    } else {
      marla = parseInt(state.plot, 10);
      base = CALC.baseArea[state.plot];
    }
    var area = base;
    if (state.floors >= 2) area += base * CALC.floor2Factor;
    if (state.floors >= 3) area += base * CALC.floor3Factor;
    var mumty = state.floors >= 2 ? CALC.mumty : 0;
    area += mumty;
    area = Math.round(area);
    var rate = state.buildType === "grey" ? CALC.rates.grey : CALC.rates[state.pkg];
    var total = area * rate;
    resArea.textContent = fmtNum(area);
    resPrice.textContent = fmtPrice(total);
    var work = "Rs " + fmtNum(rate) + " per sq ft x " + fmtNum(area) + " sq ft";
    if (mumty) work += ", including a " + mumty + " sq ft mumty";
    work += ". A first guide; your written quotation follows a site visit.";
    resWork.textContent = work;
    var typeLabel = state.buildType === "grey" ? "Grey structure" : "With finishing, " + state.pkg.charAt(0).toUpperCase() + state.pkg.slice(1) + " package";
    var plotLabel = state.plot === "other" ? (marla + " Marla") : (state.plot === "20" ? "1 Kanal (20 Marla)" : state.plot + " Marla");
    var msg = "Assalamualaikum, I used the Malkiyat cost calculator.\n" +
      "What I want: " + typeLabel + "\n" +
      "Plot size: " + plotLabel + "\n" +
      "Floors: " + state.floors + "\n" +
      "Covered area: " + fmtNum(area) + " sq ft\n" +
      "Estimate: " + fmtPrice(total) + " (" + work.split(". A first guide")[0] + ")\n" +
      "Please arrange a site visit and written quotation.";
    waBtn.href = "https://wa.me/" + CALC.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll(".seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      seg.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-on"); });
      btn.classList.add("is-on");
      var group = seg.getAttribute("data-group");
      if (group === "buildType") {
        state.buildType = btn.getAttribute("data-value");
        var grey = state.buildType === "grey";
        packageGroup.style.opacity = grey ? ".35" : "1";
        packageGroup.querySelectorAll("button").forEach(function (b) { b.disabled = grey; });
      } else if (group === "pkg") {
        state.pkg = btn.getAttribute("data-value");
      } else if (group === "plot") {
        state.plot = btn.getAttribute("data-value");
        otherWrap.hidden = state.plot !== "other";
      } else if (group === "floors") {
        state.floors = parseInt(btn.getAttribute("data-value"), 10);
      }
      calc();
    });
  });
  if (otherInput) otherInput.addEventListener("input", calc);
  calc();

  /* ============ Lightbox ============ */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + items.length) % items.length;
    lbImg.src = items[lbIndex].getAttribute("data-full");
  }
  function lbOpen(i) { lbShow(i); lb.hidden = false; document.body.classList.add("is-locked"); }
  function lbClose() { lb.hidden = true; document.body.classList.remove("is-locked"); }
  items.forEach(function (it, i) { it.addEventListener("click", function () { lbOpen(i); }); });
  document.getElementById("lbClose").addEventListener("click", lbClose);
  document.getElementById("lbPrev").addEventListener("click", function () { lbShow(lbIndex - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { lbShow(lbIndex + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    if (e.key === "ArrowRight") lbShow(lbIndex + 1);
  });

  /* ============ Loader + scroll sequence engine ============ */
  var intro = document.getElementById("intro");
  var canvas = document.getElementById("introCanvas");
  var loader = document.getElementById("loader");
  var loaderFill = document.getElementById("loaderFill");
  var loaderPct = document.getElementById("loaderPct");
  var loaderEnter = document.getElementById("loaderEnter");
  if (!intro || !canvas) { liftLoader(); return; }
  var ctx = canvas.getContext && canvas.getContext("2d", { alpha: false });
  if (!ctx) { liftLoader(); return; }

  var loaderDone = false;
  function liftLoader() {
    if (loaderDone) return;
    loaderDone = true;
    window.__loaderDone = true;
    document.body.classList.remove("is-locked");
    if (loader) loader.classList.add("is-done");
  }

  // WebP support test; without WebP we keep the static poster version.
  var webpOk = null;
  var probe = new Image();
  probe.onload = function () { webpOk = probe.width === 1; startEngine(); };
  probe.onerror = function () { webpOk = false; startEngine(); };
  probe.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  setTimeout(function () { if (webpOk === null) { webpOk = true; startEngine(); } }, 1500);

  var engineStarted = false;
  function startEngine() {
    if (engineStarted) return;
    engineStarted = true;
    if (!webpOk) { liftLoader(); return; } // static poster fallback, content fully usable

    var N = SEQ.frames;
    var conn = navigator.connection || {};
    var slow = !!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || "") ||
      (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 8);
    var portrait = window.matchMedia("(max-aspect-ratio: 5/6)").matches;
    var tier;
    if (portrait || window.innerWidth < 760) tier = "m";
    else if (!slow && window.innerWidth >= 1400 && (window.devicePixelRatio || 1) > 1) tier = "hd";
    else tier = "d";

    intro.classList.add("intro--live", "intro--scroll");
    document.body.classList.add("is-locked");

    var frames = new Array(N), loaded = new Array(N).fill(false), loading = new Array(N).fill(false);
    var inFlight = 0;
    var target = 0, smooth = 0, dirn = 1, lastDrawn = -1, dirty = true;
    var lifted = false;

    // Keyframes: first, last, every 8th
    var keyList = [], keySet = {};
    [0, N - 1].concat((function () { var a = []; for (var i = 0; i < N; i += 8) a.push(i); return a; })())
      .forEach(function (i) { if (!keySet[i]) { keySet[i] = true; keyList.push(i); } });
    var keyLoaded = 0, frame0Decoded = false, fontsReady = false;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontsReady = true; maybeLift(); });
    else fontsReady = true;

    function pad(i) { return ("00" + i).slice(-3); }
    function url(i) { return SEQ.dir + tier + "/f" + pad(i) + ".webp"; }

    function updateLoader() {
      var pct = Math.round((keyLoaded / keyList.length) * 100);
      if (loaderFill) loaderFill.style.width = pct + "%";
      if (loaderPct) loaderPct.textContent = pct;
    }
    function maybeLift() {
      if (lifted) return;
      if (frame0Decoded && keyLoaded >= keyList.length && fontsReady) doLift();
    }
    function doLift() {
      if (lifted) return;
      lifted = true;
      liftLoader();
      pump();
    }
    setTimeout(doLift, 4000); // hard cap
    setTimeout(function () { if (!lifted && loaderEnter) loaderEnter.hidden = false; }, 2500);
    if (loaderEnter) loaderEnter.addEventListener("click", doLift);

    function pickNext() {
      var i;
      // 1) keyframes first
      for (i = 0; i < keyList.length; i++) { var k = keyList[i]; if (!loaded[k] && !loading[k]) return k; }
      // 2) nearest to target, direction aware, buffer ahead
      var base = Math.round(target);
      for (var d = 0; d < N; d++) {
        var fwd = base + dirn * d, back = base - dirn * d;
        if (fwd >= 0 && fwd < N && !loaded[fwd] && !loading[fwd]) return fwd;
        if (back >= 0 && back < N && !loaded[back] && !loading[back]) return back;
        if (d > 60) break;
      }
      for (i = 0; i < N; i++) if (!loaded[i] && !loading[i]) return i;
      return -1;
    }
    function pump() {
      while (inFlight < 6) {
        var idx = pickNext();
        if (idx === -1) break;
        (function (i) {
          loading[i] = true; inFlight++;
          var img = new Image();
          img.decoding = "async";
          img.onload = function () {
            var done = function () {
              inFlight--; loading[i] = false; frames[i] = img; loaded[i] = true;
              if (i === 0) { frame0Decoded = true; }
              if (keySet[i]) { keyLoaded++; updateLoader(); }
              dirty = true; maybeLift(); pump();
            };
            if (img.decode) img.decode().then(done, done); else done();
          };
          img.onerror = function () {
            inFlight--; loading[i] = false; loaded[i] = true; // mark done, nearest-loaded fallback covers it
            if (keySet[i]) { keyLoaded++; updateLoader(); }
            maybeLift(); pump();
          };
          img.src = url(i);
        })(idx);
      }
    }
    updateLoader();
    pump();

    /* ----- canvas ----- */
    var W = 0, H = 0;
    function sizeCanvas() {
      var r = canvas.getBoundingClientRect();
      var cap = (portrait || window.innerWidth < 760) ? 3 : 2;
      var dpr = Math.min(window.devicePixelRatio || 1, cap);
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      dirty = true;
    }
    function nearestLoaded(idx) {
      if (loaded[idx] && frames[idx]) return idx;
      for (var d = 1; d < N; d++) {
        if (idx + d < N && loaded[idx + d] && frames[idx + d]) return idx + d;
        if (idx - d >= 0 && loaded[idx - d] && frames[idx - d]) return idx - d;
      }
      return -1;
    }
    function draw(idx) {
      var use = nearestLoaded(idx);
      if (use === -1) return;
      var img = frames[use];
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var s = Math.max(W / iw, H / ih);
      var dw = Math.round(iw * s), dh = Math.round(ih * s);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh);
      lastDrawn = idx;
      if (!intro.classList.contains("has-frame")) intro.classList.add("has-frame");
    }

    /* ----- captions + rail ----- */
    var captions = intro.querySelectorAll(".intro__caption");
    var railItems = document.querySelectorAll("#railList li");
    var railFill = document.getElementById("railFill");
    var stage = -1;
    function setStage(p) {
      var s = 0;
      for (var i = 0; i < SEQ.stageAt.length; i++) if (p >= SEQ.stageAt[i]) s = i;
      if (railFill) railFill.style.transform = "scaleX(" + Math.min(1, p).toFixed(4) + ")";
      if (s === stage) return;
      stage = s;
      captions.forEach(function (c, i) { c.classList.toggle("is-active", i === s); });
      railItems.forEach(function (li, i) {
        li.classList.toggle("is-active", i === s);
        li.classList.toggle("is-done", i < s);
      });
    }

    /* ----- scroll + smoothing loop ----- */
    function progress() {
      var r = intro.getBoundingClientRect();
      var denom = intro.offsetHeight - window.innerHeight;
      if (denom <= 0) return 1;
      var p = -r.top / denom;
      return Math.min(1, Math.max(0, p));
    }
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(intro);
    }
    var lastT = 0;
    function loop(t) {
      requestAnimationFrame(loop);
      if (!visible) { lastT = t; return; }
      var dt = lastT ? Math.min(t - lastT, 100) : 16;
      lastT = t;
      target = progress() * (N - 1);
      var prev = smooth;
      var k = 1 - Math.exp(-dt / 80);
      smooth += (target - smooth) * k;
      if (Math.abs(target - smooth) < 0.01) smooth = target;
      if (smooth !== prev) dirn = smooth > prev ? 1 : -1;
      var idx = Math.round(smooth);
      if (idx !== lastDrawn || dirty) { draw(idx); dirty = false; }
      var p = smooth / (N - 1);
      setStage(p);
      intro.classList.toggle("is-started", p > 0.012);
      intro.classList.toggle("is-final", p >= 0.985);
      if (lifted && inFlight < 6) pump();
    }
    sizeCanvas();
    target = progress() * (N - 1);
    smooth = target;
    draw(Math.round(smooth));
    requestAnimationFrame(loop);
    window.addEventListener("resize", function () { portrait = window.matchMedia("(max-aspect-ratio: 5/6)").matches; sizeCanvas(); });
    window.addEventListener("scroll", function () { if (lifted && inFlight < 6) pump(); }, { passive: true });
  }
})();
