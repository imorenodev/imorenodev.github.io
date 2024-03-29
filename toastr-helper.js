(function (a) {
  function f(c) {
    if (!a("#toast-container").length) {
      var d = c.position 
        ? c.position
        : "bottom-right";
      a("body").prepend(
        '<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>'
      );
      a("#toast-container").addClass(d);
    }
    d = a("#toast-container");
    var b = "",
      e = (b = ""),
      g = "toast-" + l,
      f = c.type,
      t = c.title,
      m = c.subtitle,
      n = c.content,
      h = c.img,
      p = c.delay ? 'data-delay="' + c.delay + '"' : 'data-autohide="false"',
      q = "",
      r = a.toastDefaults.dismissible,
      u = a.toastDefaults.style.toast,
      k = !1;
    "undefined" !== typeof c.dismissible && (r = c.dismissible);
    switch (f) {
      case "info":
        e = a.toastDefaults.style.info || "bg-info";
        b = a.toastDefaults.style.info || "text-white";
        break;
      case "success":
        e = a.toastDefaults.style.success || "bg-success";
        b = a.toastDefaults.style.info || "text-white";
        break;
      case "warning":
        e = a.toastDefaults.style.warning || "bg-warning";
        b = a.toastDefaults.style.warning || "text-white";
        break;
      case "error":
        (e = a.toastDefaults.style.error || "bg-danger"),
          (b = a.toastDefaults.style.error || "text-white");
    }
    a.toastDefaults.pauseDelayOnHover &&
      c.delay &&
      ((p = 'data-autohide="false"'),
      (q =
        'data-hide-after="' +
        (Math.floor(Date.now() / 1e3) + c.delay / 1e3) +
        '"'));
    b =
      '<div id="' +
      g +
      '" class="toast ' +
      u +
      '" role="alert" aria-live="assertive" aria-atomic="true" ' +
      p +
      " " +
      q +
      '><div class="toast-header ' +
      (e + " " + b + '">');
    h &&
      (b +=
        '<img src="' +
        h.src +
        '" class="mr-2 ' +
        (h["class"] || "") +
        '" alt="' +
        (h.alt || "Image") +
        '">');
    b += '<strong class="mr-auto">' + t + "</strong>";
    m && (b += '<small class="text-white">' + m + "</small>");
    r &&
      (b +=
        '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">\n                        <span aria-hidden="true" class="text-white">&times;</span>\n                    </button>');
    b += "</div>";
    n &&
      (b +=
        '<div class="toast-body">\n                        ' +
        n +
        "\n                    </div>");
    b += "</div>";
    a.toastDefaults.stackable ||
      d.find(".toast").each(function () {
        a(this).remove();
      });
    d.append(b);
    d.find(".toast:last").toast("show");
    a.toastDefaults.pauseDelayOnHover &&
      (setTimeout(function () {
        k || a("#" + g).toast("hide");
      }, c.delay),
      a("body").on("mouseover", "#" + g, function () {
        k = !0;
      }),
      a(document).on("mouseleave", "#" + g, function () {
        var b = Math.floor(Date.now() / 1e3),
          c = parseInt(a(this).data("hideAfter"));
        k = !1;
        b >= c && a(this).toast("hide");
      }));
    l++;
  }
  a.toastDefaults = {
    position: "bottom-right",
    dismissible: !0,
    stackable: !0,
    pauseDelayOnHover: !0,
    style: { toast: "", info: "", success: "", warning: "", error: "" },
  };
  a("body").on("hidden.bs.toast", ".toast", function () {
    a(this).remove();
  });
  var l = 1;
  a.snack = function (a, d, b) {
    return f({ type: a, title: d, delay: b });
  };
  a.toast = function (a) {
    return f(a);
  };
})(jQuery);
