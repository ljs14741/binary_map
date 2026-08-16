(() => {
  const VIEW = { w: 800, h: 759 };
  const CENTER_FIX = { 28: [200, 152], 11: [251, 146] };
  const SIDO_NAME = {
    "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
    "30": "대전", "31": "울산", "36": "세종", "41": "경기", "42": "강원",
    "43": "충북", "44": "충남", "45": "전북", "46": "전남", "47": "경북",
    "48": "경남", "50": "제주"
  };

  let svgCache = "";
  let activeFilter = "";
  let clusterState = [];
  let onDeletePerson = null;

  async function paint(options) {
    const wrap = document.getElementById(options.wrapId || "korea-wrap");
    if (!wrap) {
      return;
    }
    onDeletePerson = options.onDeletePerson || null;
    if (!svgCache) {
      svgCache = await fetch("/img/korea-sido.svg").then((res) => res.text());
    }
    const canvas = document.createElement("div");
    canvas.className = "korea-canvas";
    canvas.innerHTML = svgCache;
    const svg = canvas.querySelector("svg");
    if (!svg) {
      return;
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("role", "img");
    svg.setAttribute("overflow", "visible");
    svg.classList.add("korea-map");
    svg.querySelectorAll("path[data-code]").forEach((path) => {
      path.classList.add("sido-land");
      if (path.getAttribute("data-code") === options.host.sidoCode) {
        path.classList.add("is-home");
      }
    });
    wrap.replaceChildren(canvas);

    const hostPoint = pinPoint(svg, options.host.sidoCode, options.host.sigunguCode);
    clusterState = buildClusters(svg, options.people || [], options.extras || []);
    const layer = document.createElement("div");
    layer.className = "cluster-layer";
    addSparkles(layer);
    clusterState.forEach((cluster, index) => layer.appendChild(createClusterPin(cluster, index)));
    layer.appendChild(createHostPin(hostPoint, options.host.name));
    canvas.appendChild(layer);
    requestAnimationFrame(() => canvas.classList.add("is-ready"));
    applyFilter();
  }

  function sidoBox(svg, code) {
    const path = svg.querySelector(`path[data-code="${code}"]`);
    if (!path || typeof path.getBBox !== "function") {
      return null;
    }
    const box = path.getBBox();
    return (box.width || box.height) ? box : null;
  }

  function sidoCenter(svg, code) {
    if (CENTER_FIX[code]) {
      return CENTER_FIX[code].slice();
    }
    const box = sidoBox(svg, code);
    if (box) {
      return [box.x + box.width / 2, box.y + box.height / 2];
    }
    return [400, 380];
  }

  function hashOffset(code, spreadX, spreadY) {
    let hash = 2166136261;
    const text = String(code || "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const nx = ((hash >>> 0) % 1000) / 1000 - 0.5;
    const ny = ((hash >>> 11) % 1000) / 1000 - 0.5;
    return [nx * spreadX * 2, ny * spreadY * 2];
  }

  function pinPoint(svg, sidoCode, sigunguCode) {
    const center = sidoCenter(svg, sidoCode);
    const box = sidoBox(svg, sidoCode);
    const spreadX = box ? Math.max(12, box.width * 0.28) : 16;
    const spreadY = box ? Math.max(12, box.height * 0.28) : 16;
    const offset = hashOffset(sigunguCode || sidoCode, spreadX, spreadY);
    return [center[0] + offset[0], center[1] + offset[1]];
  }

  function rankScore(person) {
    return Math.max(person.score || 0, person.reverseScore || 0);
  }

  function rankLabelOf(person) {
    if ((person.reverseScore || 0) > (person.score || 0)) {
      return person.reverseLabel || person.label;
    }
    return person.label;
  }

  function rankColorOf(person) {
    if ((person.reverseScore || 0) > (person.score || 0)) {
      return person.reverseColor || person.color;
    }
    return person.color;
  }

  function buildClusters(svg, people, extras) {
    const all = people.map((person) => ({ ...person, named: true })).concat(extras);
    const bySido = new Map();
    all.forEach((person) => {
      const code = person.sidoCode;
      if (!code) {
        return;
      }
      if (!bySido.has(code)) {
        bySido.set(code, []);
      }
      bySido.get(code).push(person);
    });
    return [...bySido.entries()].map(([code, grouped]) => {
      grouped.sort((a, b) => rankScore(b) - rankScore(a) || Math.min(b.score || 0, b.reverseScore || 0) - Math.min(a.score || 0, a.reverseScore || 0));
      const best = grouped[0];
      const point = sidoCenter(svg, code);
      const places = [...new Set(grouped.map((person) => person.sigunguCode).filter(Boolean))];
      const name = places.length === 1 && grouped[0].sido
        ? grouped[0].sido
        : (SIDO_NAME[code] || code);
      return {
        id: code,
        name,
        x: point[0],
        y: point[1],
        count: grouped.length,
        people: grouped,
        labels: [...new Set(grouped.map(rankLabelOf).filter(Boolean))],
        bestScore: rankScore(best),
        color: rankColorOf(best)
      };
    }).filter((cluster) => cluster.count > 0);
  }

  function createClusterPin(cluster, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cluster-pin";
    button.dataset.labels = cluster.labels.join(",");
    button.style.left = `${(cluster.x / VIEW.w) * 100}%`;
    button.style.top = `${(cluster.y / VIEW.h) * 100}%`;
    button.style.setProperty("--pin", cluster.color);
    button.style.setProperty("--delay", `${0.18 + index * 0.1}s`);
    button.innerHTML = `
      <span class="cluster-glow"></span>
      <span class="cluster-dot"></span>
      <span class="cluster-badge">${escapeHtml(cluster.name)} · ${cluster.count}명</span>
    `;
    button.addEventListener("click", () => openSheet(cluster));
    return button;
  }

  function createHostPin(point, name) {
    const host = document.createElement("div");
    host.className = "host-pin";
    host.style.left = `${(point[0] / VIEW.w) * 100}%`;
    host.style.top = `${(point[1] / VIEW.h) * 100}%`;
    host.innerHTML = `
      <span class="host-ring"></span>
      <span class="host-ring is-late"></span>
      <span class="host-dot"></span>
      <span class="host-badge">${escapeHtml(name)} · 고향</span>
    `;
    return host;
  }

  function addSparkles(layer) {
    const spots = [
      [18, 12], [72, 10], [88, 28], [12, 42], [64, 36],
      [40, 58], [82, 62], [22, 74], [54, 80], [76, 88],
      [34, 22], [8, 66]
    ];
    spots.forEach(([x, y], index) => {
      const spark = document.createElement("span");
      spark.className = "map-spark";
      spark.style.left = `${x}%`;
      spark.style.top = `${y}%`;
      spark.style.setProperty("--delay", `${index * 0.28}s`);
      layer.appendChild(spark);
    });
  }

  function bindUi() {
    const stats = document.getElementById("map-stats");
    if (stats && !stats.dataset.bound) {
      stats.dataset.bound = "true";
      stats.addEventListener("click", (event) => {
        const button = event.target.closest(".map-stat");
        if (!button || !stats.contains(button)) {
          return;
        }
        const key = button.dataset.filter || "";
        activeFilter = activeFilter === key ? "" : key;
        applyFilter();
      });
    }
    const sheet = document.getElementById("map-sheet");
    if (!sheet || sheet.dataset.bound) {
      return;
    }
    sheet.dataset.bound = "true";
    document.getElementById("map-sheet-close").addEventListener("click", closeSheet);
    document.getElementById("map-sheet-backdrop").addEventListener("click", closeSheet);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSheet();
      }
    });
  }

  function applyFilter() {
    document.querySelectorAll("#map-stats .map-stat").forEach((button) => {
      button.classList.toggle("is-on", !!activeFilter && button.dataset.filter === activeFilter);
    });
    document.querySelectorAll(".cluster-pin").forEach((pin) => {
      const labels = (pin.dataset.labels || "").split(",").filter(Boolean);
      const on = !activeFilter || labels.includes(activeFilter);
      pin.classList.toggle("is-dim", !on);
      pin.classList.toggle("is-hot", !!activeFilter && on);
    });
    document.querySelectorAll("#map-rank li").forEach((item) => {
      item.hidden = !!activeFilter && item.dataset.label !== activeFilter;
    });
  }

  function openSheet(cluster) {
    const sheet = document.getElementById("map-sheet");
    const list = document.getElementById("map-sheet-list");
    const visible = activeFilter
      ? cluster.people.filter((person) => rankLabelOf(person) === activeFilter)
      : cluster.people;
    const named = visible.filter((person) => person.named);
    const extra = visible.length - named.length;
    document.getElementById("map-sheet-title").textContent = cluster.name;
    document.getElementById("map-sheet-count").textContent = `${visible.length}명`;
    list.innerHTML = named.map((person) => {
      const other = Math.min(person.score || 0, person.reverseScore || 0);
      const otherColor = (person.reverseScore || 0) > (person.score || 0) ? person.color : person.reverseColor;
      return `
      <li>
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          <small>${escapeHtml(person.sido)} · ${escapeHtml(rankLabelOf(person))}</small>
        </div>
        <div class="map-rank-scores">
          <b style="color:${rankColorOf(person)}">${rankScore(person)}</b>
          ${person.reverseScore != null ? `<em style="color:${otherColor || person.color}">${other}</em>` : ""}
        </div>
        ${onDeletePerson && person.id ? `<button type="button" class="map-sheet-remove" data-id="${person.id}">지우기</button>` : ""}
      </li>`;
    }).join("") + (extra > 0 ? `<li class="is-extra"><span>그 외 ${extra}명</span></li>` : "");
    list.querySelectorAll(".map-sheet-remove").forEach((button) => {
      button.addEventListener("click", () => onDeletePerson(Number(button.dataset.id)));
    });
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("is-open"));
    document.body.classList.add("is-sheet-open");
  }

  function closeSheet() {
    const sheet = document.getElementById("map-sheet");
    if (!sheet) {
      return;
    }
    sheet.classList.remove("is-open");
    document.body.classList.remove("is-sheet-open");
    window.setTimeout(() => {
      if (!sheet.classList.contains("is-open")) {
        sheet.hidden = true;
      }
    }, 280);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  window.MapBoard = { paint, bindUi, closeSheet, escapeHtml };
})();
