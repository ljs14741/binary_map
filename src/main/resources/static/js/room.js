(() => {
  const node = document.getElementById("map-json");
  let view = node ? JSON.parse(node.textContent || "{}") : {};
  const token = MapApp.tokenOf(view.id);
  let me = { loggedIn: false, nickname: "" };

  boot();

  async function boot() {
    try {
      me = await MapApp.syncAccount();
    } catch (error) {
      // keep going
    }
    if (token || !view.host) {
      try {
        view = await MapApp.api(`/api/maps/${view.id}`, { token });
      } catch (error) {
        // keep server view
      }
    }
    MapBoard.bindUi();
    render(view);
    bind();
  }

  async function render(next) {
    view = next;
    document.title = `${view.hostName}님의 짝꿍지도`;
    const hostTitle = document.getElementById("room-host-name");
    if (hostTitle) {
      hostTitle.textContent = view.hostName;
    }
    document.getElementById("room-lead").textContent = leadText(view);
    document.getElementById("stage-title").textContent = `${view.hostName}님의 짝꿍지도`;
    document.getElementById("stage-count").textContent = `${view.total}명 참여`;
    document.getElementById("stage-caption").textContent = view.total
      ? "금색이 거주지역 · 같은 시라도 구가 다르면 핀이 갈라져요"
      : "카톡으로 보내면 친구가 사는 곳에 핀이 찍혀요";
    const people = MapApp.sortPeople(view.people);
    renderStats(view.counts);
    MapApp.renderAnimals(view.animalCounts);
    renderRank(people);
    document.getElementById("host-tools").hidden = !view.host;
    document.getElementById("guest-create").hidden = !!view.host;
    const joined = MapApp.joinedName(view.id);
    document.getElementById("join-card").hidden = !!(view.host || joined);
    if (view.host) {
      document.getElementById("edit-name").value = view.hostName;
      MapApp.bindBirthInput(document.getElementById("edit-birth"));
      document.getElementById("edit-birth").value = view.hostBirthDate || "";
      const nudge = document.getElementById("birth-nudge");
      if (nudge) {
        nudge.hidden = !!view.hostBirthDate;
      }
      MapApp.bindRegionSelects(
        document.getElementById("edit-sido"),
        document.getElementById("edit-sigungu"),
        view.hostSigunguCode
      );
      const loginBox = document.getElementById("host-login-box");
      const status = document.getElementById("account-status");
      const keep = document.getElementById("host-keep-lead");
      if (view.claimed) {
        loginBox.hidden = true;
        status.hidden = false;
        status.textContent = me.nickname
          ? `카카오 계정에 저장됨 · ${me.nickname}`
          : "카카오 계정에 저장됨";
        keep.textContent = "카톡으로 보내면 친구는 닉네임, 사는 곳, 생일을 적어요. 목록에 생일과 띠가 보여요.";
      } else {
        loginBox.hidden = false;
        status.hidden = true;
        document.getElementById("host-login").href = MapApp.loginUrl(`/m/${view.id}`);
        keep.textContent = "카톡으로 보내면 친구는 닉네임, 사는 곳, 생일을 적어요. 목록에 생일과 띠가 보여요.";
      }
    }
    await MapBoard.paint({
      wrapId: "korea-wrap",
      host: { name: view.hostName, sidoCode: view.hostSidoCode, sigunguCode: view.hostSigunguCode },
      people,
      onDeletePerson: view.host ? deletePerson : null
    });
  }

  function leadText(view) {
    const bural = (view.counts || []).find((item) => item.filterKey === "부랄짝꿍");
    const n = bural ? bural.count : 0;
    const birth = MapApp.formatBirth(view.hostBirthDate);
    const bits = [view.hostSido];
    if (birth) {
      bits.push(birth);
    }
    bits.push(`${view.total}명 참여`);
    bits.push(`부랄친구 ${n}명`);
    return bits.join(" · ");
  }

  function renderStats(counts) {
    const box = document.getElementById("map-stats");
    box.innerHTML = counts.map((count) => `
      <button type="button" class="map-stat" style="--stat:${count.color}" data-filter="${count.filterKey}">
        <b>${count.count}</b>
        <span>${count.label}</span>
      </button>
    `).join("");
  }

  function renderRank(people) {
    const list = document.getElementById("map-rank");
    list.innerHTML = people.map((person, index) => MapApp.rankRowHtml(person, index, view.hostName)).join("");
  }

  function bind() {
    MapApp.bindRegionSelects(
      document.getElementById("join-sido"),
      document.getElementById("join-sigungu")
    );
    MapApp.bindBirthInput(document.getElementById("join-birth"));
    document.getElementById("room-share").addEventListener("click", () => {
      MapApp.shareKakao({
        title: `${view.hostName}님의 짝꿍지도`,
        description: "닉네임과 생일을 적으면 궁합이 나오고, 사는 곳에 핀이 찍혀요.",
        button: "나도 들어가기",
        url: view.shareUrl
      });
    });
    document.getElementById("join-form").addEventListener("submit", join);
    document.getElementById("host-edit").addEventListener("submit", updateHost);
    document.getElementById("delete-map").addEventListener("click", removeMap);
    document.getElementById("save-map").addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("map-stage"), {
        filename: `${view.hostName}의_짝꿍지도.png`,
        text: `${view.hostName}님의 짝꿍지도`
      });
    });
  }

  async function join(event) {
    event.preventDefault();
    const error = document.getElementById("join-error");
    const button = document.getElementById("join-submit");
    error.hidden = true;
    button.disabled = true;
    button.textContent = "이름궁합 보는 중...";
    try {
      const data = await MapApp.api(`/api/maps/${view.id}/join`, {
        method: "POST",
        body: {
          guestName: document.getElementById("join-name").value,
          sigunguCode: document.getElementById("join-sigungu").value,
          birthDate: document.getElementById("join-birth").value
        }
      });
      MapApp.setJoined(view.id, data.guestName);
      document.getElementById("join-card").hidden = true;
      await playReveal(data);
      await render(data.map);
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    } finally {
      button.disabled = false;
      button.textContent = "궁합 확인하고 들어가기";
    }
  }

  async function playReveal(data) {
    const box = document.getElementById("join-result");
    box.hidden = false;
    box.classList.remove("is-done");
    box.style.setProperty("--score-color", data.color);
    box.innerHTML = `
      <div class="map-share-card" id="share-card">
        <p class="map-result-status" id="reveal-status">이름궁합 계산 중</p>
        <div id="reveal-dual"></div>
        <div id="reveal-chem"></div>
      </div>
      ${MapApp.dualFolds(data)}
      <button type="button" class="map-save" id="save-result">이미지 저장</button>
    `;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    await MapApp.animateFolds(box);
    document.getElementById("reveal-dual").innerHTML = MapApp.dualScores(data);
    const chem = document.getElementById("reveal-chem");
    if (chem) {
      chem.outerHTML = MapApp.chemistryHtml(data);
    }
    document.getElementById("reveal-status").textContent = `${data.hostName}랑 ${data.guestName}`;
    box.classList.add("is-done");
    document.getElementById("save-result").addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("share-card"), {
        filename: `${data.hostName}_${data.guestName}_이름궁합.png`,
        text: `${data.hostName}랑 ${data.guestName} 이름궁합`
      });
    });
  }

  async function updateHost(event) {
    event.preventDefault();
    const error = document.getElementById("edit-error");
    const button = document.getElementById("edit-submit");
    error.hidden = true;
    button.disabled = true;
    try {
      const next = await MapApp.api(`/api/maps/${view.id}`, {
        method: "PATCH",
        token,
        body: {
          hostName: document.getElementById("edit-name").value,
          hostSigunguCode: document.getElementById("edit-sigungu").value,
          hostBirthDate: document.getElementById("edit-birth").value
        }
      });
      if (token) {
        MapApp.saveMap({ id: next.id, token, name: next.hostName });
      }
      await render(next);
      MapApp.showToast("내 정보를 바꿨어요.");
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    } finally {
      button.disabled = false;
    }
  }

  async function deletePerson(personId) {
    if (!window.confirm("이 친구를 지도에서 지울까요?")) {
      return;
    }
    try {
      const next = await MapApp.api(`/api/maps/${view.id}/people/${personId}`, {
        method: "DELETE",
        token
      });
      MapBoard.closeSheet();
      await render(next);
    } catch (err) {
      MapApp.showToast(err.message);
    }
  }

  async function removeMap() {
    if (!window.confirm("이 짝꿍지도를 삭제할까요? 친구 핀도 같이 사라져요.")) {
      return;
    }
    try {
      await MapApp.api(`/api/maps/${view.id}`, { method: "DELETE", token });
      MapApp.removeMap(view.id);
      window.location.href = "/";
    } catch (err) {
      MapApp.showToast(err.message);
    }
  }
})();
