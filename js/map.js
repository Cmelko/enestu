/**
 * Interactive Czech kraj map for partner page
 */
(function () {
  const root = document.querySelector("[data-region-map]");
  if (!root) return;

  const panelTitle = root.querySelector("[data-region-title]");
  const panelSlots = root.querySelector("[data-region-slots]");
  const panelTrades = root.querySelector("[data-region-trades]");
  const panelCta = root.querySelector("[data-region-cta]");
  const mapHost = root.querySelector("[data-region-svg]");
  const chips = document.querySelector("[data-trade-filters]");
  const regionSelect = document.querySelector("#region, select[name='region']");

  let regions = {};
  let activeId = "praha";
  let tradeFilter = "all";

  async function load() {
    try {
      const res = await fetch("js/regions.json");
      regions = await res.json();
    } catch (err) {
      console.error("regions.json", err);
      return;
    }

    try {
      const svgRes = await fetch("assets/cz-regions.svg");
      const svgText = await svgRes.text();
      mapHost.innerHTML = svgText;
    } catch (err) {
      console.error("cz-regions.svg", err);
      return;
    }

    buildTradeChips();
    wireMap();
    selectRegion(activeId);
  }

  function allTrades() {
    const set = new Set();
    Object.values(regions).forEach((r) => (r.trades || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }

  function buildTradeChips() {
    if (!chips) return;
    chips.innerHTML = "";
    const make = (id, label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab" + (id === tradeFilter ? " is-active" : "");
      btn.textContent = label;
      btn.dataset.trade = id;
      btn.addEventListener("click", () => {
        tradeFilter = id;
        chips.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
        btn.classList.add("is-active");
        paintAvailability();
      });
      chips.appendChild(btn);
    };
    make("all", "Všechny obory");
    allTrades().forEach((t) => make(t, t));
  }

  function paintAvailability() {
    const svg = mapHost.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll("[data-region]").forEach((path) => {
      const id = path.getAttribute("data-region");
      const data = regions[id];
      if (!data) return;
      const free = Math.max(0, data.slots - data.taken);
      const matchesTrade =
        tradeFilter === "all" || (data.trades || []).includes(tradeFilter);
      path.classList.toggle("is-full", free === 0);
      path.classList.toggle("is-filtered-out", !matchesTrade);
      path.classList.toggle("is-active", id === activeId);
    });
  }

  function wireMap() {
    const svg = mapHost.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll("[data-region]").forEach((path) => {
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      const id = path.getAttribute("data-region");
      const label = regions[id]?.label || id;
      path.setAttribute("aria-label", label);
      const activate = () => selectRegion(id);
      path.addEventListener("click", activate);
      path.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function selectRegion(id) {
    if (!regions[id]) return;
    activeId = id;
    const data = regions[id];
    const free = Math.max(0, data.slots - data.taken);

    if (panelTitle) panelTitle.textContent = data.label;
    if (panelSlots) {
      panelSlots.innerHTML =
        free > 0
          ? `Volno: <strong>${free} z ${data.slots}</strong> míst`
          : `<strong>Kapacita plná</strong> · ${data.slots} míst`;
    }
    if (panelTrades) {
      panelTrades.innerHTML = (data.trades || [])
        .map((t) => `<span class="badge badge--blue">${t}</span>`)
        .join(" ");
    }
    if (panelCta) {
      panelCta.disabled = free === 0;
      panelCta.textContent =
        free > 0
          ? "Odeslat přihlášku pro tento region"
          : "Kapacita plná — vyberte jiný region";
      panelCta.onclick = () => {
        if (free === 0) return;
        if (regionSelect) {
          // match option by label or value
          const opts = [...regionSelect.options];
          const match = opts.find(
            (o) =>
              o.value === data.label ||
              o.textContent.trim() === data.label ||
              o.value === id
          );
          if (match) regionSelect.value = match.value;
          else {
            // add option if missing
            const opt = document.createElement("option");
            opt.value = data.label;
            opt.textContent = data.label;
            regionSelect.appendChild(opt);
            regionSelect.value = data.label;
          }
        }
        document.querySelector("#partner")?.scrollIntoView({ behavior: "smooth" });
      };
    }

    // sync select
    if (regionSelect) {
      const opts = [...regionSelect.options];
      const match = opts.find(
        (o) => o.value === data.label || o.textContent.trim() === data.label
      );
      if (match) regionSelect.value = match.value;
    }

    paintAvailability();
  }

  load();
})();
