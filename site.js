(function () {
  "use strict";
  var config = (window.__INVITE__ && window.__INVITE__.config) || {};
  var whatsappUrl = String(config.whatsappUrl || "");
  function waLink(message) {
    return whatsappUrl + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (config.assets && config.assets.scene) {
      document.querySelectorAll(".scene-photo img.ph").forEach(function (image) { image.src = config.assets.scene; });
    }
    var shareImage = document.querySelector('meta[property="og:image"]');
    var twitterImage = document.querySelector('meta[name="twitter:image"]');
    var canonical = document.querySelector('meta[property="og:url"]');
    if (config.assets && config.assets.share) {
      if (shareImage) shareImage.content = new URL(config.assets.share, window.location.href).href;
      if (twitterImage) twitterImage.content = new URL(config.assets.share, window.location.href).href;
    }
    if (canonical) canonical.content = window.location.href;
    var contact = document.getElementById("contactLink");
    var contactText = document.getElementById("contactPhoneText");
    if (contact && whatsappUrl) {
      contact.href = waLink(config.whatsappMessage || "");
      contact.target = "_blank";
      contact.rel = "noopener noreferrer";
      if (contactText) contactText.textContent = "واتساب";
      contact.setAttribute("aria-label", "تواصل عبر واتساب");
      var contactBox = document.getElementById("contactBox");
      if (contactBox) contactBox.style.display = "";
    }

    var form = document.getElementById("da3wa-rsvp-form");
    if (!form) return;
    var attendance = "yes";
    var companions = 0;
    var guestCount = document.getElementById("da3wa-guests");
    var error = document.getElementById("da3wa-err");

    document.querySelectorAll("#da3wa-att .pill").forEach(function (button) {
      button.addEventListener("click", function () {
        attendance = button.dataset.v || "yes";
        document.querySelectorAll("#da3wa-att .pill").forEach(function (pill) {
          pill.setAttribute("aria-pressed", String(pill === button));
        });
      });
    });
    function updateCompanions() {
      if (guestCount) guestCount.textContent = String(companions).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[Number(d)]; });
    }
    document.getElementById("da3wa-minus")?.addEventListener("click", function () {
      companions = Math.max(0, companions - 1); updateCompanions();
    });
    document.getElementById("da3wa-plus")?.addEventListener("click", function () {
      companions = Math.min(20, companions + 1); updateCompanions();
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!whatsappUrl) {
        if (error) error.textContent = "رابط واتساب غير مضبوط.";
        return;
      }
      var name = form.elements.guest_name.value.trim();
      if (!name) {
        if (error) error.textContent = "يرجى كتابة الاسم الكريم.";
        form.elements.guest_name.focus();
        return;
      }
      var attendanceLabel = { yes: "نعم، سأحضر", no: "أعتذر عن الحضور", maybe: "ربما" }[attendance];
      var message = [
        "تأكيد حضور عيد ميلاد رهف",
        "الاسم: " + name,
        "الحضور: " + attendanceLabel,
        "عدد المرافقين: " + (attendance === "yes" ? companions : 0),
        form.elements.message.value.trim() ? "التهنئة: " + form.elements.message.value.trim() : ""
      ].filter(Boolean).join("\n");
      window.open(waLink(message), "_blank", "noopener,noreferrer");
      if (error) error.textContent = "فتحنا واتساب مع تفاصيل ردّك. أرسل الرسالة هناك لإتمام التأكيد.";
    });
  });
})();
