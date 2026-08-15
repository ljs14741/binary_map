(() => {
  const form = document.getElementById("compat-form");
  const submit = document.getElementById("compat-submit");
  const errorBox = document.getElementById("compat-error");
  const resultBox = document.getElementById("compat-result");
  const sampleNode = document.getElementById("sample-json");
  const friendsNode = document.getElementById("sample-friends-json");
  const sampleRegions = sampleNode ? JSON.parse(sampleNode.textContent || "[]") : [];
  const sampleFriends = friendsNode ? JSON.parse(friendsNode.textContent || "[]") : [];
  const HOST = { name: "수현", sidoCode: "11" };
  const VIEW = { w: 800, h: 759 };
  const CENTER_FIX = { 28: [200, 152] };
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
  const DEV_MESSAGE = "아직 서비스 개발중입니다.";
  const SHARE_URL = "https://map.binaryworld.kr/";
  const SHARE_IMAGE = "https://binaryworld.kr/img/radish.png";
  const KAKAO_KEY = "8b68c737be6b8e9a8007c61ee6f9b8da";
  let activeFilter = "";
  let clusterState = [];

  paintSampleMap();
  bindSheet();
  bindFilters();
  bindShare();
  document.querySelectorAll("#sample-create-btn").forEach((button) => {
    button.addEventListener("click", () => showToast(DEV_MESSAGE));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();
    submit.disabled = true;
    submit.textContent = "접는 중...";

    try {
      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: document.getElementById("host-name").value,
          guestName: document.getElementById("guest-name").value
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "이름을 다시 확인해 주세요.");
      }
      await playReveal(data);
    } catch (error) {
      showError(error.message);
    } finally {
      submit.disabled = false;
      submit.textContent = "궁합 확인하기";
    }
  });

  async function playReveal(data) {
    resultBox.hidden = false;
    resultBox.classList.remove("is-done");
    resultBox.style.setProperty("--score-color", data.color);
    resultBox.innerHTML = `
      <p class="map-result-status" id="reveal-status">이름을 한 글자씩 접는 중</p>
      <div class="map-result-top">
        <div class="map-score is-wait" id="reveal-score">?</div>
        <div class="map-result-copy">
          <p>${escapeHtml(data.hostName)} × ${escapeHtml(data.guestName)}</p>
          <h3 id="reveal-label">...</h3>
          <span id="reveal-chip">계산 중</span>
        </div>
      </div>
      <p class="map-comment" id="reveal-comment"></p>
      <div class="map-fold">
        <div class="map-fold-letters">${data.letters.map((letter) => `<span>${escapeHtml(letter || "·")}</span>`).join("")}</div>
        ${data.stages.map((stage) => `<div class="map-fold-row">${stage.map((num) => `<span>${num}</span>`).join("")}</div>`).join("")}
      </div>
      <button type="button" class="map-cta" id="create-map-btn">내 짝꿍지도 만들기</button>
      <button type="button" class="map-share" id="result-share">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2C6.7 3.2 2.4 6.6 2.4 10.8c0 2.7 1.8 5.1 4.5 6.5l-.9 3.4c-.1.3.3.6.5.4l3.8-2.5c.6.1 1.1.1 1.7.1 5.3 0 9.6-3.4 9.6-7.6S17.3 3.2 12 3.2z"/></svg>
        이 궁합 카톡으로 보내기
      </button>
    `;
    document.getElementById("create-map-btn").addEventListener("click", () => showToast(DEV_MESSAGE));
    document.getElementById("result-share").addEventListener("click", () => {
      shareKakao({
        title: `${data.hostName} × ${data.guestName} · ${data.label}`,
        description: `${data.score}점. ${data.comment}`,
        button: "나도 이름 접어보기"
      });
    });
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });

    const letters = [...resultBox.querySelectorAll(".map-fold-letters span")];
    for (const letter of letters) {
      letter.classList.add("is-on");
      await wait(90);
    }

    const rows = [...resultBox.querySelectorAll(".map-fold-row")];
    for (let i = 0; i < rows.length; i += 1) {
      document.getElementById("reveal-status").textContent =
        i === rows.length - 1 ? "마지막 숫자를 남기는 중" : "옆 숫자를 접는 중";
      const cells = [...rows[i].querySelectorAll("span")];
      for (const cell of cells) {
        cell.classList.add("is-on");
        await wait(55);
      }
      await wait(160);
    }

    await wait(280);
    const scoreEl = document.getElementById("reveal-score");
    scoreEl.classList.remove("is-wait");
    scoreEl.classList.add("is-in");
    scoreEl.textContent = data.score;
    document.getElementById("reveal-label").textContent = data.label;
    document.getElementById("reveal-chip").textContent = `${data.score}점`;
    document.getElementById("reveal-comment").textContent = data.comment;
    document.getElementById("reveal-status").textContent = "두 사람의 이름 궁합";
    resultBox.classList.add("is-done");
  }

  async function paintSampleMap() {
    const wrap = document.getElementById("korea-wrap");
    if (!wrap) {
      return;
    }
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

    const centers = {};
    sampleRegions.forEach((region) => {
      const path = svg.querySelector(`path[data-code="${region.code}"]`);
      if (!path || typeof path.getBBox !== "function") {
        return;
      }
      const box = path.getBBox();
      if (!box.width && !box.height) {
        return;
      }
      centers[region.code] = CENTER_FIX[region.code] || [box.x + box.width / 2, box.y + box.height / 2];
    });

    const hostPoint = centers[HOST.sidoCode] || [251, 146];
    clusterState = buildClusters();

    const layer = document.createElement("div");
    layer.className = "cluster-layer";
    layer.id = "cluster-layer";
    addSparkles(layer);
    clusterState.forEach((cluster, index) => layer.appendChild(createClusterPin(cluster, index)));
    layer.appendChild(createHostPin(hostPoint));
    canvas.appendChild(layer);
    requestAnimationFrame(() => canvas.classList.add("is-ready"));
  }

  function buildClusters() {
    const friendsByCode = {};
    sampleFriends.forEach((friend) => {
      friendsByCode[friend.sidoCode] = friendsByCode[friend.sidoCode] || [];
      friendsByCode[friend.sidoCode].push({
        name: friend.name,
        sido: friend.sido,
        score: friend.score,
        label: friend.label,
        color: friend.color,
        named: true
      });
    });

    return CLUSTERS.map((cluster) => {
      const regions = sampleRegions.filter((region) => cluster.codes.includes(region.code));
      const named = cluster.codes.flatMap((code) => friendsByCode[code] || []);
      const extras = regions.flatMap((region) => {
        const used = (friendsByCode[region.code] || []).length;
        return Array.from({ length: Math.max(0, region.count - used) }, () => ({
          name: "",
          sido: region.name,
          score: scoreForLabel(region.label),
          label: region.label,
          color: region.color,
          named: false
        }));
      });
      const people = named.concat(extras).sort((a, b) => b.score - a.score);
      const best = people[0] || { score: 0, label: "", color: "#94a3b8" };
      const labels = [...new Set(people.map((person) => person.label))];
      return {
        ...cluster,
        x: CLUSTER_POS[cluster.id][0],
        y: CLUSTER_POS[cluster.id][1],
        count: people.length,
        people,
        labels,
        bestScore: best.score,
        color: best.color
      };
    }).filter((cluster) => cluster.count > 0);
  }

  function createClusterPin(cluster, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cluster-pin";
    button.dataset.id = cluster.id;
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

  function createHostPin(point) {
    const host = document.createElement("div");
    host.className = "host-pin";
    host.style.left = `${(point[0] / VIEW.w) * 100}%`;
    host.style.top = `${(point[1] / VIEW.h) * 100}%`;
    host.innerHTML = `
      <span class="host-ring"></span>
      <span class="host-ring is-late"></span>
      <span class="host-dot"></span>
      <span class="host-badge">수현 · 방장</span>
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

  function bindFilters() {
    document.querySelectorAll("#map-stats .map-stat").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.filter || "";
        activeFilter = activeFilter === key ? "" : key;
        applyFilter();
      });
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

  function bindSheet() {
    const sheet = document.getElementById("map-sheet");
    if (!sheet) {
      return;
    }
    document.getElementById("map-sheet-close").addEventListener("click", closeSheet);
    document.getElementById("map-sheet-backdrop").addEventListener("click", closeSheet);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSheet();
      }
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
      </li>
    `).join("") + (extra > 0 ? `<li class="is-extra"><span>그 외 ${extra}명</span></li>` : "");
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

  function scoreForLabel(label) {
    if (label.includes("부랄")) {
      return 92;
    }
    if (label.includes("찐")) {
      return 76;
    }
    if (label.includes("비즈니스")) {
      return 58;
    }
    if (label.includes("어색")) {
      return 38;
    }
    return 16;
  }

  function bindShare() {
    const homeShare = document.getElementById("kakao-share");
    if (homeShare) {
      homeShare.addEventListener("click", () => {
        shareKakao({
          title: "짝꿍지도",
          description: "내 주변에 짝꿍이 몇 명일까? 이름만 접어보는 이름궁합.",
          button: "나도 해보기"
        });
      });
    }
  }

  function shareKakao(payload) {
    const title = payload.title || "짝꿍지도";
    const description = payload.description || "이름만 접어보는 이름궁합";
    const button = payload.button || "나도 해보기";

    try {
      if (window.Kakao) {
        if (!Kakao.isInitialized()) {
          Kakao.init(KAKAO_KEY);
        }
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title,
            description,
            imageUrl: SHARE_IMAGE,
            link: {
              mobileWebUrl: SHARE_URL,
              webUrl: SHARE_URL
            }
          },
          buttons: [
            {
              title: button,
              link: {
                mobileWebUrl: SHARE_URL,
                webUrl: SHARE_URL
              }
            }
          ]
        });
        return;
      }
    } catch (error) {
      // Kakao SDK가 막히면 링크 복사로 넘긴다.
    }

    copyShareLink();
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      showToast("링크를 복사했어요. 카톡에 붙여넣기 하세요.");
    } catch (error) {
      showToast(SHARE_URL);
    }
  }

  function showError(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function showToast(message) {
    let toast = document.querySelector(".map-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "map-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-on");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-on"), 2600);
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
})();
