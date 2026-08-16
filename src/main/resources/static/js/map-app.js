(() => {
  const SHARE_IMAGE = "https://binaryworld.kr/img/radish.png";
  const KAKAO_KEY = "8b68c737be6b8e9a8007c61ee6f9b8da";
  const MAPS_KEY = "coupleMaps.v2";

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

  function listMaps() {
    try {
      return JSON.parse(localStorage.getItem(MAPS_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveMap(entry) {
    const maps = listMaps().filter((item) => item.id !== entry.id);
    maps.unshift(entry);
    localStorage.setItem(MAPS_KEY, JSON.stringify(maps.slice(0, 20)));
  }

  function removeMap(id) {
    localStorage.setItem(MAPS_KEY, JSON.stringify(listMaps().filter((item) => item.id !== id)));
    localStorage.removeItem("coupleJoin_" + id);
  }

  async function pruneMaps() {
    const maps = listMaps();
    const alive = [];
    await Promise.all(maps.map(async (item) => {
      try {
        await api("/api/maps/" + item.id, { token: item.token });
        alive.push(item);
      } catch (error) {
        localStorage.removeItem("coupleJoin_" + item.id);
      }
    }));
    localStorage.setItem(MAPS_KEY, JSON.stringify(alive));
    return alive;
  }

  function tokenOf(id) {
    const found = listMaps().find((item) => item.id === id);
    return found ? found.token : "";
  }

  function joinedName(id) {
    return localStorage.getItem("coupleJoin_" + id) || "";
  }

  function setJoined(id, name) {
    localStorage.setItem("coupleJoin_" + id, name);
  }

  function loginUrl(next) {
    return "/login/kakao?next=" + encodeURIComponent(next || window.location.pathname + window.location.hash);
  }

  function loadSigungus() {
    const node = document.getElementById("sigungus-json");
    try {
      return node ? JSON.parse(node.textContent || "[]") : [];
    } catch (error) {
      return [];
    }
  }

  const sigungus = loadSigungus();

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function closeCustomSelects(except) {
    document.querySelectorAll(".map-select.is-open").forEach((wrap) => {
      if (wrap !== except) {
        wrap.classList.remove("is-open");
      }
    });
  }

  function refreshCustomSelect(select) {
    const wrap = select.closest(".map-select");
    if (!wrap) {
      return;
    }
    const btn = wrap.querySelector(".map-select-btn");
    const menu = wrap.querySelector(".map-select-menu");
    if (!btn || !menu) {
      return;
    }
    menu.innerHTML = [...select.options].map((opt) => {
      const on = opt.value === select.value ? " is-on" : "";
      const disabled = opt.disabled || opt.value === "" ? " is-disabled" : "";
      return `<li class="${on}${disabled}" data-value="${escapeHtml(opt.value)}" role="option">${escapeHtml(opt.textContent)}</li>`;
    }).join("");
    const picked = select.selectedOptions[0];
    btn.textContent = picked ? picked.textContent : "골라 주세요";
    btn.classList.toggle("is-placeholder", !select.value);
  }

  function enhanceSelect(select) {
    if (!select || select.closest(".map-select")) {
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "map-select";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-select-btn";
    btn.setAttribute("aria-haspopup", "listbox");

    const menu = document.createElement("ul");
    menu.className = "map-select-menu";
    menu.setAttribute("role", "listbox");

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    select.addEventListener("invalid", () => {
      wrap.classList.add("is-invalid");
    });
    select.addEventListener("change", () => {
      wrap.classList.remove("is-invalid");
    });

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const open = !wrap.classList.contains("is-open");
      closeCustomSelects();
      wrap.classList.toggle("is-open", open);
    });
    menu.addEventListener("click", (event) => {
      const item = event.target.closest("li");
      if (!item || item.classList.contains("is-disabled")) {
        return;
      }
      select.value = item.dataset.value || "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      refreshCustomSelect(select);
      wrap.classList.remove("is-open");
    });
    refreshCustomSelect(select);
  }

  if (!window.__mapSelectBound) {
    window.__mapSelectBound = true;
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".map-select")) {
        closeCustomSelects();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCustomSelects();
      }
    });
  }

  function bindRegionSelects(sidoEl, gunguEl, selectedCode) {
    if (!sidoEl || !gunguEl) {
      return;
    }
    enhanceSelect(sidoEl);
    enhanceSelect(gunguEl);
    if (selectedCode) {
      sidoEl.value = selectedCode.slice(0, 2);
      gunguEl.dataset.selected = selectedCode;
    }
    const fill = () => {
      const sido = sidoEl.value;
      const list = sigungus.filter((item) => item.sidoCode === sido);
      const current = gunguEl.dataset.selected || gunguEl.value || "";
      gunguEl.innerHTML = `<option value="">시군구를 골라 주세요</option>`
        + list.map((item) => `<option value="${item.code}">${escapeHtml(item.label)}</option>`).join("");
      if (current && list.some((item) => item.code === current)) {
        gunguEl.value = current;
      } else {
        gunguEl.value = "";
      }
      refreshCustomSelect(sidoEl);
      refreshCustomSelect(gunguEl);
    };
    if (!sidoEl.dataset.bound) {
      sidoEl.dataset.bound = "true";
      sidoEl.addEventListener("change", () => {
        gunguEl.dataset.selected = "";
        fill();
      });
    }
    fill();
  }

  function dualScores(data) {
    return `
      <div class="map-dual">
        <div class="map-dual-card" style="--score-color:${data.color}">
          <small>${escapeHtml(data.hostName)} → ${escapeHtml(data.guestName)}</small>
          <b>${data.score}</b>
          <span>${escapeHtml(data.label)}</span>
        </div>
        <div class="map-dual-card" style="--score-color:${data.reverseColor}">
          <small>${escapeHtml(data.guestName)} → ${escapeHtml(data.hostName)}</small>
          <b>${data.reverseScore}</b>
          <span>${escapeHtml(data.reverseLabel)}</span>
        </div>
      </div>`;
  }

  function foldPane(letters, stages, caption) {
    const safeLetters = letters || [];
    const safeStages = stages || [];
    return `
      <div class="map-fold-pane">
        <p class="map-fold-cap">${escapeHtml(caption)}</p>
        <div class="map-fold">
          <div class="map-fold-letters">${safeLetters.map((letter) => `<span>${escapeHtml(letter || "·")}</span>`).join("")}</div>
          ${safeStages.map((stage) => `<div class="map-fold-row">${stage.map((num) => `<span>${num}</span>`).join("")}</div>`).join("")}
        </div>
      </div>`;
  }

  function dualFolds(data) {
    return `
      <div class="map-folds">
        ${foldPane(data.letters, data.stages, `${data.hostName} → ${data.guestName}`)}
        ${foldPane(data.reverseLetters, data.reverseStages, `${data.guestName} → ${data.hostName}`)}
      </div>`;
  }

  async function animateFolds(root) {
    const panes = [...root.querySelectorAll(".map-fold-pane")];
    for (const pane of panes) {
      for (const letter of pane.querySelectorAll(".map-fold-letters span")) {
        letter.classList.add("is-on");
        await wait(45);
      }
      for (const row of pane.querySelectorAll(".map-fold-row")) {
        for (const cell of row.querySelectorAll("span")) {
          cell.classList.add("is-on");
          await wait(30);
        }
        await wait(70);
      }
    }
  }

  async function shareKakao(payload) {
    const title = payload.title || "짝꿍지도";
    const description = payload.description || "두 이름으로 보는 이름궁합";
    const button = payload.button || "나도 해보기";
    const url = payload.url || "https://map.binaryworld.kr/";
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
            link: { mobileWebUrl: url, webUrl: url }
          },
          buttons: [{ title: button, link: { mobileWebUrl: url, webUrl: url } }]
        });
        return;
      }
    } catch (error) {
      // fall through
    }
    await copyLink(url);
  }

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크를 복사했어요. 카톡에 붙여넣기 하세요.");
    } catch (error) {
      showToast(url);
    }
  }

  async function api(url, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    if (options.body) {
      headers["Content-Type"] = "application/json";
    }
    if (options.token) {
      headers["X-Host-Token"] = options.token;
    }
    const response = await fetch(url, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (response.status === 204) {
      return null;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "다시 시도해 주세요.");
    }
    return data;
  }

  async function syncAccount() {
    const me = await api("/api/me");
    const local = listMaps().filter((item) => item.id && item.token);
    if (me.loggedIn && local.length) {
      await api("/api/maps/claim", { method: "POST", body: { maps: local } });
      return api("/api/me");
    }
    return me;
  }

  window.MapApp = {
    showToast,
    wait,
    listMaps,
    saveMap,
    removeMap,
    pruneMaps,
    tokenOf,
    joinedName,
    setJoined,
    loginUrl,
    bindRegionSelects,
    dualScores,
    dualFolds,
    animateFolds,
    shareKakao,
    copyLink,
    api,
    syncAccount
  };
})();
