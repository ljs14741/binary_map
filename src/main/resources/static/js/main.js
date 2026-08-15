(() => {
  const form = document.getElementById("compat-form");
  const submit = document.getElementById("compat-submit");
  const errorBox = document.getElementById("compat-error");
  const resultBox = document.getElementById("compat-result");
  const sampleNode = document.getElementById("sample-json");
  const sampleRegions = sampleNode ? JSON.parse(sampleNode.textContent || "[]") : [];
  const DEV_MESSAGE = "아직 서비스 개발중입니다.";

  paintSampleMap();
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
      <button type="button" class="map-cta" id="create-map-btn">내 단짝지도 만들기</button>
    `;
    document.getElementById("create-map-btn").addEventListener("click", () => showToast(DEV_MESSAGE));
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
    wrap.innerHTML = svgText;
    const svg = wrap.querySelector("svg");
    if (!svg) {
      return;
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("role", "img");

    sampleRegions.forEach((region) => {
      const path = svg.querySelector(`path[data-code="${region.code}"]`);
      if (!path) {
        return;
      }
      path.style.fill = region.color;
      path.style.setProperty("--region-color", region.color);
      path.classList.add("is-on");
    });

    const labelLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(labelLayer);
    const labelFix = { 28: [200, 152] };
    sampleRegions.forEach((region) => {
      const path = svg.querySelector(`path[data-code="${region.code}"]`);
      if (!path || typeof path.getBBox !== "function") {
        return;
      }
      const box = path.getBBox();
      if (box.width < 18 || box.height < 14) {
        return;
      }
      const point = labelFix[region.code] || [box.x + box.width / 2, box.y + box.height / 2 + 6];
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(point[0]));
      text.setAttribute("y", String(point[1]));
      text.setAttribute("text-anchor", "middle");
      text.textContent = region.count >= 3 ? `${region.name} ${region.count}` : String(region.count);
      labelLayer.appendChild(text);
    });
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
