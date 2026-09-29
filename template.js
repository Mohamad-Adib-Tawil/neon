/* ============================================================
   ليلة النيون — Neon Night Birthday (neon)
   script.js — config, fill, neon flicker-ON choreography,
   ring-fit name placement, particles
   ============================================================ */

const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {};

(function () {
  "use strict";

  var C = WEDDING_CONFIG;
  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* موضع حلقة النيون وشمعات الكيكة داخل الصورة (نِسَب من 1080×1920) */
  var IMG_W = 1080, IMG_H = 1920;
  var RING = { cx: 0.519, cy: 0.372, d: 0.46 };       // d = قطر الفراغ الداخلي (نسبة من عرض الصورة)
  var SPARKLER = { x: 0.506, y: 0.617 };              // لهب شمعات الكيكة

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  /* الخانة المفرَّغة عمداً تُفرِّغ العنصر — النص المكتوب بالقالب مجرد احتياط لخانة لم تُضبط أصلاً */
  function setText(id, val) { var el = $(id); if (el && val != null) el.textContent = val; }
  /* يضبط النص أو يخفي العنصر — لا يبقى placeholder «—» ظاهراً أبداً */
  function setOrHide(id, val, ancestorSel) {
    var el = $(id);
    if (!el) return;
    if (val != null && String(val) !== "") { el.textContent = val; return; }
    /* خانة مفرَّغة داخل عنوان مزخرف تترك شريطيه معلّقين — نُخفي الحاوية كلها */
    var target = (ancestorSel && el.closest(ancestorSel)) || el;
    target.style.display = "none";
  }

  var AR_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  function toArabicDigits(n) {
    return String(n).replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; });
  }
  /* تطبيع الأرقام الهندية إلى لاتينية قبل parseInt — كي يعمل عمر مثل "٢٥" من الإعدادات */
  function normalizeDigits(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return String(AR_DIGITS.indexOf(d)); });
  }
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  var celebrant = C.celebrant || C.groom || "";
  var host = C.host || C.bride || "";
  var greeting = C.verse || C.greeting || "";

  /* ---------------- fill content (textContent only) ---------------- */
  function fillContent() {
    var nn = $("neonNameIn");
    if (nn && celebrant) nn.textContent = celebrant;
    var hn = document.querySelector("#celebrantName .nn-in");
    if (hn && celebrant) hn.textContent = celebrant;

    setText("heroSub", C.heroSub);
    setOrHide("heroDate", C.dateText);
    setOrHide("verseText", greeting);
    setOrHide("invitationText", C.invitationText);
    setOrHide("weddingDate", C.dateText);
    setOrHide("weddingTime", C.timeText);
    setOrHide("venueName", C.venueName);
    setOrHide("venueAddr", C.venueAddr);
    setOrHide("closingNote", C.closingNote);
    setOrHide("closingHashtag", C.hashtag);
    setOrHide("contactLabel", C.contactLabel, ".sec-title");

    document.title = "دعوة " + (C.eventTitle || ("عيد ميلاد " + celebrant));

    /* العمر — أرقام هندية كبيرة في الواجهة + شارة صغيرة على الغلاف؛
       يختفيان معاً بأناقة إن غاب العمر (مع تطبيع الأرقام الهندية أولاً) */
    var ageEl = $("heroAge"), ageNum = $("ageNum");
    var coverAge = $("coverAge"), coverAgeNum = $("coverAgeNum");
    var ageVal = (C.age != null && C.age !== "") ? parseInt(normalizeDigits(C.age), 10) : NaN;
    if (!isNaN(ageVal)) {
      if (ageNum) ageNum.textContent = toArabicDigits(ageVal);
      if (coverAgeNum) coverAgeNum.textContent = toArabicDigits(ageVal);
    } else {
      if (ageEl) ageEl.style.display = "none";
      if (coverAge) coverAge.style.display = "none";
    }

    /* سطر الداعين */
    var hostText = host ? "بدعوة من " + host : (C.closingFamilies || "");
    var hostLine = $("hostLine");
    if (hostText) setText("hostLine", hostText);
    else if (hostLine) hostLine.style.display = "none";

    /* سطر الخاتمة — الإعداد الصريح أولاً، ويختفي كلياً إن غاب */
    var famText = C.closingFamilies || hostText;
    setOrHide("closingFamilies", famText);

    var mapBtn = $("mapBtn");
    if (mapBtn) {
      if (C.mapUrl) { mapBtn.href = C.mapUrl; }
      else { mapBtn.style.display = "none"; }
    }

    /* contact: tel: — يختفي القسم كله إن غاب الرقم */
    var contactBox = $("contactBox");
    var contactLink = $("contactLink");
    var digits = C.contactPhone ? String(C.contactPhone).replace(/[^\d+]/g, "") : "";
    if (C.whatsappUrl && contactLink) {
      var waMessage = C.whatsappMessage || ("مرحبًا، أود الاستفسار عن " + (C.eventTitle || "الدعوة") + ".");
      contactLink.href = C.whatsappUrl + "?text=" + encodeURIComponent(waMessage);
      contactLink.target = "_blank";
      contactLink.rel = "noopener noreferrer";
      contactLink.setAttribute("aria-label", "تواصل عبر واتساب");
      setText("contactPhoneText", "واتساب");
      setOrHide("contactName", C.contactName || C.contactLabel);
      if (contactBox) contactBox.style.display = "";
    } else if (digits && contactLink) {
      contactLink.href = "tel:" + digits;
      setText("contactPhoneText", C.contactPhone);
      setOrHide("contactName", C.contactName || C.contactLabel);
    } else if (contactBox) {
      contactBox.style.display = "none";
    }

    buildTimeline(C.program);
    buildNotes(C.notes);
    loadImages();
  }

  /* program/notes هما الحقلان الوحيدان اللذان يصلان من الخادم مهرَّبين مسبقاً —
     نعرضهما بـ innerHTML (مطابقة معالجة rosegold) كي تظهر كيانات مثل &amp; صحيحة؛
     كل الحقول الأخرى تبقى textContent */
  function buildTimeline(items) {
    var ul = $("timeline");
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = "";
    items.forEach(function (it) {
      if (!it) return;
      var li = document.createElement("li");
      li.className = "tl-item";
      var dot = document.createElement("span");
      dot.className = "tl-dot";
      dot.setAttribute("aria-hidden", "true");
      var time = document.createElement("span");
      time.className = "tl-time";
      time.innerHTML = it.time || "";
      var title = document.createElement("span");
      title.className = "tl-title";
      title.innerHTML = it.title || "";
      li.appendChild(dot); li.appendChild(time); li.appendChild(title);
      ul.appendChild(li);
    });
    if (!items.length) {
      var card = ul.closest(".timeline-card");
      if (card) card.style.display = "none";
    }
  }

  function buildNotes(items) {
    var ul = $("notesList");
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = "";
    items.forEach(function (txt) {
      if (!txt) return;
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.innerHTML = txt;   /* مهرَّب مسبقاً من الخادم — مثل rosegold */
      li.appendChild(span);
      ul.appendChild(li);
    });
    /* «الملاحظة البارزة» تحقنها المنصّة داخل هذا القسم قبل القائمة — ننقلها خارجه
       قبل إخفائه، وإلا اختفت معه حين لا تكون هناك ملاحظات عادية */
    if (!items.length) {
      var card = ul.closest(".notes-card");
      if (card) {
        var note = card.querySelector("#da3wa-note");
        if (note && card.parentNode) card.parentNode.insertBefore(note, card);
        card.style.display = "none";
      }
    }
  }

  /* ---------------- image hooks (تظهر فقط عند نجاح التحميل) ---------------- */
  function loadImages() {
    var imgs = C.images || {};

    var coverBg = $("coverBg");
    if (coverBg && imgs.background) {
      var bgImg = coverBg.querySelector("img.bg-photo");
      if (bgImg) {
        bgImg.onload = function () { bgImg.classList.add("is-shown"); };
        bgImg.onerror = function () { bgImg.classList.remove("is-shown"); };
        bgImg.src = imgs.background;
      }
    }

    var box = $("heroPhoto");
    var im = $("heroPhotoImg");
    if (box && im && imgs.hero) {
      im.onload = function () { box.hidden = false; placeAll(); };
      im.onerror = function () { box.hidden = true; };
      im.src = imgs.hero;
    }

    /* صورة القاعة — تُفتح فقط بعد نجاح التحميل؛ الفشل يترك البطاقة كما هي */
    var venueBox = $("venuePhoto");
    if (venueBox && imgs.venue) {
      var vProbe = new Image();
      vProbe.onload = function () {
        venueBox.style.backgroundImage = 'url("' + imgs.venue + '")';
        venueBox.classList.add("has-img");
        placeAll();   /* ارتفاع جديد داخل الصفحة — أعِد قياس الحلقة كما يفعل هوك الـ hero */
      };
      vProbe.src = imgs.venue;
    }
  }

  /* ============================================================
     RING-FIT — إسقاط إحداثيات الحلقة عبر تحويل object-fit: cover
     يضع الاسم داخل الحلقة المصوّرة مهما كان قياس الشاشة
     ============================================================ */
  function coverMath(w, h) {
    /* شاشات عريضة (نفس عتبة CSS: aspect ≥ 7/10) → contain بدل cover */
    var wide = w / h >= 0.7;
    var s = wide ? Math.min(w / IMG_W, h / IMG_H) : Math.max(w / IMG_W, h / IMG_H);
    var iw = IMG_W * s, ih = IMG_H * s;
    return { ox: (w - iw) / 2, oy: (h - ih) / 2, iw: iw, ih: ih };
  }

  /* تصغير الخط حتى يتّسع الاسم داخل قرص الحلقة
     نقيس على الابن .nn-in — القياس على الأب يتضخّم بسبب هالة ::before */
  function fitText(el, maxW, maxH) {
    var inner = el.querySelector(".nn-in") || el;
    var fs = Math.max(18, Math.min(76, Math.round(maxW * 0.36)));
    el.style.fontSize = fs + "px";
    var guard = 32;
    while (guard-- > 0 && fs > 14 && (inner.scrollWidth > maxW + 2 || inner.scrollHeight > maxH + 2)) {
      fs -= 2;
      el.style.fontSize = fs + "px";
    }
  }

  function placeRing(container, nameEl) {
    if (!container) return null;
    var w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return null;
    var m = coverMath(w, h);
    var cx = m.ox + RING.cx * m.iw;
    var cy = m.oy + RING.cy * m.ih;
    var d = RING.d * m.iw;
    if (nameEl) {
      nameEl.style.left = cx + "px";
      nameEl.style.top = cy + "px";
      nameEl.style.width = Math.round(d * 0.84) + "px";
      fitText(nameEl, Math.round(d * 0.84), Math.round(d * 0.64));
    }
    container.style.setProperty("--rx", cx + "px");
    container.style.setProperty("--ry", cy + "px");
    container.style.setProperty("--rd", Math.round(d) + "px");
    return { cx: cx, cy: cy, d: d, m: m };
  }

  function placeAll() {
    /* الغلاف: الاسم داخل .scene-photo (inset:0 = قياس الغلاف نفسه) */
    var cover = $("cover");
    var coverScene = $("coverScene");
    if (cover && coverScene && cover.parentNode) {
      var g = placeRing(cover, $("neonName"));
      if (g) {
        cover.style.setProperty("--rx", g.cx + "px");
        cover.style.setProperty("--ry", g.cy + "px");
        cover.style.setProperty("--rd", Math.round(g.d) + "px");
      }
    }
    /* الـ hero: نفس الحساب على .hero-scene + فاصل يدفع المحتوى تحت الحلقة
       تمريرتان لأن ارتفاع الفاصل يغيّر ارتفاع الحاوية */
    var heroScene = $("heroScene");
    var spacer = $("heroSpacer");
    for (var i = 0; i < 2; i++) {
      var r = placeRing(heroScene, $("celebrantName"));
      if (r && spacer) spacer.style.height = Math.round(r.cy + r.d * 0.62) + "px";
    }
  }

  /* موضع شرارة الكيكة بإحداثيات الشاشة (الغلاف مثبَّت على 0,0) */
  function sparklerPos() {
    var cover = $("cover");
    if (!cover) return { x: window.innerWidth / 2, y: window.innerHeight * 0.62 };
    var m = coverMath(cover.clientWidth, cover.clientHeight);
    return { x: m.ox + SPARKLER.x * m.iw, y: m.oy + SPARKLER.y * m.ih };
  }

  /* ---------------- countdown (أرقام هندية) ---------------- */
  function setupCountdown() {
    var target = C.date ? new Date(C.date) : null;
    if (!target || isNaN(target.getTime())) return;
    var els = { d: $("cdDays"), h: $("cdHours"), m: $("cdMins"), s: $("cdSecs") };
    var cd = $("countdown"), arrived = $("cdArrived");
    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        if (cd) cd.style.display = "none";
        if (arrived) arrived.hidden = false;
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600);  s -= h * 3600;
      var m = Math.floor(s / 60);    s -= m * 60;
      if (els.d) els.d.textContent = toArabicDigits(pad2(d));
      if (els.h) els.h.textContent = toArabicDigits(pad2(h));
      if (els.m) els.m.textContent = toArabicDigits(pad2(m));
      if (els.s) els.s.textContent = toArabicDigits(pad2(s));
    }
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ============================================================
     PARTICLE ENGINE — طبقة واحدة، سقف صارم 40 عنصراً
     ============================================================ */
  var MAX_LIVE = 40;
  var live = 0;
  var fxLayer = null;

  function ensureLayer() {
    if (fxLayer) return fxLayer;
    fxLayer = document.createElement("div");
    fxLayer.className = "fx-layer";
    fxLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(fxLayer);
    return fxLayer;
  }

  /* إزالة مضمونة: animationend + مهلة أمان — العدّاد لا يعلق أبداً */
  function reapLater(el, ms) {
    var dead = false;
    function reap() {
      if (dead) return;
      dead = true;
      live--;
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    el.addEventListener("animationend", function (e) {
      if (e.target !== el) return;   /* تجاهل حركات الأبناء */
      reap();
    });
    setTimeout(reap, ms);
  }

  /* kind: twinkle | fount | rain | heart | rise */
  function spawnFx(kind, x, y, opts) {
    if (REDUCED || live >= MAX_LIVE) return;
    opts = opts || {};
    var el = document.createElement("span");
    el.className = "fx fx-" + kind;
    el.style.setProperty("--x", x + "px");
    el.style.setProperty("--y", y + "px");
    if (opts.tx != null) el.style.setProperty("--tx", opts.tx + "px");
    if (opts.ty != null) el.style.setProperty("--ty", opts.ty + "px");
    if (opts.mx != null) el.style.setProperty("--mx", opts.mx + "px");
    if (opts.my != null) el.style.setProperty("--my", opts.my + "px");
    if (opts.dur) el.style.animationDuration = opts.dur + "s";
    if (opts.scale) el.style.width = el.style.height = opts.scale + "px";
    live++;
    reapLater(el, ((opts.dur || 2) * 1000) + 3000);
    ensureLayer().appendChild(el);
  }

  /* نافورة شرارات من شمعات الكيكة — تصعد بقوس نحو ذروة (--mx/--my) ثم تسقط */
  function fountainWave(x, y, count) {
    for (var i = 0; i < count; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;   /* مخروط للأعلى */
      var r = 80 + Math.random() * 150;
      var mx = x + Math.cos(a) * r;
      var my = y + Math.sin(a) * r;
      spawnFx("fount", x, y, {
        mx: mx, my: my,
        tx: mx + (Math.random() - 0.5) * 46,
        ty: my + 90 + Math.random() * 120,
        dur: 0.95 + Math.random() * 0.5,
      });
    }
  }

  /* مطر ذهبي من أعلى الشاشة — فخامة تعبر الذوبان إلى الواجهة */
  function goldRainTick(count) {
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < count; i++) {
      var x = Math.random() * w;
      spawnFx("rain", x, -20 - Math.random() * 40, {
        tx: x + (Math.random() - 0.5) * 60,
        ty: h * 0.55 + Math.random() * h * 0.4,
        dur: 1.2 + Math.random() * 0.9,
      });
    }
  }

  /* قلوب + بريق للشعار */
  function burstHearts(x, y) {
    var n = 6 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) {
      var a = -Math.PI * (0.15 + Math.random() * 0.7);
      var r = 46 + Math.random() * 60;
      var kind = i % 3 === 2 ? "twinkle" : "heart";
      spawnFx(kind, x, y, { tx: x + Math.cos(a) * r, ty: y + Math.sin(a) * r, dur: 1 + Math.random() * 0.5 });
    }
  }

  /* ---------------- أثر البريق مع اللمس ---------------- */
  function setupTrail() {
    if (REDUCED) return;
    var last = 0, lastX = -99, lastY = -99;
    function onMove(e) {
      var now = Date.now();
      if (now - last < 90) return;
      var p = e.touches ? e.touches[0] : e;
      if (!p) return;
      var dx = p.clientX - lastX, dy = p.clientY - lastY;
      if (dx * dx + dy * dy < 220) return;
      /* لا بريق فوق البطاقات — تبقى القراءة نظيفة */
      if (e.target && e.target.closest && e.target.closest(".card")) return;
      last = now; lastX = p.clientX; lastY = p.clientY;
      spawnFx("twinkle", p.clientX + (Math.random() - 0.5) * 14, p.clientY + (Math.random() - 0.5) * 14,
        { scale: 6 + Math.random() * 7 });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
  }

  /* ---------------- بريق صاعد محيطي ---------------- */
  function setupAmbientRise() {
    if (REDUCED) return;
    setInterval(function () {
      if (document.hidden || live > MAX_LIVE - 10) return;
      var x = Math.random() * window.innerWidth;
      spawnFx("rise", x, window.innerHeight + 16, {
        tx: x + (Math.random() - 0.5) * 90,
        ty: -40,
        dur: 6 + Math.random() * 3.5,
      });
    }, 3600);
  }

  /* ============================================================
     NEON FLICKER-ON CHOREOGRAPHY
     لمسة → ارتجاف الاشتعال (يتلعثم، يلتقط، يشتعل) 1.45ث
     → وميض وتفتّح توهج الحلقة + شرارات من شمعة الكيكة
     → توهّج كامل ثابت → ذوبان إلى الـ hero فوق المشهد نفسه
     ============================================================ */
  function setupOpen() {
    var cover = $("cover");
    var invite = $("invite");
    var btn = $("openBtn");
    if (!cover || !invite || !btn) return;
    var opened = false;

    function finish() {
      cover.classList.add("is-done");
      document.body.classList.remove("locked");
      invite.setAttribute("aria-hidden", "false");
      window.scrollTo(0, 0);
      placeAll();   /* بعد فك القفل قد يتغيّر ارتفاع الشاشة الفعلي */
      var hero = document.querySelector(".hero.reveal");
      if (hero) hero.classList.add("is-visible");
      setTimeout(function () {
        if (cover.parentNode) cover.parentNode.removeChild(cover);
      }, 1300);
    }

    function openInvite() {
      if (opened) return;
      opened = true;
      cover.classList.add("is-open");

      if (REDUCED) {
        cover.classList.add("is-revealed");
        setTimeout(finish, 700);
        return;
      }

      var sp = sparklerPos();

      /* 1) الارتجاف الكهربائي: يتلعثم ثم يلتقط */
      cover.classList.add("is-arming");

      /* 2) الاشتعال الكامل: وميض قصير (~400ms) + نافورة شرارات على موجات
            متدرّجة من شمعات الكيكة — تصعد بقوس ثم تسقط */
      setTimeout(function () {
        cover.classList.add("is-flash");
        fountainWave(sp.x, sp.y, 10);
      }, 1350);
      setTimeout(function () { fountainWave(sp.x, sp.y, 8); }, 1600);
      setTimeout(function () { fountainWave(sp.x, sp.y, 7); }, 1850);

      /* 3) الثبات على التوهّج — الاسم المضاء يتنفس قبل الذوبان */
      setTimeout(function () {
        cover.classList.add("is-revealed");
      }, 1750);

      /* 4) مطر ذهبي بعد الوميض — الفخامة تستمر عبر الذوبان إلى الواجهة */
      setTimeout(function () { goldRainTick(6); }, 1900);
      setTimeout(function () { goldRainTick(5); }, 2500);

      /* 5) الذوبان إلى الدعوة فوق المشهد نفسه */
      setTimeout(finish, 3900);
    }

    btn.addEventListener("click", openInvite);
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInvite(); }
    });
  }

  /* ---------------- بالون القلب — لمسة فرح ---------------- */
  function setupEmblem() {
    var emblem = $("discoEmblem");
    if (!emblem) return;
    emblem.addEventListener("click", function () {
      var r = emblem.getBoundingClientRect();
      burstHearts(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  /* ---------------- scroll reveal ---------------- */
  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    /* استرجاع التمرير بعد إعادة التحميل يكسر الغلاف المقفول — عُد للقمة دائماً */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    fillContent();
    placeAll();
    setupCountdown();
    setupOpen();
    setupEmblem();
    setupReveal();
    setupTrail();
    setupAmbientRise();

    /* إعادة القياس بعد جهوزية الخط (عرض الاسم يتغيّر مع Lalezar) وعند تغيّر القياس */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(placeAll);
    }
    var rT = null;
    window.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(placeAll, 120);
    });
    window.addEventListener("orientationchange", function () { setTimeout(placeAll, 250); });
  });
})();
