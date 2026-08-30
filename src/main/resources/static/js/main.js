(() => {
  const form = document.getElementById("compat-form");
  const submit = document.getElementById("compat-submit");
  const errorBox = document.getElementById("compat-error");
  const resultBox = document.getElementById("compat-result");
  const sampleNode = document.getElementById("sample-friends-json");
  const sampleFriends = sampleNode ? JSON.parse(sampleNode.textContent || "[]") : [];

  MapBoard.bindUi();
  paintSample();
  paintSampleFold();
  bindCreate();
  renderMyMaps().then(() => {
    if (window.location.hash === "#create-map") {
      openCreate();
    }
  });
  document.getElementById("kakao-share")?.addEventListener("click", () => {
    MapApp.shareKakao({
      title: "짝꿍지도",
      description: "이름 두 개로 궁합 보고, 내 지도에 친구를 모아보세요.",
      button: "나도 해보기",
      place: "home_hero"
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
          guestName: document.getElementById("guest-name").value,
          hostMbti: document.getElementById("host-mbti")?.value || "",
          guestMbti: document.getElementById("guest-mbti")?.value || ""
        }
      });
      MapApp.track("compat_calc", { score: data.score });
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
      <div class="map-share-card" id="share-card">
        <p class="map-result-status" id="reveal-status">이름궁합 계산 중</p>
        <div id="reveal-dual"></div>
      </div>
      ${MapApp.dualFolds(data)}
      <button type="button" class="map-save" id="save-result">이미지 저장</button>
    `;
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
    await MapApp.animateFolds(resultBox);
    document.getElementById("reveal-dual").innerHTML = MapApp.dualScores(data) + MapApp.mbtiHtml(data);
    await MapApp.animateScores(resultBox);
    document.getElementById("reveal-status").textContent = "두 사람의 이름궁합";
    resultBox.classList.add("is-done");
    document.getElementById("save-result").addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("share-card"), {
        filename: `${data.hostName}_${data.guestName}_이름궁합.png`,
        text: `${data.hostName}랑 ${data.guestName} 이름궁합`,
        place: "home_compat"
      });
    });
  }

  async function paintSampleFold() {
    const node = document.getElementById("sample-fold-json");
    const box = document.getElementById("compat-sample");
    if (!node || !box || !MapApp.foldPane) {
      return;
    }
    let data = {};
    try {
      data = JSON.parse(node.textContent || "{}");
    } catch (error) {
      return;
    }
    if (!data.letters || !data.stages) {
      return;
    }
    box.innerHTML = MapApp.foldPane(data.letters, data.stages, data.caption);
    await MapApp.animateFolds(box);
  }

  function sampleAnimalCounts(friends) {
    const grouped = new Map();
    grouped.set("호랑이", { animal: "호랑이", emoji: "🐯", count: 1 });
    (friends || []).forEach((person) => {
      if (!person.animal) {
        return;
      }
      const current = grouped.get(person.animal) || {
        animal: person.animal,
        emoji: person.animalEmoji || "",
        count: 0
      };
      current.count += 1;
      grouped.set(person.animal, current);
    });
    return [...grouped.values()].sort((a, b) => b.count - a.count || String(a.animal).localeCompare(b.animal, "ko"));
  }

  async function paintSample() {
    const friends = MapApp.sortPeople(sampleFriends);
    await MapBoard.paint({
      wrapId: "korea-wrap",
      host: { name: "수현", sidoCode: "11", sigunguCode: "11680" },
      people: friends
    });
    const list = document.getElementById("map-rank");
    if (list) {
      list.innerHTML = friends.map((person, index) => MapApp.rankRowHtml(person, index, "수현")).join("");
      MapApp.revealRank(list);
    }
    MapApp.renderAnimals(sampleAnimalCounts(friends));
  }

  function openCreate() {
    const createCard = document.getElementById("create-map");
    const myMaps = document.getElementById("my-maps");
    const hostName = document.getElementById("host-name");
    const createName = document.getElementById("create-name");
    if (hostName.value && createName && !createName.value) {
      createName.value = hostName.value;
    }
    const open = createCard && !createCard.hidden;
    const target = open ? createCard : myMaps;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (open && createName) {
      createName.focus();
    }
  }

  function bindCreate() {
    MapApp.bindRegionSelects(
      document.getElementById("create-sido"),
      document.getElementById("create-sigungu")
    );
    MapApp.bindBirthInput(document.getElementById("create-birth"));
    MapApp.bindMbtiInput(document.getElementById("host-mbti"));
    MapApp.bindMbtiInput(document.getElementById("guest-mbti"));
    MapApp.bindMbtiInput(document.getElementById("create-mbti"));
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
      MapApp.track("map_create_attempt");
      try {
        const created = await MapApp.api("/api/maps", {
          method: "POST",
          body: {
            hostName: document.getElementById("create-name").value,
            hostSigunguCode: document.getElementById("create-sigungu").value,
            hostBirthDate: document.getElementById("create-birth").value,
            hostMbti: document.getElementById("create-mbti")?.value || ""
          }
        });
        MapApp.saveMap({
          id: created.id,
          token: created.hostToken,
          name: created.hostName
        });
        MapApp.track("map_create_success");
        window.location.href = `/m/${created.id}`;
      } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
        button.disabled = false;
        button.textContent = "내 짝꿍지도 만들기";
        MapApp.track("map_create_fail", { reason: err.message });
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
    let local = [];
    try {
      local = await MapApp.pruneMaps();
      me = await MapApp.syncAccount();
    } catch (error) {
      me = { loggedIn: false, maps: [] };
    }
    const maps = mergeMaps(me, local);
    applyCreateGate(me, maps);
    if (!maps.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    title.textContent = "내 짝꿍지도 열기";
    lead.textContent = me.loggedIn
      ? "아래 버튼을 누르면 내 지도로 들어가요. 친구 초대도 거기서 해요."
      : "이 폰에만 저장된 지도예요. 카카오 로그인하면 다른 기기에서도 열 수 있어요.";
    list.innerHTML = maps.map((item) => `
      <li>
        <a class="map-mine-link" href="/m/${item.id}">
          <span>
            <strong>${MapApp.escapeHtml(item.hostName)}님의 짝꿍지도</strong>
            <small>${MapApp.escapeHtml(item.subline)}</small>
          </span>
          <em>열기</em>
        </a>
      </li>
    `).join("");
  }

  /** 계정에 붙은 지도와 이 폰에만 있는 지도를 합친다. 같은 id는 계정 쪽을 남긴다. */
  function mergeMaps(me, local) {
    const merged = new Map();
    (me.loggedIn ? me.maps || [] : []).forEach((item) => {
      merged.set(item.id, {
        id: item.id,
        hostName: item.hostName,
        subline: item.place ? `${item.place} · ${item.total}명` : "눌러서 지도 열기"
      });
    });
    (local || []).forEach((item) => {
      if (merged.has(item.id)) {
        return;
      }
      const view = item.view || {};
      const grade = view.conquest ? view.conquest.grade : "";
      const bits = [view.hostSido, `${view.total || 0}명`, grade].filter(Boolean);
      merged.set(item.id, {
        id: item.id,
        hostName: view.hostName || item.name || "내",
        subline: bits.length ? bits.join(" · ") : "눌러서 지도 열기"
      });
    });
    return [...merged.values()];
  }

  function fillAccount(el, me) {
    if (!el) {
      return;
    }
    el.hidden = !me.loggedIn;
    if (me.loggedIn) {
      el.innerHTML = `<b>카카오 로그인됨</b> · ${MapApp.escapeHtml(me.nickname || "계정")} · <a href="/logout">로그아웃</a>`;
    }
  }

  /**
   * 지도 만들기는 로그인 없이 된다. 이미 내 지도가 있을 때만 만들기 카드를 감춘다.
   * 로그인은 "만든 지도를 지키는 장치"라서 만들기 뒤로 미룬다.
   */
  function applyCreateGate(me, maps) {
    const createCard = document.getElementById("create-map");
    const gate = document.getElementById("create-gate");
    const login = document.getElementById("create-login");
    const lead = document.getElementById("create-lead");
    const hasMap = (maps || []).length > 0;
    if (login) {
      login.href = MapApp.loginUrl("/#create-map");
    }
    if (createCard) {
      createCard.hidden = hasMap;
    }
    if (gate) {
      gate.hidden = me.loggedIn;
    }
    fillAccount(document.getElementById("account-bar"), me);
    fillAccount(document.getElementById("account-bar-maps"), me);
    if (lead) {
      lead.textContent = "로그인 없이 바로 만들어요. 만든 뒤에 카카오 로그인하면 휴대폰을 바꿔도 다시 열 수 있어요.";
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
