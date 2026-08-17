/* Enestu — page interactions (nav, reveals, tabs, simulators) */
(function () {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");

  let backdrop = document.querySelector(".nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
  }

  const setNavOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-locked", open);
    backdrop.hidden = !open;
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll(".nav-drawer a, .nav-links a, .nav-actions a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    backdrop.addEventListener("click", () => setNavOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 960) setNavOpen(false);
      },
      { passive: true }
    );
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }
  }

  document.querySelectorAll("[data-feature-tabs]").forEach((root) => {
    const tabs = root.querySelectorAll(".feat-tab");
    const panels = root.querySelectorAll("[data-feat-panel]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.feat;
        tabs.forEach((t) => {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach((panel) => {
          const match = panel.dataset.featPanel === id;
          panel.classList.toggle("is-active", match);
          panel.hidden = !match;
        });
      });
    });
  });

  document.querySelectorAll("[data-steps]").forEach((root) => {
    const items = root.querySelectorAll(".step-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        items.forEach((i) => i.classList.toggle("is-active", i === item));
      });
    });
  });

  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const tabs = root.querySelectorAll(".tab");
    const cards = root.querySelectorAll("[data-tab-panel]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        cards.forEach((card) => {
          const cats = (card.dataset.tabPanel || "").split(",");
          card.style.display =
            id === "all" || cats.includes(id) ? "" : "none";
        });
      });
    });
  });

  const serviceItems = document.querySelectorAll("[data-services] li");
  if (serviceItems.length) {
    let i = 0;
    serviceItems[0].classList.add("is-active");
    setInterval(() => {
      serviceItems[i].classList.remove("is-active");
      i = (i + 1) % serviceItems.length;
      serviceItems[i].classList.add("is-active");
    }, 2200);
  }

  const work = document.querySelector("#sim-work");
  const hours = document.querySelector("#sim-hours");
  if (work && hours) {
    const workOut = document.querySelector("#sim-work-val");
    const hoursOut = document.querySelector("#sim-hours-val");
    const trad = document.querySelector("#sim-traditional");
    const enestu = document.querySelector("#sim-enestu");
    const save = document.querySelector("#sim-save");

    const render = () => {
      const w = Number(work.value);
      const h = Number(hours.value);
      workOut.textContent = `€${w}`;
      hoursOut.textContent = `${h} hod`;
      const traditional = Math.round(w * 1.35 + h * 25);
      const withEnestu = Math.round(w * 1.2 + 50);
      trad.textContent = `€${traditional}`;
      enestu.textContent = `€${withEnestu}`;
      save.textContent = `€${Math.max(0, traditional - withEnestu)}`;
    };

    work.addEventListener("input", render);
    hours.addEventListener("input", render);
    render();
  }

  const volume = document.querySelector("#partner-volume");
  if (volume) {
    const commission = document.querySelector("#partner-commission");
    const marketing = document.querySelector("#partner-marketing");
    const outToday = document.querySelector("#partner-today");
    const outEnestu = document.querySelector("#partner-enestu");
    const outDiff = document.querySelector("#partner-diff");

    const render = () => {
      const v = Number(volume.value);
      const c = Number(commission.value) / 100;
      const m = Number(marketing.value);
      const today = Math.round(v * (1 - c) - m);
      const withE = Math.round(v);
      outToday.textContent = `€${today}`;
      outEnestu.textContent = `€${withE}`;
      outDiff.textContent = `+€${Math.max(0, withE - today)}`;
      document.querySelector("#partner-volume-val").textContent = `€${v}`;
      document.querySelector("#partner-commission-val").textContent = `${commission.value} %`;
      document.querySelector("#partner-marketing-val").textContent = `€${m}`;
    };

    [volume, commission, marketing].forEach((el) =>
      el.addEventListener("input", render)
    );
    render();
  }
})();
