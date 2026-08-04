/**
 * Enestu forms — contact, waitlist, partner, checkout, portal
 */
(function () {
  const api = (path) => path;

  function showAlert(form, type, title, text) {
    let el = form.querySelector(".form-alert");
    if (!el) {
      el = document.createElement("div");
      el.className = "form-alert";
      el.setAttribute("role", "status");
      form.prepend(el);
    }
    el.className = `form-alert form-alert--${type}`;
    el.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  }

  function setFieldError(field, message) {
    const wrap = field.closest(".field") || field.closest(".checkbox") || field.parentElement;
    if (!wrap) return;
    wrap.classList.toggle("is-error", Boolean(message));
    let hint = wrap.querySelector(".hint--error");
    if (message) {
      if (!hint) {
        hint = document.createElement("p");
        hint.className = "hint hint--error";
        wrap.appendChild(hint);
      }
      hint.textContent = message;
    } else if (hint) {
      hint.remove();
    }
  }

  function clearErrors(form) {
    form.querySelectorAll(".is-error").forEach((el) => el.classList.remove("is-error"));
    form.querySelectorAll(".hint--error").forEach((el) => el.remove());
  }

  async function postJSON(url, data) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  }

  // —— Contact ——
  document.querySelectorAll("form[data-form='contact']").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form);
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const subject = String(fd.get("subject") || "").trim();
      const message = String(fd.get("message") || "").trim();
      const consent = fd.get("consent") === "on" || fd.get("consent") === "true";

      let ok = true;
      if (!name) {
        setFieldError(form.querySelector("[name=name]"), "Zadejte jméno.");
        ok = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError(form.querySelector("[name=email]"), "Zadejte platný e-mail.");
        ok = false;
      }
      if (!subject) {
        setFieldError(form.querySelector("[name=subject]"), "Zadejte předmět.");
        ok = false;
      }
      if (!message) {
        setFieldError(form.querySelector("[name=message]"), "Napište zprávu.");
        ok = false;
      }
      if (!consent) {
        setFieldError(form.querySelector("[name=consent]"), "Je potřeba souhlas.");
        ok = false;
      }
      if (!ok) return;

      const btn = form.querySelector('[type="submit"]');
      const original = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Odesílám…";
      }

      try {
        const { res, json } = await postJSON(api("/api/contact"), {
          name,
          email,
          subject,
          message,
          consent,
          website: fd.get("website") || "",
        });
        if (!res.ok || !json.ok) {
          showAlert(form, "error", "Odeslání selhalo", json.error || "Zkuste to prosím znovu.");
        } else {
          showAlert(
            form,
            "success",
            "Zpráva odeslána",
            "Ozveme se obvykle do jednoho pracovního dne."
          );
          form.reset();
        }
      } catch {
        showAlert(form, "error", "Chyba sítě", "Zkontrolujte připojení a zkuste to znovu.");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }
    });
  });

  // —— Waitlist / email CTA ——
  document.querySelectorAll("form[data-form='waitlist']").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      const btn = form.querySelector('[type="submit"]');
      const original = btn?.textContent;
      if (!email) return;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Odesílám…";
      }
      try {
        const { res, json } = await postJSON(api("/api/waitlist"), {
          email,
          source: form.dataset.source || "cta",
          website: fd.get("website") || "",
        });
        if (!res.ok || !json.ok) {
          alert(json.error || "Nepodařilo se odeslat.");
        } else {
          if (btn) btn.textContent = "Hotovo ✓";
          form.reset();
          setTimeout(() => {
            if (btn) btn.textContent = original;
          }, 2500);
        }
      } catch {
        alert("Chyba sítě. Zkuste to znovu.");
      } finally {
        if (btn && btn.textContent === "Odesílám…") {
          btn.disabled = false;
          btn.textContent = original;
        } else if (btn) {
          btn.disabled = false;
        }
      }
    });
  });

  // —— Partner ——
  document.querySelectorAll("form[data-form='partner']").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form);
      const fd = new FormData(form);
      const payload = {
        firma: String(fd.get("firma") || "").trim(),
        ico: String(fd.get("ico") || "").trim(),
        region: String(fd.get("region") || "").trim(),
        specialization: String(fd.get("spec") || fd.get("specialization") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        consent: fd.get("consent") === "on" || fd.get("consent") === "true",
        website: fd.get("website") || "",
      };

      let ok = true;
      if (!payload.firma) {
        setFieldError(form.querySelector("[name=firma]"), "Zadejte firmu.");
        ok = false;
      }
      if (!/^\d{8}$/.test(payload.ico.replace(/\s/g, ""))) {
        setFieldError(form.querySelector("[name=ico]"), "IČO musí mít 8 číslic.");
        ok = false;
      }
      if (!payload.region) {
        setFieldError(form.querySelector("[name=region]"), "Vyberte region.");
        ok = false;
      }
      if (!payload.specialization) {
        setFieldError(form.querySelector("[name=spec]"), "Zadejte specializaci.");
        ok = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        setFieldError(form.querySelector("[name=email]"), "Zadejte platný e-mail.");
        ok = false;
      }
      if (!payload.consent) {
        setFieldError(form.querySelector("[name=consent]"), "Je potřeba souhlas.");
        ok = false;
      }
      if (!ok) return;

      const btn = form.querySelector('[type="submit"]');
      const original = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Odesílám…";
      }
      try {
        const { res, json } = await postJSON(api("/api/partner"), payload);
        if (!res.ok || !json.ok) {
          showAlert(form, "error", "Odeslání selhalo", json.error || "Zkuste to znovu.");
        } else {
          showAlert(
            form,
            "success",
            "Žádost odeslána",
            "Ozveme se s dalším postupem ověření."
          );
          form.reset();
        }
      } catch {
        showAlert(form, "error", "Chyba sítě", "Zkuste to prosím znovu.");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }
    });
  });

  // Billing state for checkout
  let billingCycle = "monthly";
  document.querySelectorAll("[data-billing]").forEach((root) => {
    const buttons = root.querySelectorAll(".billing-toggle button");
    const amounts = document.querySelectorAll("[data-price-monthly]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        billingCycle = btn.dataset.billing === "yearly" ? "yearly" : "monthly";
        amounts.forEach((el) => {
          const monthly = Number(el.dataset.priceMonthly);
          if (!monthly) {
            el.innerHTML = `€0<small>/měs.</small>`;
            return;
          }
          const value = billingCycle === "yearly" ? Math.round(monthly * 0.8 * 10) / 10 : monthly;
          el.innerHTML = `€${String(value).replace(".", ",")}<small>/měs.</small>`;
        });
      });
    });
  });

  // Checkout CTAs
  document.querySelectorAll("[data-checkout]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const plan = el.dataset.checkout;
      const emailInput = document.querySelector("#checkout-email, [data-checkout-email]");
      const email = emailInput ? String(emailInput.value || "").trim() : "";
      el.classList.add("is-loading");
      try {
        const { res, json } = await postJSON(api("/api/checkout"), {
          plan,
          billing: billingCycle,
          email,
        });
        if (json.url) {
          window.location.href = json.url;
          return;
        }
        alert(json.error || "Checkout není dostupný.");
      } catch {
        alert("Chyba sítě při spouštění platby.");
      } finally {
        el.classList.remove("is-loading");
      }
    });
  });

  // Portal / Přihlásit se
  document.querySelectorAll("[data-portal]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = window.prompt("Zadejte e-mail účtu Enestu:");
      if (!email) return;
      try {
        const { json } = await postJSON(api("/api/portal"), { email });
        if (json.url) {
          window.location.href = json.url;
        } else {
          alert(json.error || "Portál není dostupný.");
        }
      } catch {
        alert("Chyba sítě.");
      }
    });
  });
})();
