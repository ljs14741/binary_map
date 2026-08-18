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
    if (!name) {
      localStorage.removeItem("coupleJoin_" + id);
      return;
    }
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

  function useNativeSelect() {
    return window.matchMedia("(pointer: coarse)").matches
      || window.matchMedia("(hover: none)").matches;
  }

  function enhanceSelect(select) {
    if (!select || select.closest(".map-select") || useNativeSelect()) {
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
      event.preventDefault();
      event.stopPropagation();
      const item = event.target.closest("li");
      if (!item || item.classList.contains("is-disabled")) {
        return;
      }
      select.value = item.dataset.value || "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      refreshCustomSelect(select);
      wrap.classList.remove("is-open");
      btn.focus();
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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function todayDate() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function birthIso(year, month, day) {
    if (!year || !month || !day) {
      return "";
    }
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function parseBirthIso(value) {
    const text = Array.isArray(value)
      ? birthIso(value[0], value[1], value[2])
      : String(value || "").trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.slice(0, 10));
    if (!match) {
      return "";
    }
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  function parseBirthTyped(raw, minYear, maxYear) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 6) {
      const yy = Number(digits.slice(0, 2));
      const y2000 = 2000 + yy;
      const year = y2000 <= maxYear && y2000 >= minYear ? y2000 : 1900 + yy;
      return parseBirthTyped(`${year}${digits.slice(2)}`, minYear, maxYear);
    }
    if (digits.length !== 8) {
      return "";
    }
    return birthIso(digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8));
  }

  function formatBirthDigits(iso) {
    const parsed = parseBirthIso(iso);
    return parsed ? parsed.replace(/-/g, "") : "";
  }

  function formatBirthTyping(raw) {
    return String(raw || "").replace(/\D/g, "").slice(0, 8);
  }

  function isValidBirthIso(iso, minYear, maxDate) {
    const parsed = parseBirthIso(iso);
    if (!parsed) {
      return false;
    }
    const year = Number(parsed.slice(0, 4));
    const month = Number(parsed.slice(5, 7));
    const day = Number(parsed.slice(8, 10));
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }
    if (year < minYear || date > maxDate) {
      return false;
    }
    return true;
  }

  function fillBirthDays(ui) {
    const year = Number(ui.year.value) || 0;
    const month = Number(ui.month.value) || 0;
    const max = year && month ? new Date(year, month, 0).getDate() : 31;
    const keep = ui.day.value;
    if (ui.day.dataset.maxDays === String(max) && ui.day.options.length === max + 1) {
      if (keep && Number(keep) > max) {
        ui.day.value = "";
      }
      return;
    }
    ui.day.dataset.maxDays = String(max);
    ui.day.innerHTML = `<option value="">일</option>`
      + Array.from({ length: max }, (_, index) => {
        const day = index + 1;
        return `<option value="${day}">${day}일</option>`;
      }).join("");
    if (keep && Number(keep) <= max) {
      ui.day.value = keep;
    }
  }

  function writeBirthValue(el, iso) {
    const ui = el._birth;
    ui.lock = true;
    ui.valueDesc.set.call(el, iso || "");
    ui.lock = false;
  }

  function setBirthValidity(ui, iso) {
    const pickIso = birthIso(ui.year.value, ui.month.value, ui.day.value);
    const pickOk = !pickIso || isValidBirthIso(pickIso, ui.minYear, ui.maxDate);
    ui.year.setCustomValidity(pickOk ? "" : "생년월일을 확인해 주세요.");
    const typedDigits = String(ui.typed.value || "").replace(/\D/g, "");
    const typedIso = parseBirthTyped(ui.typed.value, ui.minYear, ui.maxDate.getFullYear());
    const typedOk = typedDigits.length < 8 || isValidBirthIso(typedIso || iso, ui.minYear, ui.maxDate);
    ui.typed.setCustomValidity(typedOk ? "" : "생년월일을 확인해 주세요.");
  }

  function commitBirthSelects(el) {
    const ui = el._birth;
    fillBirthDays(ui);
    const iso = birthIso(ui.year.value, ui.month.value, ui.day.value);
    if (!iso) {
      writeBirthValue(el, "");
      setBirthValidity(ui, "");
      return;
    }
    if (!isValidBirthIso(iso, ui.minYear, ui.maxDate)) {
      writeBirthValue(el, "");
      setBirthValidity(ui, iso);
      return;
    }
    writeBirthValue(el, iso);
    ui.typed.value = formatBirthDigits(iso);
    setBirthValidity(ui, iso);
  }

  function commitBirthTyped(el, draft) {
    const ui = el._birth;
    const iso = parseBirthTyped(draft, ui.minYear, ui.maxDate.getFullYear());
    if (!iso) {
      if (!String(draft || "").replace(/\D/g, "")) {
        writeBirthValue(el, "");
        setBirthValidity(ui, "");
      }
      return false;
    }
    if (!isValidBirthIso(iso, ui.minYear, ui.maxDate)) {
      setBirthValidity(ui, iso);
      return false;
    }
    ui.lock = true;
    ui.year.value = String(Number(iso.slice(0, 4)));
    ui.month.value = String(Number(iso.slice(5, 7)));
    fillBirthDays(ui);
    ui.day.value = String(Number(iso.slice(8, 10)));
    ui.lock = false;
    writeBirthValue(el, iso);
    ui.typed.value = formatBirthDigits(iso);
    setBirthValidity(ui, iso);
    return true;
  }

  function syncBirthFromValue(el) {
    const ui = el._birth;
    if (!ui || ui.lock) {
      return;
    }
    const iso = parseBirthIso(ui.valueDesc.get.call(el));
    ui.lock = true;
    if (iso && isValidBirthIso(iso, ui.minYear, ui.maxDate)) {
      ui.year.value = String(Number(iso.slice(0, 4)));
      ui.month.value = String(Number(iso.slice(5, 7)));
      fillBirthDays(ui);
      ui.day.value = String(Number(iso.slice(8, 10)));
      if (document.activeElement !== ui.typed) {
        ui.typed.value = formatBirthDigits(iso);
      }
      setBirthValidity(ui, iso);
    } else if (!iso && document.activeElement !== ui.typed) {
      ui.year.value = "";
      ui.month.value = "";
      fillBirthDays(ui);
      ui.day.value = "";
      ui.typed.value = "";
      setBirthValidity(ui, "");
    }
    ui.lock = false;
  }

  function mountBirthPicker(el) {
    const minYear = 1920;
    const maxDate = todayDate();
    const maxYear = maxDate.getFullYear();
    const valueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

    const wrap = document.createElement("div");
    wrap.className = "map-birth";

    const picks = document.createElement("div");
    picks.className = "map-birth-picks";

    const year = document.createElement("select");
    year.className = "map-birth-year";
    year.setAttribute("aria-label", "출생연도");
    year.required = true;
    year.innerHTML = `<option value="">출생연도</option>`
      + Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
        const value = maxYear - index;
        return `<option value="${value}">${value}년</option>`;
      }).join("");

    const month = document.createElement("select");
    month.className = "map-birth-month";
    month.setAttribute("aria-label", "월");
    month.required = true;
    month.innerHTML = `<option value="">월</option>`
      + Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        return `<option value="${value}">${value}월</option>`;
      }).join("");

    const day = document.createElement("select");
    day.className = "map-birth-day";
    day.setAttribute("aria-label", "일");
    day.required = true;
    day.innerHTML = `<option value="">일</option>`
      + Array.from({ length: 31 }, (_, index) => {
        const value = index + 1;
        return `<option value="${value}">${value}일</option>`;
      }).join("");

    const typed = document.createElement("input");
    typed.type = "text";
    typed.className = "map-birth-typed";
    typed.inputMode = "numeric";
    typed.autocomplete = "bday";
    typed.placeholder = "19960710";
    typed.maxLength = 10;
    typed.setAttribute("enterkeyhint", "done");
    typed.setAttribute("aria-label", "생년월일 직접 입력");

    picks.append(year, month, day);
    wrap.append(picks, typed);

    el.type = "hidden";
    el.required = false;
    el.removeAttribute("min");
    el.removeAttribute("max");
    const shell = el.closest(".map-date-shell");
    const host = shell || el;
    host.parentNode.insertBefore(wrap, host);
    wrap.appendChild(el);
    if (shell) {
      shell.remove();
    }

    el._birth = { year, month, day, typed, minYear, maxDate, valueDesc, lock: false };

    Object.defineProperty(el, "value", {
      configurable: true,
      enumerable: true,
      get() {
        return valueDesc.get.call(this);
      },
      set(next) {
        valueDesc.set.call(this, parseBirthIso(next));
        syncBirthFromValue(el);
      }
    });

    const onPick = () => {
      if (el._birth.lock) {
        return;
      }
      commitBirthSelects(el);
    };
    year.addEventListener("change", onPick);
    month.addEventListener("change", onPick);
    day.addEventListener("change", onPick);

    typed.addEventListener("input", () => {
      const next = formatBirthTyping(typed.value);
      if (typed.value !== next) {
        typed.value = next;
      }
      if (next.replace(/\D/g, "").length === 8) {
        commitBirthTyped(el, next);
      } else {
        el._birth.typed.setCustomValidity("");
      }
    });
    typed.addEventListener("blur", () => {
      if (!commitBirthTyped(el, typed.value) && el.value) {
        typed.value = formatBirthDigits(el.value);
        setBirthValidity(el._birth, el.value);
      }
    });

    const form = el.form;
    if (form && !form.dataset.birthSubmitBound) {
      form.dataset.birthSubmitBound = "true";
      const flushBirthFields = () => {
        form.querySelectorAll("input[data-birth-bound]").forEach((input) => {
          const ui = input._birth;
          if (!ui) {
            return;
          }
          if (!commitBirthTyped(input, ui.typed.value)) {
            commitBirthSelects(input);
          }
        });
      };
      form.addEventListener("click", (event) => {
        if (event.target.closest("button[type='submit'], input[type='submit']")) {
          flushBirthFields();
        }
      }, true);
      form.addEventListener("submit", flushBirthFields);
    }
  }

  function bindBirthInput(el) {
    if (!el) {
      return;
    }
    if (!el.dataset.birthBound) {
      el.dataset.birthBound = "true";
      mountBirthPicker(el);
    }
    syncBirthFromValue(el);
  }

  function chemRowText(row) {
    if (!row) {
      return "";
    }
    const key = row.querySelector(".map-chem-key")?.textContent?.trim() || "";
    const pair = row.querySelector(".map-chem-pair")?.textContent?.trim() || "";
    const fit = row.querySelector(".map-chem-fit")?.textContent?.trim() || "";
    return [key, pair, fit].filter(Boolean).join("  ");
  }

  function withEmoji(emoji, name) {
    if (!name) {
      return "";
    }
    return emoji ? `${emoji} ${name}`.trim() : name;
  }

  function chemistryHtml(data) {
    if (!data || !(data.guestAnimal || data.guestStarSign || data.chemistryLine)) {
      return "";
    }
    const animalPair = data.hostAnimal && data.guestAnimal
      ? `${data.hostAnimalEmoji || ""} ${data.hostAnimal} × ${data.guestAnimalEmoji || ""} ${data.guestAnimal}`.replace(/\s+/g, " ").trim()
      : data.guestAnimal
        ? `${data.guestAnimalEmoji || ""} ${data.guestAnimal}`.trim()
        : "";
    const starPair = data.hostStarSign && data.guestStarSign
      ? `${withEmoji(data.hostStarEmoji, data.hostStarSign)} × ${withEmoji(data.guestStarEmoji, data.guestStarSign)}`
      : withEmoji(data.guestStarEmoji, data.guestStarSign);
    return `
      <div class="map-chem">
        ${chemRow("띠", animalPair, data.animalFitLabel, "map-chem-animals")}
        ${chemRow("별자리", starPair, data.starFitLabel, "map-stars")}
        ${data.chemistryLine ? `<p class="map-chem-line">${escapeHtml(data.chemistryLine)}</p>` : ""}
      </div>`;
  }

  function chemRow(kind, pair, fit, extraClass) {
    if (!pair) {
      return "";
    }
    return `
      <div class="map-chem-row ${extraClass || ""}">
        <span class="map-chem-key">${escapeHtml(kind)}</span>
        <span class="map-chem-pair">${escapeHtml(pair)}</span>
        ${fit ? `<span class="map-chem-fit">${escapeHtml(fit)}</span>` : ""}
      </div>`;
  }

  function renderAnimals(counts) {
    const box = document.getElementById("map-animals");
    if (!box) {
      return;
    }
    const items = (counts || []).filter((item) => item && item.count > 0);
    box.hidden = items.length === 0;
    box.innerHTML = items.map((item) => `
      <span class="map-animal">${escapeHtml((item.emoji || "") + " " + (item.animal || "")).trim()} ${item.count}</span>
    `).join("");
  }

  function dualScores(data) {
    const hostCard = {
      color: data.color,
      caption: `${data.hostName} → ${data.guestName}`,
      score: data.score,
      label: data.label
    };
    const guestCard = {
      color: data.reverseColor,
      caption: `${data.guestName} → ${data.hostName}`,
      score: data.reverseScore,
      label: data.reverseLabel
    };
    const cards = Number(guestCard.score) > Number(hostCard.score)
      ? [guestCard, hostCard]
      : [hostCard, guestCard];
    return `
      <div class="map-dual">
        ${cards.map((card, index) => `
        <div class="map-dual-card" style="--score-color:${card.color}; --delay:${index * 0.08}s">
          <small>${escapeHtml(card.caption)}</small>
          <b data-score="${card.score}">0</b>
          <span>${escapeHtml(card.label)}</span>
        </div>`).join("")}
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
    const hostFold = {
      letters: data.letters,
      stages: data.stages,
      caption: `${data.hostName} → ${data.guestName}`,
      score: data.score
    };
    const guestFold = {
      letters: data.reverseLetters,
      stages: data.reverseStages,
      caption: `${data.guestName} → ${data.hostName}`,
      score: data.reverseScore
    };
    const folds = Number(guestFold.score) > Number(hostFold.score)
      ? [guestFold, hostFold]
      : [hostFold, guestFold];
    return `
      <div class="map-folds">
        ${folds.map((fold) => foldPane(fold.letters, fold.stages, fold.caption)).join("")}
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

  function animateScores(root) {
    const nodes = [...(root || document).querySelectorAll("[data-score]")];
    if (!nodes.length) {
      return Promise.resolve();
    }
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((el) => {
        el.textContent = el.dataset.score;
      });
      return Promise.resolve();
    }
    return Promise.all(nodes.map((el, index) => countUp(el, Number(el.dataset.score), 70 * index)));
  }

  function countUp(el, target, delay) {
    const goal = Number.isFinite(target) ? target : 0;
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const start = performance.now();
        const dur = 620;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - (1 - t) * (1 - t);
          el.textContent = String(Math.round(goal * eased));
          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = String(goal);
            resolve();
          }
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  }

  function celebrateJoin(name) {
    if (!name) {
      return;
    }
    const nick = String(name).replace(/\s+/g, "").slice(-2);
    document.querySelectorAll(".pin-name").forEach((el) => {
      if (el.textContent.trim() === nick) {
        el.classList.add("is-fresh");
      }
    });
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
    if (window.MapBoard && typeof MapBoard.collapseMap === "function") {
      MapBoard.collapseMap();
    }
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
    const animals = [...stage.querySelectorAll(".map-animal")];
    const rankItems = [...document.querySelectorAll("#map-rank li")].slice(0, 3);
    const statH = stats.length ? 78 * scale : 0;
    const animalH = animals.length ? 36 * scale : 0;
    const rankH = rankItems.length ? 20 * scale + rankItems.length * 58 * scale : 0;
    const height = pad + 56 * scale + mapH + 36 * scale + statH + animalH + rankH + 48 * scale + pad;
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
      const names = [...wrap.querySelectorAll(".pin-name")];
      names.forEach((nameEl) => {
        const px = pad + (parseFloat(nameEl.style.left) / 100) * mapW;
        const py = y + 8 * scale + (parseFloat(nameEl.style.top) / 100) * mapH;
        const host = nameEl.classList.contains("is-host");
        const style = getComputedStyle(nameEl);
        const nx = parseFloat(style.getPropertyValue("--nx")) || 15;
        const ny = parseFloat(style.getPropertyValue("--ny")) || 0;
        ctx.font = `800 ${11 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        const label = fitText(ctx, nameEl.textContent.trim(), 40 * scale);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4 * scale;
        ctx.strokeStyle = host ? "#fff6cf" : "#fff8ea";
        ctx.strokeText(label, px + nx * scale, py + ny * scale);
        ctx.fillStyle = host ? "#9a7408" : "#3d2a20";
        ctx.fillText(label, px + nx * scale, py + ny * scale);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
      });
      [...wrap.querySelectorAll(".cluster-pin, .host-pin")].forEach((pin) => {
        const px = pad + (parseFloat(pin.style.left) / 100) * mapW;
        const py = y + 8 * scale + (parseFloat(pin.style.top) / 100) * mapH;
        const host = pin.classList.contains("host-pin");
        const many = pin.classList.contains("is-many");
        const color = host ? "#f5c542" : cssColorToRgb(getComputedStyle(pin).getPropertyValue("--pin") || "#ff2d95");
        const dots = host ? [[0, 0]] : [...pin.querySelectorAll(".cluster-dot")].map((dot) => {
          const style = getComputedStyle(dot);
          return [parseFloat(style.getPropertyValue("--ox")) || 0, parseFloat(style.getPropertyValue("--oy")) || 0];
        });
        (dots.length ? dots : [[0, 0]]).forEach(([ox, oy]) => {
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.arc(px + ox * scale, py + oy * scale, (host ? 8 : (many ? 4 : 5)) * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = (many ? 1.5 : 2) * scale;
          ctx.stroke();
        });
      });
    }
    y += mapH + 16 * scale;
    if (caption.trim()) {
      y += 12 * scale;
      ctx.fillStyle = "#5c4a40";
      ctx.font = `700 ${12 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(caption, width / 2, y);
      ctx.textAlign = "left";
      y += 28 * scale;
    }
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
    if (animals.length) {
      ctx.fillStyle = "#5c4a40";
      ctx.font = `700 ${11 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(fitText(ctx, animals.map((item) => item.textContent.trim()).join(" · "), width - pad * 2), width / 2, y);
      ctx.textAlign = "left";
      y += 28 * scale;
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
      const tag = item.querySelector(".map-rank-tag")?.textContent || "";
      const line = item.querySelector(".map-rank-line")?.textContent || "";
      ctx.fillStyle = "#2a1f1a";
      ctx.font = `800 ${14 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, name, 88 * scale), pad + 42 * scale, ry + 8 * scale);
      ctx.fillStyle = "#c45c2d";
      ctx.font = `800 ${10 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, tag, 90 * scale), pad + 132 * scale, ry + 10 * scale);
      ctx.fillStyle = "#5c4a40";
      ctx.font = `700 ${10 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      ctx.fillText(fitText(ctx, line, 180 * scale), pad + 42 * scale, ry + 28 * scale);
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
    const chemAnimals = card.querySelector(".map-chem-animals")?.textContent || "";
    const chemLine = card.querySelector(".map-chem-line")?.textContent || "";
    const stars = card.querySelector(".map-stars")?.textContent || "";
    const starLine = card.querySelector(".map-chem-star")?.textContent || "";
    const extra = (chemAnimals || chemLine || stars || starLine) ? 120 * scale : 0;
    const height = (dual.length ? 220 : 140) * scale + extra;
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
    let extraY = (dual.length ? 188 : 108) * scale;
    if (chemAnimals || chemLine || stars || starLine) {
      ctx.fillStyle = "#2a1f1a";
      ctx.font = `800 ${13 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
      if (chemAnimals) {
        ctx.fillText(fitText(ctx, chemRowText(card.querySelector(".map-chem-animals")), width - 48 * scale), width / 2, extraY);
        extraY += 22 * scale;
      }
      if (stars) {
        ctx.fillStyle = "#2a1f1a";
        ctx.font = `800 ${13 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(fitText(ctx, chemRowText(card.querySelector(".map-stars")), width - 48 * scale), width / 2, extraY);
        extraY += 22 * scale;
      }
      if (chemLine) {
        ctx.fillStyle = "#c45c2d";
        ctx.font = `800 ${13 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(fitText(ctx, chemLine, width - 48 * scale), width / 2, extraY);
        extraY += 20 * scale;
      }
      if (starLine) {
        ctx.fillStyle = "#c45c2d";
        ctx.font = `800 ${13 * scale}px Pretendard, Apple SD Gothic Neo, sans-serif`;
        ctx.fillText(fitText(ctx, starLine, width - 48 * scale), width / 2, extraY);
      }
    }
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
          await navigator.share({ files: [file] });
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
    "인생짝꿍": "💚",
    "비즈니스짝꿍": "💙",
    "어색짝꿍": "🧡",
    "손절위기짝꿍": "❤️"
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

  function createdAtMs(person) {
    const value = person && person.createdAt;
    if (value == null || value === "") {
      return Number.POSITIVE_INFINITY;
    }
    if (typeof value === "number") {
      return value;
    }
    if (Array.isArray(value)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = value;
      return Date.UTC(year, (month || 1) - 1, day || 1, hour, minute, Math.floor(second));
    }
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
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
      const at = createdAtMs(a);
      const bt = createdAtMs(b);
      if (at !== bt) {
        return at - bt;
      }
      return String(a.name || "").localeCompare(String(b.name || ""), "ko");
    });
  }

  function personScoresHtml(person, hostName) {
    const reverse = person.reverseScore;
    const hasReverse = reverse != null && reverse !== "";
    const hostCell = {
      name: hostName,
      score: person.score,
      color: person.color
    };
    const guestCell = hasReverse ? {
      name: person.name,
      score: reverse,
      color: person.reverseColor || person.color
    } : null;
    const cells = guestCell && Number(guestCell.score) > Number(hostCell.score)
      ? [guestCell, hostCell]
      : guestCell
        ? [hostCell, guestCell]
        : [hostCell];
    return `
      <div class="map-rank-scores">
        ${cells.map((cell) => `
        <span class="map-score-cell">
          <small>${escapeHtml(cell.name)} 먼저</small>
          <b style="color:${cell.color}">${cell.score}</b>
        </span>`).join("")}
      </div>`;
  }

  function formatBirth(value) {
    if (!value) {
      return "";
    }
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      if (!year || !month || !day) {
        return "";
      }
      return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
    }
    return String(value).slice(0, 10).replace(/-/g, ".");
  }

  function personMetaHtml(person) {
    const animal = withEmoji(person.animalEmoji, person.animal);
    const star = withEmoji(person.starEmoji, person.starSign);
    const bits = [person.sido, animal, star].filter(Boolean);
    if (!bits.length) {
      return "";
    }
    return `<p class="map-rank-meta">${escapeHtml(bits.join(" · "))}</p>`;
  }

  function rankBodyHtml(person, hostName) {
    const rank = rankMeta(person);
    const heart = heartOf(rank.label);
    const comment = person.comment
      ? `<p class="map-rank-line">${escapeHtml(person.comment)}</p>`
      : "";
    return `
      <div class="map-rank-main">
        <div class="map-rank-info">
          <p class="map-rank-name">
            <strong>${escapeHtml(person.name)}</strong>
            <span class="map-rank-tag" style="--tag:${rank.color}">${heart} ${escapeHtml(rank.label)}</span>
          </p>
          ${personMetaHtml(person)}
          ${comment}
        </div>
        ${personScoresHtml(person, hostName)}
      </div>`;
  }

  function rankRowHtml(person, index, hostName) {
    const rank = rankMeta(person);
    const place = index < 3 ? ` is-rank-${index + 1}` : "";
    return `
      <li class="${place.trim()}" data-label="${escapeHtml(rank.label)}">
        <em>${index + 1}</em>
        ${rankBodyHtml(person, hostName)}
      </li>`;
  }

  function sheetRowHtml(person, hostName, canDelete) {
    const rank = rankMeta(person);
    return `
      <li data-label="${escapeHtml(rank.label)}">
        ${rankBodyHtml(person, hostName)}
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
    bindBirthInput,
    formatBirth,
    chemistryHtml,
    renderAnimals,
    dualScores,
    foldPane,
    dualFolds,
    animateFolds,
    animateScores,
    celebrateJoin,
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
