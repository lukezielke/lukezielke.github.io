(function () {
  "use strict";

  var timeElement = document.getElementById("local-time");
  var yearElement = document.getElementById("current-year");

  function updateTime() {
    if (!timeElement) return;

    try {
      var formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "short"
      });
      timeElement.textContent = formatter.format(new Date()).replace("GMT+", "UTC+");
    } catch (error) {
      timeElement.textContent = "Europe/Berlin";
    }
  }

  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
  updateTime();
  window.setInterval(updateTime, 1000);

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      if (!value || !navigator.clipboard) return;

      navigator.clipboard.writeText(value).then(function () {
        var original = button.textContent;
        button.textContent = "copied";
        window.setTimeout(function () {
          button.textContent = original;
        }, 1600);
      });
    });
  });
}());
