(() => {
  const form = document.getElementById("compat-form");
  const submit = document.getElementById("compat-submit");
  const errorBox = document.getElementById("compat-error");
  const resultBox = document.getElementById("compat-result");
  const sampleNode = document.getElementById("sample-json");
  const friendsNode = document.getElementById("sample-friends-json");
  const sampleRegions = sampleNode ? JSON.parse(sampleNode.textContent || "[]") : [];
  const sampleFriends = friendsNode ? JSON.parse(friendsNode.textContent || "[]") : [];

  MapBoard.bindUi();
  paintSample();
  renderMyMaps();
  bindCreate();
  if (window.location.hash === "#create-map") {
    openCreate();
  }
  document.getElementById("kakao-share")?.addEventListener("click", () => {
    MapApp.shareKakao({
      title: "짝꿍지도",
      description: "내 주변에 짝꿍이 몇 명일까? 두 이름으로 보는 이름궁합.",
      button: "나도 해보기"
    });
  });
  document.querySelectorAll("[data-open-create]").forEach((button) => {
    button.addEventListener("click", openCreate);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();
    submit.disabled = true;
    submit.textContent = "이름궁합 보는 중...";
    try {
      const data = await MapApp.api("/api/compatibility", {
        method: "POST",
        body: {
          hostName: document.getElementById("host-name").value,
          guestName: document.getElementById("guest-name").value
        }
      });
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
      <p class="map-result-status" id="reveal-status">이름궁합 계산 중</p>
      <div class="map-result-top">
        <div class="map-score is-wait" id="reveal-score">?</div>
        <div class="map-result-copy">
          <p>${MapBoard.escapeHtml(data.hostName)} × ${MapBoard.escapeHtml(data.guestName)}</p>
          <h3 id="reveal-label">...</h3>
          <span id="reveal-chip">계산 중</span>
        </div>
      </div>
      <div id="reveal-dual"></div>
      <div class="map-fold">
        <div class="map-fold-letters">${data.letters.map((letter) => `<span>${MapBoard.escapeHtml(letter || "·")}</span>`).join("")}</div>
        ${data.stages.map((stage) => `<div class="map-fold-row">${stage.map((num) => `<span>${num}</span>`).join("")}</div>`).join("")}
      </div>
      <button type="button" class="map-cta" data-open-create>내 짝꿍지도 만들기</button>
      <button type="button" class="map-share" id="result-share">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2C6.7 3.2 2.4 6.6 2.4 10.8c0 2.7 1.8 5.1 4.5 6.5l-.9 3.4c-.1.3.3.6.5.4l3.8-2.5c.6.1 1.1.1 1.7.1 5.3 0 9.6-3.4 9.6-7.6S17.3 3.2 12 3.2z"/></svg>
        이 궁합 카톡으로 보내기
      </button>
    `;
    resultBox.querySelector("[data-open-create]").addEventListener("click", openCreate);
    document.getElementById("result-share").addEventListener("click", () => {
      MapApp.shareKakao({
        title: `${data.hostName} × ${data.guestName} · ${data.label}`,
        description: `${data.score}점. ${data.comment}`,
        button: "나도 이름궁합 해보기"
      });
    });
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });

    const letters = [...resultBox.querySelectorAll(".map-fold-letters span")];
    for (const letter of letters) {
      letter.classList.add("is-on");
      await MapApp.wait(90);
    }
    const rows = [...resultBox.querySelectorAll(".map-fold-row")];
    for (let i = 0; i < rows.length; i += 1) {
      document.getElementById("reveal-status").textContent =
        i === rows.length - 1 ? "점수를 내는 중" : "궁합 숫자를 맞추는 중";
      for (const cell of rows[i].querySelectorAll("span")) {
        cell.classList.add("is-on");
        await MapApp.wait(55);
      }
      await MapApp.wait(160);
    }
    await MapApp.wait(280);
    const scoreEl = document.getElementById("reveal-score");
    scoreEl.classList.remove("is-wait");
    scoreEl.classList.add("is-in");
    scoreEl.textContent = data.score;
    document.getElementById("reveal-label").textContent = data.label;
    document.getElementById("reveal-chip").textContent = `${data.score}점`;
    document.getElementById("reveal-dual").innerHTML = MapApp.dualScores(data);
    document.getElementById("reveal-status").textContent = "두 사람의 이름궁합";
    resultBox.classList.add("is-done");
  }

  async function paintSample() {
    const extras = [];
    sampleRegions.forEach((region) => {
      const used = sampleFriends.filter((friend) => friend.sidoCode === region.code).length;
      for (let i = 0; i < Math.max(0, region.count - used); i += 1) {
        extras.push({
          sido: region.name,
          sidoCode: region.code,
          score: scoreForLabel(region.label),
          label: region.label,
          color: region.color
        });
      }
    });
    await MapBoard.paint({
      wrapId: "korea-wrap",
      host: { name: "수현", sidoCode: "11" },
      people: sampleFriends,
      extras
    });
  }

  function scoreForLabel(label) {
    if (label.includes("부랄")) return 92;
    if (label.includes("찐")) return 76;
    if (label.includes("비즈니스")) return 58;
    if (label.includes("어색")) return 38;
    return 16;
  }

  function openCreate() {
    const card = document.getElementById("create-map");
    card.hidden = false;
    const hostName = document.getElementById("host-name");
    const createName = document.getElementById("create-name");
    if (hostName.value && !createName.value) {
      createName.value = hostName.value;
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    createName.focus();
  }

  function bindCreate() {
    MapApp.bindRegionSelects(
      document.getElementById("create-sido"),
      document.getElementById("create-sigungu")
    );
    const createForm = document.getElementById("create-form");
    if (!createForm) {
      return;
    }
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = document.getElementById("create-error");
      const button = document.getElementById("create-submit");
      error.hidden = true;
      button.disabled = true;
      button.textContent = "만드는 중...";
      try {
        const created = await MapApp.api("/api/maps", {
          method: "POST",
          body: {
            hostName: document.getElementById("create-name").value,
            hostSigunguCode: document.getElementById("create-sigungu").value
          }
        });
        MapApp.saveMap({
          id: created.id,
          token: created.hostToken,
          name: created.hostName
        });
        window.location.href = `/m/${created.id}`;
      } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
        button.disabled = false;
        button.textContent = "내 짝꿍지도 만들기";
      }
    });
  }

  async function renderMyMaps() {
    const box = document.getElementById("my-maps");
    const list = document.getElementById("my-maps-list");
    const login = document.getElementById("kakao-login");
    const logout = document.getElementById("kakao-logout");
    const lead = document.getElementById("my-maps-lead");
    const title = document.getElementById("my-maps-title");
    if (!box || !list) {
      return;
    }
    let me = { loggedIn: false, maps: [] };
    try {
      me = await MapApp.syncAccount();
    } catch (error) {
      me = { loggedIn: false, maps: [] };
    }
    const local = MapApp.listMaps();
    const byId = new Map();
    (me.maps || []).forEach((item) => {
      byId.set(item.id, {
        id: item.id,
        name: item.hostName,
        note: item.place ? `${item.place} · ${item.total}명` : "카카오 계정 지도"
      });
    });
    local.forEach((item) => {
      if (!byId.has(item.id)) {
        byId.set(item.id, { id: item.id, name: item.name, note: "이 폰에서 만든 지도" });
      }
    });
    const maps = [...byId.values()];
    login.href = MapApp.loginUrl("/");
    login.hidden = me.loggedIn;
    logout.hidden = !me.loggedIn;
    const heroLogin = document.getElementById("hero-login");
    if (heroLogin) {
      heroLogin.href = MapApp.loginUrl("/");
      heroLogin.hidden = me.loggedIn;
    }
    if (!maps.length && !me.loggedIn) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    title.textContent = me.loggedIn ? `${me.nickname}님의 짝꿍지도` : "내가 만든 짝꿍지도";
    lead.textContent = me.loggedIn
      ? "이 계정에 연결된 지도예요. 다른 폰에서도 볼 수 있어요."
      : "지금은 이 폰에만 저장돼 있어요. 로그인하면 다른 폰에서도 관리할 수 있어요.";
    list.innerHTML = maps.length ? maps.map((item) => `
      <li>
        <a href="/m/${item.id}">
          <strong>${MapBoard.escapeHtml(item.name)}님의 짝꿍지도</strong>
          <small>${MapBoard.escapeHtml(item.note)}</small>
        </a>
      </li>
    `).join("") : "<li><small>아직 연결된 지도가 없어요.</small></li>";
  }

  function showError(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
})();
