(() => {
  const node = document.getElementById("map-json");
  let view = node ? JSON.parse(node.textContent || "{}") : {};
  const token = MapApp.tokenOf(view.id);

  boot();

  async function boot() {
    try {
      await MapApp.syncAccount();
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
    document.getElementById("room-lead").textContent = `${view.hostSido} · ${view.total}명`;
    document.getElementById("stage-title").textContent = `${view.hostName}님의 짝꿍지도`;
    document.getElementById("stage-count").textContent = `${view.total}명`;
    document.getElementById("stage-caption").textContent = view.total
      ? "빛나는 금색이 방장 · 핀을 누르면 그 동네 친구가 나와요"
      : "링크를 보내면 친구가 사는 도에 핀이 찍혀요";
    renderStats(view.counts);
    renderRank(view.people);
    document.getElementById("host-tools").hidden = !view.host;
    document.getElementById("guest-create").hidden = !!view.host;
    const joined = MapApp.joinedName(view.id);
    document.getElementById("join-card").hidden = !!(view.host || joined);
    if (view.host) {
      document.getElementById("edit-name").value = view.hostName;
      MapApp.bindRegionSelects(
        document.getElementById("edit-sido"),
        document.getElementById("edit-sigungu"),
        view.hostSigunguCode
      );
      const login = document.getElementById("host-login");
      const keep = document.getElementById("host-keep-lead");
      if (view.claimed) {
        login.hidden = true;
        keep.textContent = "카카오 계정에 연결된 지도예요. 다른 폰에서도 이 계정으로 관리할 수 있어요.";
      } else {
        login.hidden = false;
        login.href = MapApp.loginUrl(`/m/${view.id}`);
        keep.textContent = "이 지도를 관리할 수 있는 건 지금 이 폰이에요. 로그인하면 다른 폰에서도 관리할 수 있어요.";
      }
    }
    await MapBoard.paint({
      wrapId: "korea-wrap",
      host: { name: view.hostName, sidoCode: view.hostSidoCode },
      people: view.people,
      onDeletePerson: view.host ? deletePerson : null
    });
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
    list.innerHTML = people.map((person, index) => `
      <li data-label="${person.label}">
        <em>${index + 1}</em>
        <div>
          <strong>${MapBoard.escapeHtml(person.name)}</strong>
          <small>${MapBoard.escapeHtml(person.sido)} · ${MapBoard.escapeHtml(person.label)}</small>
        </div>
        <div class="map-rank-scores">
          <b style="color:${person.color}">${person.score}</b>
          <em style="color:${person.reverseColor}">← ${person.reverseScore}</em>
        </div>
      </li>
    `).join("");
  }

  function bind() {
    MapApp.bindRegionSelects(
      document.getElementById("join-sido"),
      document.getElementById("join-sigungu")
    );
    document.getElementById("copy-link").addEventListener("click", () => MapApp.copyLink(view.shareUrl));
    document.getElementById("room-share").addEventListener("click", () => {
      MapApp.shareKakao({
        title: `${view.hostName}님의 짝꿍지도`,
        description: "이름만 적으면 이름궁합이 나오고, 사는 곳에 핀이 찍혀요.",
        button: "나도 들어가기",
        url: view.shareUrl
      });
    });
    document.getElementById("join-form").addEventListener("submit", join);
    document.getElementById("host-edit").addEventListener("submit", updateHost);
    document.getElementById("delete-map").addEventListener("click", removeMap);
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
          sigunguCode: document.getElementById("join-sigungu").value
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
    `;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    for (const letter of box.querySelectorAll(".map-fold-letters span")) {
      letter.classList.add("is-on");
      await MapApp.wait(90);
    }
    const rows = [...box.querySelectorAll(".map-fold-row")];
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
    document.getElementById("reveal-status").textContent = `${data.hostName}랑 ${data.guestName}`;
    box.classList.add("is-done");
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
          hostSigunguCode: document.getElementById("edit-sigungu").value
        }
      });
      if (token) {
        MapApp.saveMap({ id: next.id, token, name: next.hostName });
      }
      await render(next);
      MapApp.showToast("방장 정보를 바꿨어요.");
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
