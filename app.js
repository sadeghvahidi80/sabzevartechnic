(() => {
  "use strict";
  const cfg = window.CHAPYAR_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const digits = (n) => new Intl.NumberFormat("fa-IR").format(n);

  const toast = (message) => {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
  };

  const modal = $("orderModal");
  const openModal = (service = "سفارش عمومی") => {
    $("orderService").value = service;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("customerName").focus(), 60);
  };
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-open-order]").forEach((btn) =>
    btn.addEventListener("click", () => openModal(btn.dataset.openOrder))
  );
  $("closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // منوی موبایل
  const menuToggle = $("menuToggle");
  const mobileMenu = $("mobileMenu");
  menuToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );

  // فوتر و اطلاعات تماس
  $("year").textContent = new Date().getFullYear();
  const phone = cfg.phoneNumber || cfg.contactNumber || "09153753859";
  if ($("footerPhone")) {
    $("footerPhone").textContent = phone;
    $("footerPhone").setAttribute("href", `tel:+98${phone.replace(/^0/, "")}`);
  }
  if ($("footerAddress") && cfg.address) {
    $("footerAddress").textContent = cfg.address;
  }
  if ($("footerHours") && cfg.workingHours) {
    $("footerHours").textContent = cfg.workingHours;
  }

  // لینک هر پیام‌رسان: چت با نام کاربری، و اگر نبود صفحهٔ خود پیام‌رسان
  const intlPhone = `+98${String(phone).replace(/\D/g, "").replace(/^0+/, "")}`;
  const chatLinks = {
    "ایتا": cfg.eitaaUsername ? `https://eitaa.com/${cfg.eitaaUsername}` : "https://eitaa.com/",
    "روبیکا": cfg.rubikaUsername ? `https://rubika.ir/${cfg.rubikaUsername}` : "https://rubika.ir/",
    "تلگرام": cfg.telegramUsername ? `https://t.me/${cfg.telegramUsername}` : `https://t.me/${intlPhone}`,
  };
  // پیش‌پرکردن متن سفارش فقط در تلگرام پشتیبانی می‌شود
  const messengerUrl = (channel, text) =>
    (chatLinks[channel] || "") +
    (channel === "تلگرام" && text ? `?text=${encodeURIComponent(text)}` : "");

  // باز کردن با <a> واقعی؛ window.open بعد از await توسط مرورگر موبایل بلاک می‌شود
  const openLink = (url) => {
    if (!url) return;
    const a = Object.assign(document.createElement("a"), { href: url, target: "_blank", rel: "noopener" });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  document.querySelectorAll("[data-messenger]").forEach((a) => {
    if (chatLinks[a.dataset.messenger]) a.href = chatLinks[a.dataset.messenger];
  });

  // محاسبه‌گر
  const getCalc = () => {
    const size = $("paperSize").value;
    const mode = $("printMode").value;
    const pages = Math.max(1, Math.min(5000, Number($("pageCount").value) || 1));
    const copies = Math.max(1, Math.min(500, Number($("copyCount").value) || 1));
    const sides = $("sides").value;
    const binding = $("binding").value;
    const rateKey = `${size}_${mode}`;
    const rate = Number(cfg.prices && cfg.prices[rateKey]) || 0;
    const bindRate =
      binding === "staple"
        ? Number(cfg.prices?.binding_staple) || 0
        : binding === "spiral"
        ? Number(cfg.prices?.binding_spiral) || 0
        : 0;
    const sheets = sides === "double" ? Math.ceil(pages / 2) : pages;
    const amount = rate > 0 ? (pages * rate + bindRate) * copies : null;
    return { size, mode, pages, copies, sides, binding, rate, bindRate, sheets, amount };
  };

  const updateCalc = () => {
    const c = getCalc();
    const amount = $("estimate");
    if (c.amount === null) {
      amount.textContent = "استعلام قیمت";
      amount.classList.add("is-text");
      $("estimateNote").textContent = "قیمت نهایی پس از بررسی فایل و تأیید شما اعلام می‌شود.";
    } else {
      amount.textContent = `${digits(c.amount)} تومان`;
      amount.classList.remove("is-text");
      $("estimateNote").textContent = `${digits(c.pages)} صفحه × ${digits(c.copies)} نسخه · حدود ${digits(
        c.sheets * c.copies
      )} برگ`;
    }
  };

  ["paperSize", "printMode", "sides", "pageCount", "copyCount", "binding"].forEach((id) =>
    $(id).addEventListener("input", updateCalc)
  );
  [
    ["pageMinus", "pageCount", -1],
    ["pagePlus", "pageCount", 1],
    ["copyMinus", "copyCount", -1],
    ["copyPlus", "copyCount", 1],
  ].forEach(([button, input, delta]) => {
    $(button).addEventListener("click", () => {
      const el = $(input);
      const min = Number(el.min) || 1;
      const max = Number(el.max) || 9999;
      el.value = Math.max(min, Math.min(max, (Number(el.value) || min) + delta));
      updateCalc();
    });
  });
  updateCalc();

  // ساخت متن سفارش
  const orderText = () => {
    const service = $("orderService").value;
    const name = $("customerName").value.trim();
    const phoneVal = $("customerPhone").value.trim();
    const delivery = $("delivery").value;
    const deadline = $("deadline").value;
    const details = $("orderDetails").value.trim() || "توضیحات بیشتر هنگام هماهنگی";
    const file = $("orderFile").files[0];
    const channel = $("contactChannel")?.value || "اشتراک‌گذاری گوشی";

    const lines = [
      `سلام، برای ${cfg.shopName || "سبزوار چاپ"} سفارش دارم.`,
      `نوع خدمت: ${service}`,
      `نام: ${name}`,
      `موبایل: ${phoneVal}`,
      `روش دریافت: ${delivery}`,
      `زمان موردنیاز: ${deadline}`,
      `پیام‌رسان انتخابی: ${channel}`,
      `توضیحات: ${details}`,
      file
        ? `فایل انتخاب‌شده: ${file.name} (${(file.size / 1048576).toFixed(1)} MB) — فایل را در همین گفتگو پیوست می‌کنم.`
        : "فایل: در صورت نیاز بعداً ارسال می‌کنم.",
    ];

    if (service.includes("پرینت") || service.includes("جزوه")) {
      const c = getCalc();
      lines.push(
        `تنظیمات محاسبه‌گر: ${c.size.toUpperCase()}، ${
          c.mode === "bw" ? "سیاه‌وسفید" : "رنگی"
        }، ${c.sides === "double" ? "دورو" : "یک‌رو"}، ${c.pages} صفحه، ${c.copies} نسخه، صحافی: ${c.binding}`
      );
      if (c.amount !== null) {
        lines.push(`برآورد اولیه: ${c.amount.toLocaleString("en-US")} تومان (نیازمند تأیید نهایی)`);
      }
    }
    return lines.join("\n");
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("متن سفارش کپی شد.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("متن سفارش کپی شد.");
    }
  };

  const sendOrder = async () => {
    const file = $("orderFile").files[0];
    const maxMB = Number(cfg.maxFileSizeMB) || 20;
    if (file && file.size > maxMB * 1024 * 1024) {
      $("formMessage").textContent = `حجم فایل بیشتر از ${maxMB} مگابایت است. لطفاً فایل کوچک‌تری انتخاب کن.`;
      return;
    }

    const text = orderText();
    const channel = $("contactChannel")?.value || "اشتراک‌گذاری گوشی";
    const target = messengerUrl(channel, text);

    // مهم: باز کردن پیام‌رسان باید در همان لحظه کلیک و قبل از هر await باشد،
    // وگرنه مرورگر موبایل آن را به‌عنوان پاپ‌آپ بلاک می‌کند.
    if (target) openLink(target);

    // اشتراک‌گذاری سیستمی گوشی (شامل فایل، اگر پشتیبانی شود)
    if (channel === "اشتراک‌گذاری گوشی" && navigator.share) {
      try {
        const canShareFile = file && navigator.canShare && navigator.canShare({ files: [file] });
        await navigator.share(
          canShareFile
            ? { title: "سفارش سبزوار چاپ", text, files: [file] }
            : { title: "سفارش سبزوار چاپ", text }
        );
        closeModal();
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }

    await copyText(text);

    $("formMessage").innerHTML =
      (target
        ? `متن سفارش کپی شد و ${channel} باز شد. اگر باز نشد، <a href="${target}" target="_blank" rel="noopener noreferrer">این لینک</a> را بزن.`
        : "متن سفارش کپی شد. آن را در پیام‌رسان دلخواهت ارسال کن.") +
      (file ? " فایل را هم در گفت‌وگو پیوست کن." : "");
  };

  $("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!$("orderForm").reportValidity()) return;
    await sendOrder();
  });

  $("copyOrder").addEventListener("click", async () => {
    if (!$("customerName").value.trim() || !$("customerPhone").checkValidity()) {
      $("formMessage").textContent = "لطفاً نام و شماره موبایل معتبر را وارد کن.";
      return;
    }
    await copyText(orderText());
  });

  $("fileHelp").textContent = `حداکثر حجم پیشنهادی: ${
    Number(cfg.maxFileSizeMB) || 20
  } مگابایت. در صورت پشتیبانی گوشی، فایل همراه متن به اشتراک گذاشته می‌شود؛ در غیر این صورت باید در پیام‌رسان پیوست شود.`;

  $("calcOrder").addEventListener("click", () => {
    const c = getCalc();
    openModal(c.mode === "bw" ? "پرینت سیاه‌وسفید" : "پرینت رنگی");
    $("orderDetails").value = `${c.size.toUpperCase()}، ${
      c.mode === "bw" ? "سیاه‌وسفید" : "رنگی"
    }، ${c.sides === "double" ? "دورو" : "یک‌رو"}، ${c.pages} صفحه، ${c.copies} نسخه، صحافی: ${c.binding}`;
  });
})();
