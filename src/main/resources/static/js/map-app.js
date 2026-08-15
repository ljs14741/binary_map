(() => {
  const SHARE_IMAGE = "https://binaryworld.kr/img/radish.png";
  const KAKAO_KEY = "8b68c737be6b8e9a8007c61ee6f9b8da";
  const MAPS_KEY = "coupleMaps";

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

  async function shareKakao(payload) {
    const title = payload.title || "짝꿍지도";
    const description = payload.description || "이름만 접어보는 이름궁합";
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

    async function api(url, options) {
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

  window.MapApp = {
    showToast,
    wait,
    listMaps,
    saveMap,
    removeMap,
    tokenOf,
    joinedName,
    setJoined,
    shareKakao,
    copyLink,
    api
  };
})();
