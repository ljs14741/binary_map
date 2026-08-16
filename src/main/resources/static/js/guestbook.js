(() => {
  const form = document.getElementById("gb-form");
  const list = document.getElementById("gb-list");
  const errorBox = document.getElementById("gb-error");
  const pageInfo = document.getElementById("gb-page");
  const prevBtn = document.getElementById("gb-prev");
  const nextBtn = document.getElementById("gb-next");
  const submit = document.getElementById("gb-submit");
  if (!form || !list) {
    return;
  }

  const PAGE_SIZE = 5;
  let page = 0;
  let totalPages = 1;

  load(0);
  form.addEventListener("submit", create);
  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      load(page - 1);
    }
  });
  nextBtn.addEventListener("click", () => {
    if (page < totalPages - 1) {
      load(page + 1);
    }
  });
  list.addEventListener("click", remove);

  async function load(nextPage) {
    list.innerHTML = `<li class="map-gb-empty">불러오는 중...</li>`;
    hideError();
    try {
      const data = await MapApp.api(`/api/guestbook/paged?page=${nextPage}&size=${PAGE_SIZE}`);
      const items = data.content || [];
      page = data.number || 0;
      totalPages = Math.max(data.totalPages || 1, 1);
      if (data.page) {
        page = data.page.number || page;
        totalPages = Math.max(data.page.totalPages || totalPages, 1);
      }
      render(items);
      pageInfo.textContent = `${page + 1} / ${totalPages}`;
      prevBtn.disabled = page <= 0;
      nextBtn.disabled = page >= totalPages - 1;
    } catch (error) {
      list.innerHTML = `<li class="map-gb-empty">방명록을 불러오지 못했어요.</li>`;
    }
  }

  function render(items) {
    if (!items.length) {
      list.innerHTML = `<li class="map-gb-empty">아직 글이 없어요. 첫 줄을 남겨 주세요.</li>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <li>
        <div>
          <strong>${MapApp.escapeHtml(item.nickname)}</strong>
          <small>${MapApp.escapeHtml(formatDate(item.createdAt))}</small>
          <p>${MapApp.escapeHtml(item.content)}</p>
        </div>
        <button type="button" data-id="${item.id}">지우기</button>
      </li>
    `).join("");
  }

  async function create(event) {
    event.preventDefault();
    hideError();
    submit.disabled = true;
    try {
      await MapApp.api("/api/guestbook", {
        method: "POST",
        body: {
          nickname: document.getElementById("gb-nickname").value,
          password: document.getElementById("gb-password").value,
          content: document.getElementById("gb-content").value
        }
      });
      form.reset();
      await load(0);
      MapApp.showToast("방명록을 남겼어요.");
    } catch (error) {
      showError(error.message);
    } finally {
      submit.disabled = false;
    }
  }

  async function remove(event) {
    const button = event.target.closest("button[data-id]");
    if (!button) {
      return;
    }
    const password = window.prompt("삭제 비밀번호를 입력해 주세요.");
    if (!password) {
      return;
    }
    try {
      const response = await fetch(`/api/guestbook/${button.dataset.id}?password=${encodeURIComponent(password)}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!response.ok) {
        throw new Error("비밀번호가 틀렸거나 지우지 못했어요.");
      }
      await load(page);
      MapApp.showToast("글을 지웠어요.");
    } catch (error) {
      MapApp.showToast(error.message);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }
    return String(value).replace("T", " ").substring(0, 10);
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
