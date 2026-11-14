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
    bind();
    render(view);
  }

  async function render(next) {
    view = next;
    document.title = `${view.hostName}님의 짝꿍지도`;
    const hostTitle = document.getElementById("room-host-name");
    if (hostTitle) {
      hostTitle.textContent = view.hostName;
    }
    const hostSign = document.getElementById("host-sign");
    if (hostSign) {
      const sign = [view.hostAnimalEmoji, view.hostAnimal].filter(Boolean).join(" ");
      const text = view.hostStarSign
        ? `${sign} · ${[view.hostStarEmoji, view.hostStarSign].filter(Boolean).join(" ")}`.trim()
        : sign.trim();
      hostSign.hidden = !text;
      hostSign.textContent = text;
    }
    document.getElementById("room-lead").textContent = leadText(view);
    document.getElementById("stage-title").textContent = `${view.hostName}님의 짝꿍지도`;
    const stageHostSign = document.getElementById("stage-host-sign");
    if (stageHostSign) {
      const sign = [view.hostAnimalEmoji, view.hostAnimal].filter(Boolean).join(" ");
      const text = view.hostStarSign
        ? `${sign} · ${[view.hostStarEmoji, view.hostStarSign].filter(Boolean).join(" ")}`.trim()
        : sign.trim();
      stageHostSign.hidden = !text;
      stageHostSign.textContent = text;
    }
    document.getElementById("stage-count").textContent = `${view.total}명 참여`;
    const people = MapApp.sortPeople(view.people);
    renderStats(view.counts);
    renderConquest(view.conquest);
    renderThrone(people);
    MapApp.renderAnimals(view.animalCounts);
    const mbtiHead = document.getElementById("map-mbti-head");
    if (mbtiHead) {
      mbtiHead.hidden = !view.mbtiHeadline;
      mbtiHead.textContent = view.mbtiHeadline || "";
    }
    renderRank(people);
    document.getElementById("host-tools").hidden = !view.host;
    document.getElementById("guest-create").hidden = !!view.host;
    fillJoinCard(people);
    if (view.host) {
      document.getElementById("edit-name").value = view.hostName;
      MapApp.bindBirthInput(document.getElementById("edit-birth"));
      document.getElementById("edit-birth").value = view.hostBirthDate || "";
      const editMbti = document.getElementById("edit-mbti");
      if (editMbti) {
        editMbti.value = view.hostMbti || "";
      }
      MapApp.bindMbtiInput(editMbti);
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
        keep.textContent = "카톡으로 보내면 친구는 닉네임, 사는 곳, 생일을 적어요. 목록에는 띠랑 별자리만 보여요.";
      } else {
        loginBox.hidden = false;
        status.hidden = true;
        document.getElementById("host-login").href = MapApp.loginUrl(`/m/${view.id}`);
        keep.textContent = "카톡으로 보내면 친구는 닉네임, 사는 곳, 생일을 적어요. 목록에는 띠랑 별자리만 보여요.";
      }
    }
    await MapBoard.paint({
      wrapId: "korea-wrap",
      host: { name: view.hostName, sidoCode: view.hostSidoCode, sigunguCode: view.hostSigunguCode },
      people,
      onDeletePerson: view.host ? deletePerson : null
    });
  }

  function fillJoinCard(people) {
    const card = document.getElementById("join-card");
    if (!card) {
      return;
    }
    if (view.host) {
      card.hidden = true;
      return;
    }
    let joined = MapApp.joinedName(view.id);
    const mine = joined ? (people || []).find((person) => person.name === joined) : null;
    if (joined && !mine) {
      MapApp.setJoined(view.id, "");
      joined = "";
    }
    card.hidden = false;
    const editing = !!mine;
    document.getElementById("join-kicker").textContent = editing ? "내 기록" : "바로 참여";
    document.getElementById("join-title").textContent = editing
      ? "잘못 적었으면 여기서 바꿔요"
      : "닉네임과 생일만 적으면 핀이 찍혀요";
    document.getElementById("join-submit").textContent = editing
      ? "내 정보 수정"
      : "궁합 확인하고 들어가기";
    const birthEl = document.getElementById("join-birth");
    MapApp.bindBirthInput(birthEl);
    if (editing) {
      document.getElementById("join-name").value = mine.name;
      birthEl.value = (mine.birthDate || "").slice(0, 10);
      const joinMbti = document.getElementById("join-mbti");
      if (joinMbti) {
        joinMbti.value = mine.mbti || "";
      }
    }
    MapApp.bindMbtiInput(document.getElementById("join-mbti"));
    MapApp.bindRegionSelects(
      document.getElementById("join-sido"),
      document.getElementById("join-sigungu"),
      mine ? mine.sigunguCode : ""
    );
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

  /** 등급 배지 · 정복도 바 · 빈 지역 초대 문구. 자랑거리와 초대 이유를 한자리에 둔다. */
  function renderConquest(conquest) {
    const badge = document.getElementById("room-grade-badge");
    const top = document.getElementById("room-grade-top");
    const fill = document.getElementById("room-conquest-fill");
    const text = document.getElementById("room-conquest-text");
    const nudge = document.getElementById("invite-nudge");
    if (!conquest) {
      return;
    }
    if (badge) {
      badge.textContent = [conquest.gradeEmoji, conquest.grade].filter(Boolean).join(" ");
    }
    if (top) {
      top.hidden = !conquest.topPercent;
      top.textContent = conquest.topPercent ? `상위 ${conquest.topPercent}%` : "";
    }
    if (fill) {
      fill.style.width = `${conquest.percent}%`;
    }
    if (text) {
      text.textContent = `전국 정복도 ${conquest.percent}% · ${conquest.sidoFilled}/${conquest.sidoTotal}개 시도`;
    }
    if (nudge) {
      nudge.hidden = !conquest.inviteNudge;
      nudge.textContent = conquest.inviteNudge || "";
    }
  }

  /** 1등 짝꿍을 왕좌로 세운다. 게스트가 넘고 싶어지는 자리. */
  function renderThrone(people) {
    const box = document.getElementById("map-throne");
    if (!box) {
      return;
    }
    const top = (people || [])[0];
    if (!top) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    const meta = MapApp.rankMeta(top);
    const best = Math.max(top.score || 0, top.reverseScore || 0);
    box.hidden = false;
    box.style.setProperty("--throne", meta.color);
    box.innerHTML = `
      <span class="map-throne-crown" aria-hidden="true">👑</span>
      <span class="map-throne-body">
        <small>지금 ${MapApp.escapeHtml(view.hostName)}님의 1등 짝꿍</small>
        <strong>${MapApp.escapeHtml(top.name)}</strong>
        <em>${MapApp.heartOf(meta.label)} ${MapApp.escapeHtml(meta.label)}</em>
      </span>
      <b>${best}</b>`;
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
    MapApp.revealRank(list);
  }

  function bind() {
    MapApp.bindRegionSelects(
      document.getElementById("join-sido"),
      document.getElementById("join-sigungu")
    );
    MapApp.bindBirthInput(document.getElementById("join-birth"));
    MapApp.bindMbtiInput(document.getElementById("join-mbti"));
    MapApp.bindMbtiInput(document.getElementById("edit-mbti"));
    document.getElementById("host-story")?.addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("map-stage"), {
        story: true,
        url: view.shareUrl,
        filename: `${view.hostName}의_짝꿍지도_스토리.png`,
        text: `${view.hostName}님의 짝꿍지도`,
        place: "host_story"
      });
    });
    document.getElementById("room-copy")?.addEventListener("click", () => {
      MapApp.track("share_click", { method: "copy", place: "host_copy" });
      MapApp.copyLink(view.shareUrl);
    });
    document.getElementById("room-share").addEventListener("click", () => {
      const nudge = view.conquest && view.conquest.inviteNudge ? view.conquest.inviteNudge : "";
      MapApp.shareKakao({
        title: `${view.hostName}님의 짝꿍지도`,
        description: view.ogDescription || nudge || "닉네임과 생일을 적으면 궁합이 나오고, 사는 곳에 핀이 찍혀요.",
        button: "나도 들어가기",
        url: view.shareUrl,
        imageUrl: view.ogImageUrl,
        place: "room_invite"
      });
    });
    document.getElementById("guest-create")?.addEventListener("click", () => {
      MapApp.track("guest_create_click", { total: view.total });
    });
    document.getElementById("join-form").addEventListener("submit", join);
    document.getElementById("host-edit").addEventListener("submit", updateHost);
    document.getElementById("delete-map").addEventListener("click", removeMap);
    document.getElementById("story-map")?.addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("map-stage"), {
        story: true,
        url: view.shareUrl,
        filename: `${view.hostName}의_짝꿍지도_스토리.png`,
        text: `${view.hostName}님의 짝꿍지도`,
        place: "room_story"
      });
    });
    document.getElementById("save-map").addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("map-stage"), {
        filename: `${view.hostName}의_짝꿍지도.png`,
        text: `${view.hostName}님의 짝꿍지도`,
        place: "room_map"
      });
    });
  }

  async function join(event) {
    event.preventDefault();
    const error = document.getElementById("join-error");
    const button = document.getElementById("join-submit");
    const previousName = MapApp.joinedName(view.id);
    const editing = !!(previousName && (view.people || []).some((person) => person.name === previousName));
    error.hidden = true;
    button.disabled = true;
    button.textContent = editing ? "수정하는 중..." : "이름궁합 보는 중...";
    try {
      if (editing) {
        const data = await MapApp.api(`/api/maps/${view.id}/me`, {
          method: "PATCH",
          body: {
            previousName,
            guestName: document.getElementById("join-name").value,
            sigunguCode: document.getElementById("join-sigungu").value,
            birthDate: document.getElementById("join-birth").value,
            mbti: document.getElementById("join-mbti")?.value || ""
          }
        });
        MapApp.setJoined(view.id, data.guestName);
        await render(data.map);
        MapApp.showToast("내 정보를 바꿨어요.");
      } else {
        const data = await MapApp.api(`/api/maps/${view.id}/join`, {
          method: "POST",
          body: {
            guestName: document.getElementById("join-name").value,
            sigunguCode: document.getElementById("join-sigungu").value,
            birthDate: document.getElementById("join-birth").value,
            mbti: document.getElementById("join-mbti")?.value || ""
          }
        });
        MapApp.setJoined(view.id, data.guestName);
        MapApp.track("guest_join_success", { rank: data.myRank, total: data.rankTotal });
        await playReveal(data);
        await render(data.map);
        MapApp.celebrateJoin(data.guestName);
      }
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    } finally {
      button.disabled = false;
      button.textContent = editing ? "내 정보 수정" : "궁합 확인하고 들어가기";
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
        <div id="reveal-rank"></div>
        <div id="reveal-chem"></div>
      </div>
      ${MapApp.dualFolds(data)}
      <button type="button" class="map-save" id="save-result">이미지 저장</button>
    `;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    await MapApp.animateFolds(box);
    document.getElementById("reveal-dual").innerHTML = MapApp.dualScores(data) + MapApp.mbtiHtml(data);
    await MapApp.animateScores(box);
    const rankBox = document.getElementById("reveal-rank");
    if (rankBox) {
      if (data.rankLine) {
        rankBox.outerHTML = `
          <p class="map-my-rank">
            <b>${data.myRank}위</b>
            <span>${MapApp.escapeHtml(data.rankLine)}</span>
          </p>`;
      } else {
        rankBox.remove();
      }
    }
    const chem = document.getElementById("reveal-chem");
    if (chem) {
      chem.outerHTML = MapApp.chemistryHtml(data);
    }
    document.getElementById("reveal-status").textContent = `${data.hostName}랑 ${data.guestName}`;
    box.classList.add("is-done");
    document.getElementById("save-result").addEventListener("click", () => {
      MapApp.captureShare(document.getElementById("share-card"), {
        filename: `${data.hostName}_${data.guestName}_이름궁합.png`,
        text: `${data.hostName}랑 ${data.guestName} 이름궁합`,
        place: "room_result"
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
          hostBirthDate: document.getElementById("edit-birth").value,
          hostMbti: document.getElementById("edit-mbti")?.value || ""
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
