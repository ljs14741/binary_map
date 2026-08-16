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
      description: "이름 두 개로 궁합 보고, 내 지도에 친구를 모아보세요.",
      button: "나도 해보기"
    });
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
      submit.textContent = "궁합 보기";
    }
  });

  async function playReveal(data) {
    resultBox.hidden = false;
    resultBox.classList.remove("is-done");
    resultBox.style.setProperty("--score-color", data.color);
    resultBox.innerHTML = `
      <p class="map-result-status" id="reveal-status">이름궁합 계산 중</p>
      <div id="reveal-dual"></div>
      ${MapApp.dualFolds(data)}
    `;
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
    await MapApp.animateFolds(resultBox);
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
      host: { name: "수현", sidoCode: "11", sigunguCode: "11680" },
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
    const hostName = document.getElementById("host-name");
    const createName = document.getElementById("create-name");
    if (hostName.value && createName && !createName.value) {
      createName.value = hostName.value;
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    if (createName && !document.getElementById("create-form").hidden) {
      createName.focus();
    }
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
    const lead = document.getElementById("my-maps-lead");
    const title = document.getElementById("my-maps-title");
    if (!box || !list) {
      return;
    }
    let me = { loggedIn: false, maps: [] };
    try {
      await MapApp.pruneMaps();
      me = await MapApp.syncAccount();
    } catch (error) {
      me = { loggedIn: false, maps: [] };
    }
    const byId = new Map();
    (me.maps || []).forEach((item) => {
      byId.set(item.id, {
        id: item.id,
        name: item.hostName,
        note: item.place ? `${item.place} · ${item.total}명` : ""
      });
    });
    MapApp.listMaps().forEach((item) => {
      if (!byId.has(item.id)) {
        byId.set(item.id, { id: item.id, name: item.name, note: "" });
      }
    });
    const maps = [...byId.values()];
    applyCreateGate(me);
    if (!maps.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    title.textContent = me.loggedIn && me.nickname ? `${me.nickname}님의 지도` : "내 짝꿍지도";
    lead.textContent = "카카오 계정에 저장된 내 지도예요.";
    list.innerHTML = maps.map((item) => `
      <li>
        <a href="/m/${item.id}">
          <strong>${MapBoard.escapeHtml(item.name)}님의 짝꿍지도</strong>
          ${item.note ? `<small>${MapBoard.escapeHtml(item.note)}</small>` : ""}
        </a>
      </li>
    `).join("");
  }

  function applyCreateGate(me) {
    const form = document.getElementById("create-form");
    const gate = document.getElementById("create-gate");
    const bar = document.getElementById("account-bar");
    const login = document.getElementById("create-login");
    const open = document.getElementById("create-open");
    const lead = document.getElementById("create-lead");
    const title = document.querySelector("#create-map h2");
    if (login) {
      login.href = MapApp.loginUrl("/#create-map");
    }
    const maps = me.maps || [];
    const hasMap = me.loggedIn && maps.length > 0;
    if (form) form.hidden = !(me.loggedIn && !hasMap);
    if (gate) gate.hidden = me.loggedIn;
    if (open) {
      open.hidden = !hasMap;
      if (hasMap) {
        open.href = `/m/${maps[0].id}`;
      }
    }
    if (bar) {
      bar.hidden = !me.loggedIn;
      if (me.loggedIn) {
        bar.innerHTML = `<b>카카오 로그인됨</b> · ${MapBoard.escapeHtml(me.nickname || "계정")} · <a href="/logout">로그아웃</a>`;
      }
    }
    if (title) {
      title.textContent = hasMap ? "내 짝꿍지도" : "내 짝꿍지도 만들기";
    }
    if (lead) {
      lead.textContent = hasMap
        ? "카카오 계정에는 지도가 하나예요. 이미 있는 지도를 열면 됩니다."
        : "지도를 만들려면 카카오 로그인이 필요해요. 계정에 저장돼서 휴대폰을 바꿔도 다시 볼 수 있어요. 친구가 들어오는 건 로그인 없이 됩니다.";
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
})();
