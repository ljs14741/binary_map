(() => {
  const VIEW = { w: 800, h: 759 };
  const CENTER_FIX = { 28: [200, 152], 11: [251, 146] };
  const CLUSTER_POS = {
    sudo: [268, 188],
    gangwon: [430, 168],
    chungcheong: [292, 318],
    honam: [236, 478],
    daegu: [428, 388],
    busan: [478, 508],
    jeju: [228, 688]
  };
  const CLUSTERS = [
    { id: "sudo", name: "서울/경기", codes: ["11", "41", "28"] },
    { id: "gangwon", name: "강원", codes: ["42"] },
    { id: "chungcheong", name: "대전/충청", codes: ["30", "36", "43", "44"] },
    { id: "honam", name: "광주/전라", codes: ["29", "45", "46"] },
    { id: "daegu", name: "대구/경북", codes: ["27", "47"] },
    { id: "busan", name: "부산/경남", codes: ["26", "31", "48"] },
    { id: "jeju", name: "제주", codes: ["50"] }
  ];

  let activeFilter = "";
  let clusterState = [];
  let onDeletePerson = null;

  async function paint(options) {
    const wrap = document.getElementById(options.wrapId || "korea-wrap");
    if (!wrap) {
      return;
    }
    onDeletePerson = options.onDeletePerson || null;
    const svgText = await fetch("/img/korea-sido.svg").then((res) => res.text());
    const canvas = document.createElement("div");
    canvas.className = "korea-canvas";
    canvas.innerHTML = svgText;
    const svg = canvas.querySelector("svg");
    if (!svg) {
      return;
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("role", "img");
    svg.setAttribute("overflow", "visible");
    svg.classList.add("korea-map");
    svg.querySelectorAll("path[data-code]").forEach((path) => path.classList.add("sido-land"));
    wrap.replaceChildren(canvas);

    const hostCode = options.host.sidoCode;
    const hostPath = svg.querySelector(`path[data-code="${hostCode}"]`);
    let hostPoint = CENTER_FIX[hostCode] || CLUSTER_POS.sudo;
    if (hostPath && typeof hostPath.getBBox === "function") {
      const box = hostPath.getBBox();
      if (box.width || box.height) {
        hostPoint = CENTER_FIX[hostCode] || [box.x + box.width / 2, box.y + box.height / 2];
      }
    }

    clusterState = buildClusters(options.people || [], options.extras || []);
    const layer = document.createElement("div");
    layer.className = "cluster-layer";
    addSparkles(layer);
    clusterState.forEach((cluster, index) => layer.appendChild(createClusterPin(cluster, index)));
    layer.appendChild(createHostPin(hostPoint, options.host.name));
    canvas.appendChild(layer);
    requestAnimationFrame(() => canvas.classList.add("is-ready"));
    applyFilter();
  }

  function buildClusters(people, extras) {
    const all = people.map((person) => ({ ...person, named: true })).concat(extras);
    return CLUSTERS.map((cluster) => {
      const grouped = all
        .filter((person) => cluster.codes.includes(person.sidoCode))
        .sort((a, b) => b.score - a.score);
      const best = grouped[0] || { score: 0, color: "#94a3b8" };
      return {
        ...cluster,
        x: CLUSTER_POS[cluster.id][0],
        y: CLUSTER_POS[cluster.id][1],
        count: grouped.length,
        people: grouped,
        labels: [...new Set(grouped.map((person) => person.label))],
        bestScore: best.score,
        color: best.color
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
      ? cluster.people.filter((person) => person.label === activeFilter)
      : cluster.people;
    const named = visible.filter((person) => person.named);
    const extra = visible.length - named.length;
    document.getElementById("map-sheet-title").textContent = cluster.name;
    document.getElementById("map-sheet-count").textContent = `${visible.length}명`;
    list.innerHTML = named.map((person) => `
      <li>
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          <small>${escapeHtml(person.sido)} · ${escapeHtml(person.label)}</small>
        </div>
        <b style="color:${person.color}">${person.score}</b>
        ${person.reverseScore != null ? `<small style="color:${person.reverseColor}">← ${person.reverseScore}</small>` : ""}
        ${onDeletePerson && person.id ? `<button type="button" class="map-sheet-remove" data-id="${person.id}">지우기</button>` : ""}
      </li>
    `).join("") + (extra > 0 ? `<li class="is-extra"><span>그 외 ${extra}명</span></li>` : "");
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
