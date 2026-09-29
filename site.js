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
    var pageTitle = "دعوة " + (config.eventTitle || "مناسبتكم");
    document.title = pageTitle;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');
    var description = [config.dateText, config.venueName].filter(Boolean).join(" • ");
    if (ogTitle) ogTitle.content = pageTitle;
    if (ogDescription) ogDescription.content = description;

    var calLink = document.getElementById("calendarDownload");
    if (calLink && config.date) {
      var dateParts = config.date.split("T");
      var ymd = (dateParts[0] || "").split("-");
      var hm = (dateParts[1] || "").split(":");
      var utcDate = new Date(Date.UTC(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2])));
      var month = new Intl.DateTimeFormat("ar", { month: "long", timeZone: "UTC" }).format(utcDate);
      var weekday = new Intl.DateTimeFormat("ar", { weekday: "long", timeZone: "UTC" }).format(utcDate);
      var arabicDigits = function (value) { return String(value).replace(/[0-9]/g, function (digit) { return "٠١٢٣٤٥٦٧٨٩"[Number(digit)]; }); };
      var monthEl = document.querySelector("#da3wa-cal .cal-top");
      var weekdayEl = document.querySelector("#da3wa-cal .cal-wd");
      var dayEl = document.querySelector("#da3wa-cal .cal-day");
      var timeEl = document.querySelector("#da3wa-cal .cal-time");
      if (monthEl) monthEl.textContent = month + " " + arabicDigits(ymd[0]);
      if (weekdayEl) weekdayEl.textContent = weekday;
      if (dayEl) dayEl.textContent = arabicDigits(ymd[2]);
      if (timeEl) timeEl.textContent = config.timeText || "";
      var localStart = (ymd.join("") + "T" + (hm[0] || "00") + (hm[1] || "00") + (hm[2] || "00"));
      var escIcs = function (value) { return String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); };
      var ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Neon Invitation//AR", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT", "UID:neon-invitation-" + ymd.join("") + "@github-pages",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
        "DTSTART;TZID=" + (config.timeZone || "Asia/Baghdad") + ":" + localStart,
        "SUMMARY:" + escIcs(config.eventTitle),
        "LOCATION:" + escIcs([config.venueName, config.venueAddr].filter(Boolean).join(" — ")),
        "DESCRIPTION:" + escIcs(config.invitationText),
        "END:VEVENT", "END:VCALENDAR", ""
      ].join("\r\n");
      calLink.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      calLink.download = (config.eventTitle || "invitation").replace(/\s+/g, "-") + ".ics";
    }
    var wishList = document.getElementById("da3wa-wish-list");
    if (wishList && Array.isArray(config.wishes)) {
      var colors = ["#ff5ec4", "#b06ce8", "#ff8fd9", "#7d5be8", "#ffb02e"];
      wishList.replaceChildren();
      config.wishes.forEach(function (wish, index) {
        if (!wish || !wish.name || !wish.message) return;
        var card = document.createElement("div"); card.className = "wish";
        var avatar = document.createElement("div"); avatar.className = "wish-av"; avatar.style.background = colors[index % colors.length]; avatar.textContent = wish.name.trim().charAt(0);
        var body = document.createElement("div"); body.className = "wish-body";
        var name = document.createElement("div"); name.className = "wish-name"; name.textContent = wish.name;
        var message = document.createElement("div"); message.className = "wish-msg"; message.textContent = wish.message;
        body.appendChild(name); body.appendChild(message); card.appendChild(avatar); card.appendChild(body); wishList.appendChild(card);
      });
    }
    var contact = document.getElementById("contactLink");
    var contactText = document.getElementById("contactPhoneText");
    if (contact && whatsappUrl) {
      contact.href = waLink(config.whatsappMessage || ("مرحبًا، أود الاستفسار عن " + (config.eventTitle || "الدعوة") + "."));
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
        "تأكيد الحضور: " + (config.eventTitle || "المناسبة"),
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
