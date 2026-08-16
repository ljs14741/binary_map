(() => {
  const VIEW = { w: 800, h: 759 };
  const CENTER_FIX = { 11: [252, 154], 28: [200, 152], 41: [248, 172] };
  const SIDO_NAME = {
    "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
    "30": "대전", "31": "울산", "36": "세종", "41": "경기", "42": "강원",
    "43": "충북", "44": "충남", "45": "전북", "46": "전남", "47": "경북",
    "48": "경남", "50": "제주"
  };
  const SIGUNGU_XY = {
    11110: [0.02, -0.08], 11140: [0.04, 0.02], 11170: [-0.02, 0.18],
    11200: [0.18, 0.08], 11215: [0.32, 0.12], 11230: [0.18, -0.08],
    11260: [0.32, -0.18], 11290: [0.08, -0.22], 11305: [0.05, -0.38],
    11320: [0.08, -0.48], 11350: [0.28, -0.38], 11380: [-0.28, -0.28],
    11410: [-0.14, -0.08], 11440: [-0.22, 0.08], 11470: [-0.38, 0.18],
    11500: [-0.48, 0.02], 11530: [-0.38, 0.32], 11545: [-0.28, 0.42],
    11560: [-0.22, 0.22], 11590: [-0.08, 0.32], 11620: [-0.08, 0.45],
    11650: [0.08, 0.38], 11680: [0.22, 0.42], 11710: [0.38, 0.32],
    11740: [0.48, 0.18],
    26110: [-0.05, 0.18], 26140: [-0.22, 0.12], 26170: [0.12, 0.08],
    26200: [0.02, 0.42], 26230: [0.02, 0.08], 26260: [0.18, -0.08],
    26290: [0.18, 0.28], 26320: [-0.08, -0.18], 26350: [0.42, 0.08],
    26380: [-0.32, 0.28], 26410: [0.22, -0.22], 26440: [-0.48, 0.05],
    26470: [0.12, 0.02], 26500: [0.32, 0.18], 26530: [-0.18, 0.08],
    26710: [0.55, -0.12],
    27110: [0.02, 0.02], 27140: [0.32, -0.08], 27170: [-0.28, 0.05],
    27200: [0.05, 0.32], 27230: [-0.02, -0.38], 27260: [0.38, 0.28],
    27290: [-0.32, 0.28], 27710: [-0.48, 0.48], 27720: [0.12, -0.72],
    28110: [0.18, 0.12], 28140: [0.32, 0.02], 28177: [0.12, 0.22],
    28185: [0.18, 0.42], 28200: [0.38, 0.22], 28237: [0.08, -0.08],
    28245: [0.05, -0.28], 28260: [-0.08, 0.08], 28710: [-0.55, -0.55],
    28720: [-0.35, 0.55],
    29110: [0.28, 0.02], 29140: [-0.12, 0.08], 29155: [0.08, 0.32],
    29170: [0.05, -0.32], 29200: [-0.38, 0.08],
    30110: [0.32, 0.08], 30140: [0.05, 0.08], 30170: [-0.18, 0.12],
    30200: [-0.32, -0.08], 30230: [0.18, -0.28],
    31110: [-0.08, 0.08], 31140: [0.02, 0.32], 31170: [0.28, 0.05],
    31200: [0.08, -0.28], 31710: [-0.22, 0.18],
    36110: [0, 0],
    41111: [248, 192], 41113: [246, 200], 41115: [248, 196],
    41117: [255, 198], 41131: [272, 168], 41133: [276, 172],
    41135: [278, 180], 41150: [260, 124], 41171: [240, 176],
    41173: [246, 175], 41192: [220, 154], 41194: [222, 160],
    41196: [218, 148], 41210: [230, 166], 41220: [242, 230],
    41250: [255, 92], 41271: [222, 188], 41273: [214, 190],
    41281: [238, 138], 41285: [224, 136], 41287: [216, 136],
    41290: [254, 168], 41310: [278, 146], 41360: [292, 138],
    41370: [248, 210], 41390: [218, 180], 41410: [240, 184],
    41430: [248, 182], 41450: [286, 156], 41461: [282, 200],
    41463: [268, 192], 41465: [262, 186], 41480: [220, 112],
    41500: [318, 186], 41550: [268, 222], 41570: [208, 142],
    41590: [232, 212], 41610: [300, 172], 41630: [248, 108],
    41650: [288, 95], 41670: [338, 186], 41800: [248, 62],
    41820: [328, 112], 41830: [332, 158]
  };

  let svgCache = "";
  let activeFilter = "";
  let clusterState = [];
  let onDeletePerson = null;
  let hostName = "";

  async function paint(options) {
    const wrap = document.getElementById(options.wrapId || "korea-wrap");
    if (!wrap) {
      return;
    }
    onDeletePerson = options.onDeletePerson || null;
    hostName = options.host.name;
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

  function hashOffset(code) {
    let hash = 2166136261;
    const text = String(code || "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const nx = ((hash >>> 0) % 1000) / 1000 - 0.5;
    const ny = ((hash >>> 11) % 1000) / 1000 - 0.5;
    return [nx * 0.7, ny * 0.7];
  }

  function pinPoint(svg, sidoCode, sigunguCode) {
    const known = SIGUNGU_XY[Number(sigunguCode)];
    if (known && (Math.abs(known[0]) > 1.5 || Math.abs(known[1]) > 1.5)) {
      return known.slice();
    }
    const center = sidoCenter(svg, sidoCode);
    const box = sidoBox(svg, sidoCode);
    const [nx, ny] = known || hashOffset(sigunguCode || sidoCode);
    const w = box ? box.width : 24;
    const h = box ? box.height : 24;
    return [center[0] + nx * w * 0.42, center[1] + ny * h * 0.42];
  }

  function rankScore(person) {
    return Math.max(person.score || 0, person.reverseScore || 0);
  }

  function rankLabelOf(person) {
    return MapApp.rankMeta(person).label;
  }

  function rankColorOf(person) {
    return MapApp.rankMeta(person).color;
  }

  function buildClusters(svg, people, extras) {
    const all = people.map((person) => ({ ...person, named: true })).concat(extras);
    const byKey = new Map();
    all.forEach((person) => {
      const key = person.sigunguCode || person.sidoCode;
      if (!key) {
        return;
      }
      if (!byKey.has(key)) {
        byKey.set(key, []);
      }
      byKey.get(key).push(person);
    });
    return [...byKey.entries()].map(([key, grouped]) => {
      grouped.sort((a, b) => rankScore(b) - rankScore(a)
        || Math.min(b.score || 0, b.reverseScore || 0) - Math.min(a.score || 0, a.reverseScore || 0));
      const best = grouped[0];
      const point = pinPoint(svg, best.sidoCode, best.sigunguCode);
      return {
        id: key,
        name: best.sido || SIDO_NAME[best.sidoCode] || key,
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
    host.style.top = `${((point[1] - 14) / VIEW.h) * 100}%`;
    host.innerHTML = `
      <span class="host-ring"></span>
      <span class="host-ring is-late"></span>
      <span class="host-dot"></span>
      <span class="host-badge">${escapeHtml(name)}의 고향</span>
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
    list.innerHTML = named.map((person) => MapApp.sheetRowHtml(person, hostName, !!onDeletePerson)).join("")
      + (extra > 0 ? `<li class="is-extra"><span>그 외 ${extra}명</span></li>` : "");
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
    return MapApp.escapeHtml(value);
  }

  window.MapBoard = { paint, bindUi, closeSheet, escapeHtml };
})();
