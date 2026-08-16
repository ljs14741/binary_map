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

  function blobFromCanvas(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  function cssColorToRgb(value) {
    if (!value || value === "none") {
      return value;
    }
    if (/^#|^rgba?\(/i.test(value) && !/color\(/i.test(value)) {
      return value;
    }
    const ctx = cssColorToRgb.ctx || (cssColorToRgb.ctx = document.createElement("canvas").getContext("2d"));
    try {
      ctx.fillStyle = "#000000";
      ctx.fillStyle = value;
      return ctx.fillStyle || "#333333";
    } catch (error) {
      return "#333333";
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image"));
      img.src = url;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    let value = text;
    while (value.length > 1 && ctx.measureText(value + "…").width > maxWidth) {
      value = value.slice(0, -1);
    }
    return value + "…";
  }

  async function rasterizeSvg(svg, width, height) {
    const copy = svg.cloneNode(true);
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const lives = svg.querySelectorAll("path, circle, rect, polygon, polyline, ellipse");
    const clones = copy.querySelectorAll("path, circle, rect, polygon, polyline, ellipse");
    clones.forEach((el, index) => {
      const live = lives[index];
      if (!live) {
        return;
      }
      const cs = getComputedStyle(live);
      const fill = cssColorToRgb(cs.fill);
      if (fill && fill !== "none") {
        el.setAttribute("fill", fill);
      }
      const stroke = cssColorToRgb(cs.stroke);
      if (stroke && stroke !== "none") {
        el.setAttribute("stroke", stroke);
        el.setAttribute("stroke-width", cs.strokeWidth || "0.65");
      }
    });
    const xml = new XMLSerializer().serializeToString(copy);
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function drawMapShareCard(stage) {
    const scale = 2;
    const width = Math.ceil((stage.getBoundingClientRect().width || 360) * scale);
    const pad = 24;
    const title = (document.getElementById("stage-title") || stage.querySelector(".map-stage-head strong"))?.textContent || "짝꿍지도";
    const count = (document.getElementById("stage-count") || stage.querySelector(".map-stage-head span"))?.textContent || "";
    const caption = (document.getElementById("stage-caption") || stage.querySelector(".map-stage-caption"))?.textContent || "";
    const wrap = stage.querySelector(".korea-wrap");
    const svg = wrap ? wrap.querySelector("svg") : null;
    const mapBox = wrap ? wrap.getBoundingClientRect() : { width: 320, height: 300 };
    const mapW = Math.ceil(mapBox.width * scale);
    const mapH = Math.ceil(Math.max(240, mapBox.height) * scale);
    const stats = [...stage.querySelectorAll(".map-stat")];
    const rankItems = [...document.querySelectorAll("#map-rank li")].slice(0, 3);
    const statH = stats.length ? 78 * scale : 0;
    const rankH = rankItems.length ? 20 * scale + rankItems.length * 58 * scale : 0;
    const height = pad + 56 * scale + mapH + 36 * scale + statH + rankH + 48 * scale + pad;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.ceil(height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff4ea";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";
    ctx.fillStyle = "#2a1f1a";
    ctx.font = `800 ${22 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.fillText(fitText(ctx, title, width - pad * 2 - 120 * scale), pad, pad);
    ctx.fillStyle = "#8a6d52";
    ctx.font = `700 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(count, width - pad, pad + 6 * scale);
    ctx.textAlign = "left";
    let y = pad + 40 * scale;
    roundRect(ctx, pad - 4, y, width - pad * 2 + 8, mapH + 16 * scale, 20 * scale);
    ctx.fillStyle = "#9ecfde";
    ctx.fill();
    if (svg) {
      const mapCanvas = await rasterizeSvg(svg, mapW, mapH);
      ctx.drawImage(mapCanvas, pad, y + 8 * scale, mapW, mapH);
      [...wrap.querySelectorAll(".cluster-pin, .host-pin")].forEach((pin) => {
        const px = pad + (parseFloat(pin.style.left) / 100) * mapW;
        const py = y + 8 * scale + (parseFloat(pin.style.top) / 100) * mapH;
        const host = pin.classList.contains("host-pin");
        const color = host ? "#f5c542" : cssColorToRgb(getComputedStyle(pin).getPropertyValue("--pin") || "#ff2d95");
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(px, py, (host ? 11 : 9) * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        const badge = pin.querySelector(".cluster-badge, .host-badge");
        if (badge) {
          ctx.font = `800 ${10 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
          const label = fitText(ctx, badge.textContent.trim(), 140 * scale);
          const tw = ctx.measureText(label).width;
          roundRect(ctx, px - tw / 2 - 8 * scale, py + 12 * scale, tw + 16 * scale, 18 * scale, 9 * scale);
          ctx.fillStyle = host ? "#fff6cf" : "rgba(255,248,234,0.94)";
          ctx.fill();
          ctx.fillStyle = host ? "#9a7408" : "#4a3426";
          ctx.textAlign = "center";
          ctx.fillText(label, px, py + 15 * scale);
          ctx.textAlign = "left";
        }
      });
    }
    y += mapH + 28 * scale;
    ctx.fillStyle = "#5c4a40";
    ctx.font = `700 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(caption, width / 2, y);
    ctx.textAlign = "left";
    y += 28 * scale;
    if (stats.length) {
      const gap = 8 * scale;
      const col = (width - pad * 2 - gap * 2) / 3;
      stats.forEach((stat, index) => {
        const sx = pad + (index % 3) * (col + gap);
        const sy = y + Math.floor(index / 3) * (36 * scale + gap);
        const color = cssColorToRgb(getComputedStyle(stat).getPropertyValue("--stat") || "#ff2d95");
        roundRect(ctx, sx, sy, col, 34 * scale, 12 * scale);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = "#f0ddd0";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        const num = stat.querySelector("b")?.textContent || "0";
        const label = stat.querySelector("span")?.textContent || "";
        ctx.fillStyle = color;
        ctx.font = `800 ${13 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(num, sx + 10 * scale, sy + 6 * scale);
        ctx.fillStyle = "#6b5344";
        ctx.font = `700 ${9 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(fitText(ctx, label, col - 20 * scale), sx + 10 * scale, sy + 20 * scale);
      });
      y += (stats.length > 3 ? 78 : 42) * scale;
    }
    rankItems.forEach((item, index) => {
      const ry = y + index * 56 * scale;
      roundRect(ctx, pad, ry, width - pad * 2, 50 * scale, 14 * scale);
      ctx.fillStyle = index === 0 ? "#fff8d6" : "#fffdf9";
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = index === 0 ? "#f5c542" : index === 1 ? "#c5d0dc" : "#e0a070";
      ctx.arc(pad + 22 * scale, ry + 25 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a20";
      ctx.font = `800 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1), pad + 22 * scale, ry + 18 * scale);
      ctx.textAlign = "left";
      const name = item.querySelector("strong")?.textContent || "";
      const place = item.querySelector(".map-rank-place")?.textContent || "";
      const tag = item.querySelector(".map-rank-tag")?.textContent || "";
      ctx.fillStyle = "#2a1f1a";
      ctx.font = `800 ${14 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, name, 140 * scale), pad + 42 * scale, ry + 8 * scale);
      ctx.fillStyle = "#5c4a40";
      ctx.font = `700 ${10 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, `${place} ${tag}`.trim(), 180 * scale), pad + 42 * scale, ry + 28 * scale);
      const scores = [...item.querySelectorAll(".map-score-cell b")];
      ctx.textAlign = "right";
      ctx.fillStyle = scores[0] ? cssColorToRgb(scores[0].style.color || "#ff2d95") : "#2a1f1a";
      ctx.font = `800 ${16 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      if (scores[0]) {
        ctx.fillText(scores[0].textContent, width - pad - 12 * scale, ry + 6 * scale);
      }
      if (scores[1]) {
        ctx.fillStyle = cssColorToRgb(scores[1].style.color || "#8a7468");
        ctx.font = `800 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(scores[1].textContent, width - pad - 12 * scale, ry + 26 * scale);
      }
      ctx.textAlign = "left";
    });
    y += rankItems.length * 56 * scale + 12 * scale;
    ctx.fillStyle = "#8a6d52";
    ctx.font = `800 ${11 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("짝꿍지도 · map.binaryworld.kr", width / 2, canvas.height - 28 * scale);
    ctx.textAlign = "left";
    return blobFromCanvas(canvas);
  }

  async function drawScoreShareCard(card) {
    const scale = 2;
    const width = Math.ceil((card.getBoundingClientRect().width || 360) * scale);
    const dual = [...card.querySelectorAll(".map-dual-card")];
    const status = card.querySelector(".map-result-status")?.textContent || "이름궁합";
    const height = (dual.length ? 220 : 140) * scale;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff4ea";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#2a1f1a";
    ctx.font = `800 ${18 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(status, width / 2, 20 * scale);
    const boxW = dual.length === 2 ? (width - 56 * scale) / 2 : width - 48 * scale;
    dual.forEach((box, index) => {
      const x = 24 * scale + index * (boxW + 8 * scale);
      const y = 56 * scale;
      roundRect(ctx, x, y, boxW, 120 * scale, 18 * scale);
      ctx.fillStyle = "#fffdf9";
      ctx.fill();
      const color = cssColorToRgb(getComputedStyle(box).getPropertyValue("--score-color") || box.style.getPropertyValue("--score-color") || "#ff2d95");
      const small = box.querySelector("small")?.textContent || "";
      const score = box.querySelector("b")?.textContent || "";
      const label = box.querySelector("span")?.textContent || "";
      ctx.fillStyle = "#8a7468";
      ctx.font = `700 ${11 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, small, boxW - 16 * scale), x + boxW / 2, y + 14 * scale);
      ctx.fillStyle = color;
      ctx.font = `800 ${36 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(score, x + boxW / 2, y + 36 * scale);
      ctx.fillStyle = "#2a1f1a";
      ctx.font = `800 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, label, boxW - 16 * scale), x + boxW / 2, y + 88 * scale);
    });
    ctx.fillStyle = "#8a6d52";
    ctx.font = `800 ${11 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    ctx.fillText("짝꿍지도 · map.binaryworld.kr", width / 2, height - 28 * scale);
    ctx.textAlign = "left";
    return blobFromCanvas(canvas);
  }

  async function captureShare(element, options = {}) {
    if (!element) {
      showToast("저장할 화면이 없어요.");
      return;
    }
    const filename = options.filename || "짝꿍지도.png";
    const text = options.text || "짝꿍지도";
    showToast("이미지 만드는 중...");
    try {
      const blob = element.id === "map-stage" || element.classList.contains("map-stage")
        ? await drawMapShareCard(element)
        : await drawScoreShareCard(element);
      if (!blob) {
        throw new Error("empty");
      }
      const file = new File([blob], filename, { type: "image/png" });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "짝꿍지도", text });
          showToast("공유 창에서 인스타·스토리를 고르면 돼요.");
          return;
        }
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast("이미지를 저장했어요. 인스타 스토리에 올리면 돼요.");
    } catch (error) {
      console.error(error);
      showToast("이미지 저장에 실패했어요. 화면을 캡처해 주세요.");
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

  const HEARTS = {
    "부랄짝꿍": "💖",
    "찐 짝꿍": "💚",
    "비즈니스짝꿍": "💙",
    "어색 짝꿍": "🧡",
    "위험 짝꿍": "❤️"
  };

  function heartOf(label) {
    return HEARTS[label] || "";
  }

  function rankMeta(person) {
    if ((person.reverseScore || 0) > (person.score || 0)) {
      return {
        label: person.reverseLabel || person.label,
        color: person.reverseColor || person.color
      };
    }
    return { label: person.label, color: person.color };
  }

  function sortPeople(people) {
    return [...(people || [])].sort((a, b) => {
      const ah = Math.max(a.score || 0, a.reverseScore || 0);
      const bh = Math.max(b.score || 0, b.reverseScore || 0);
      if (bh !== ah) {
        return bh - ah;
      }
      const al = Math.min(a.score || 0, a.reverseScore || 0);
      const bl = Math.min(b.score || 0, b.reverseScore || 0);
      if (bl !== al) {
        return bl - al;
      }
      return String(a.name || "").localeCompare(String(b.name || ""), "ko");
    });
  }

  function personScoresHtml(person, hostName) {
    const reverse = person.reverseScore;
    const hasReverse = reverse != null && reverse !== "";
    return `
      <div class="map-rank-scores">
        <span class="map-score-cell">
          <small>${escapeHtml(hostName)} 먼저</small>
          <b style="color:${person.color}">${person.score}</b>
        </span>
        ${hasReverse ? `<span class="map-score-cell">
          <small>${escapeHtml(person.name)} 먼저</small>
          <b style="color:${person.reverseColor || person.color}">${reverse}</b>
        </span>` : ""}
      </div>`;
  }

  function personMetaHtml(person) {
    const rank = rankMeta(person);
    const heart = heartOf(rank.label);
    return `
      <p class="map-rank-meta">
        <span class="map-rank-place">${escapeHtml(person.sido || "")}</span>
        <span class="map-rank-tag" style="--tag:${rank.color}">${heart} ${escapeHtml(rank.label)}</span>
      </p>`;
  }

  function rankRowHtml(person, index, hostName) {
    const rank = rankMeta(person);
    const place = index < 3 ? ` is-rank-${index + 1}` : "";
    return `
      <li class="${place.trim()}" data-label="${escapeHtml(rank.label)}">
        <em>${index + 1}</em>
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          ${personMetaHtml(person)}
        </div>
        ${personScoresHtml(person, hostName)}
      </li>`;
  }

  function sheetRowHtml(person, hostName, canDelete) {
    const rank = rankMeta(person);
    return `
      <li data-label="${escapeHtml(rank.label)}">
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          ${personMetaHtml(person)}
        </div>
        ${personScoresHtml(person, hostName)}
        ${canDelete && person.id ? `<button type="button" class="map-sheet-remove" data-id="${person.id}">지우기</button>` : ""}
      </li>`;
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
    captureShare,
    api,
    syncAccount,
    heartOf,
    rankMeta,
    sortPeople,
    rankRowHtml,
    sheetRowHtml,
    escapeHtml
  };
})();
