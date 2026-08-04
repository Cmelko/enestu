/* Enestu — page interactions (nav, reveals, tabs, simulators) */
(function () {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");

  const setNavOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-locked", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll reveal
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
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }
  }

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
