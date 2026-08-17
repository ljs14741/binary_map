(() => {
  const SIDO_NAME = {
    "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
    "30": "대전", "31": "울산", "36": "세종", "41": "경기", "42": "강원",
    "43": "충북", "44": "충남", "45": "전북", "46": "전남", "47": "경북",
    "48": "경남", "50": "제주"
  };
  const SIDO_TILES = [
    { code: "42", name: "강원", area: "gangwon" },
    { code: "28", name: "인천", area: "incheon" },
    { code: "11", name: "서울", area: "seoul" },
    { code: "41", name: "경기", area: "gyeonggi" },
    { code: "44", name: "충남", area: "chungnam" },
    { code: "36", name: "세종", area: "sejong" },
    { code: "43", name: "충북", area: "chungbuk" },
    { code: "47", name: "경북", area: "gyeongbuk" },
    { code: "45", name: "전북", area: "jeonbuk" },
    { code: "30", name: "대전", area: "daejeon" },
    { code: "27", name: "대구", area: "daegu" },
    { code: "31", name: "울산", area: "ulsan" },
    { code: "29", name: "광주", area: "gwangju" },
    { code: "48", name: "경남", area: "gyeongnam" },
    { code: "26", name: "부산", area: "busan" },
    { code: "46", name: "전남", area: "jeonnam" },
    { code: "50", name: "제주", area: "jeju" }
  ];

  let activeFilter = "";
  let onDeletePerson = null;
  let hostName = "";
  let board = {
    wrap: null,
    host: { name: "", sidoCode: "", sigunguCode: "" },
    people: [],
    expanded: ""
  };

  async function paint(options) {
    const wrap = document.getElementById(options.wrapId || "korea-wrap");
    if (!wrap) {
      return;
    }
    onDeletePerson = options.onDeletePerson || null;
    hostName = options.host.name;
    board.wrap = wrap;
    board.host = options.host || { name: "", sidoCode: "", sigunguCode: "" };
    board.people = (options.people || []).concat(options.extras || []);
    const homeGroups = sigunguGroups(board.host.sidoCode);
    board.expanded = homeGroups.length ? board.host.sidoCode : "";
    render();
  }

  function render() {
    if (!board.wrap) {
      return;
    }
    const canvas = document.createElement("div");
    canvas.className = "korea-canvas is-ready";
    addSparkles(canvas);
    const grid = document.createElement("div");
    grid.className = "korea-tiles";
    grid.setAttribute("role", "list");
    SIDO_TILES.forEach((sido) => grid.appendChild(createSidoTile(sido)));
    canvas.appendChild(grid);
    if (board.expanded) {
      canvas.appendChild(createDrill(board.expanded));
    }
    board.wrap.replaceChildren(canvas);
    applyFilter();
  }

  function rankLabelOf(person) {
    return MapApp.rankMeta(person).label;
  }

  function rankColorOf(person) {
    return MapApp.rankMeta(person).color;
  }

  function shortPlace(person) {
    const full = person.sido || "";
    const sidoName = SIDO_NAME[person.sidoCode] || "";
    if (sidoName && full.startsWith(sidoName)) {
      return full.slice(sidoName.length).replace(/^[\s/]+/, "") || full;
    }
    return full || SIDO_NAME[person.sidoCode] || "";
  }

  function peopleInSido(sidoCode) {
    return board.people.filter((person) => person.sidoCode === sidoCode);
  }

  function sigunguGroups(sidoCode) {
    if (!sidoCode) {
      return [];
    }
    const grouped = new Map();
    peopleInSido(sidoCode).forEach((person) => {
      const key = person.sigunguCode || sidoCode;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(person);
    });
    return [...grouped.entries()].map(([id, people]) => {
      people = MapApp.sortPeople(people);
      const best = people[0];
      return {
        id,
        name: shortPlace(best),
        fullName: best.sido || `${SIDO_NAME[sidoCode] || ""} ${shortPlace(best)}`.trim(),
        count: people.length,
        people,
        labels: [...new Set(people.map(rankLabelOf).filter(Boolean))],
        color: rankColorOf(best),
        emoji: best.animalEmoji || "",
        isHost: board.host.sigunguCode === id
      };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
  }

  function sidoSummary(sidoCode) {
    const people = MapApp.sortPeople(peopleInSido(sidoCode));
    const groups = sigunguGroups(sidoCode);
    const best = people[0];
    return {
      count: people.length,
      labels: [...new Set(people.map(rankLabelOf).filter(Boolean))],
      color: best ? rankColorOf(best) : "",
      emoji: best ? (best.animalEmoji || "") : "",
      groups
    };
  }

  function createSidoTile(sido) {
    const summary = sidoSummary(sido.code);
    const home = board.host.sidoCode === sido.code;
    const filled = summary.count > 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sido-tile sido-tile-${sido.area}`;
    button.style.gridArea = sido.area;
    button.dataset.sido = sido.code;
    button.dataset.labels = summary.labels.join(",");
    button.setAttribute("role", "listitem");
    if (filled) {
      button.classList.add("is-filled");
      button.style.setProperty("--pin", summary.color);
    }
    if (home) {
      button.classList.add("is-home");
    }
    if (board.expanded === sido.code) {
      button.classList.add("is-open");
    }
    if (!filled && !home) {
      button.disabled = true;
    }
    const bits = [sido.name];
    if (summary.count) {
      bits.push(`${summary.count}명`);
    }
    if (home) {
      bits.push(`${board.host.name}의 거주지역`);
    }
    button.setAttribute("aria-label", bits.join(", "));
    button.innerHTML = `
      ${summary.emoji ? `<span class="sido-tile-emoji">${escapeHtml(summary.emoji)}</span>` : ""}
      <span class="sido-tile-name">${escapeHtml(sido.name)}</span>
      ${summary.count ? `<b class="sido-tile-count">${summary.count}</b>` : ""}
      ${home ? `<em class="sido-tile-mark">나의 칸</em>` : ""}
    `;
    button.addEventListener("click", () => onSidoTap(sido.code));
    return button;
  }

  function onSidoTap(sidoCode) {
    const groups = sigunguGroups(sidoCode);
    if (!groups.length) {
      return;
    }
    if (board.expanded === sidoCode) {
      board.expanded = "";
      render();
      return;
    }
    board.expanded = sidoCode;
    render();
  }

  function createDrill(sidoCode) {
    const groups = sigunguGroups(sidoCode);
    const box = document.createElement("div");
    box.className = "korea-drill";
    const head = document.createElement("div");
    head.className = "korea-drill-head";
    head.innerHTML = `
      <strong>${escapeHtml(SIDO_NAME[sidoCode] || "")} · 구·시</strong>
      <button type="button" class="korea-drill-close">접기</button>
    `;
    head.querySelector("button").addEventListener("click", () => {
      board.expanded = "";
      render();
    });
    const list = document.createElement("div");
    list.className = "korea-drill-list";
    groups.forEach((group) => list.appendChild(createGunguChip(group)));
    box.append(head, list);
    return box;
  }

  function createGunguChip(group) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gungu-chip";
    button.style.setProperty("--pin", group.color);
    button.dataset.labels = group.labels.join(",");
    if (group.isHost) {
      button.classList.add("is-home");
    }
    button.innerHTML = `
      ${group.emoji ? `<span>${escapeHtml(group.emoji)}</span>` : ""}
      <strong>${escapeHtml(group.name)}</strong>
      <b>${group.count}</b>
    `;
    button.addEventListener("click", () => openSheet({
      name: group.fullName,
      count: group.count,
      people: group.people.map((person) => ({ ...person, named: true })),
      labels: group.labels,
      color: group.color
    }));
    return button;
  }

  function addSparkles(layer) {
    const spots = [
      [10, 8], [78, 6], [92, 22], [6, 48], [88, 58],
      [16, 78], [70, 86], [42, 4], [58, 92]
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
    document.querySelectorAll(".sido-tile, .gungu-chip").forEach((tile) => {
      const labels = (tile.dataset.labels || "").split(",").filter(Boolean);
      const on = !activeFilter || labels.includes(activeFilter);
      tile.classList.toggle("is-dim", !!activeFilter && !on);
      tile.classList.toggle("is-hot", !!activeFilter && on && labels.length > 0);
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
    const named = visible.filter((person) => person.named !== false);
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
