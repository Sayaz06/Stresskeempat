// ui.js — Recursive Subtopics Version
// ------------------------------------------------------------
// HEADER, ROUTER, FOOTER
// ------------------------------------------------------------

function renderApp() {
  const root = document.getElementById("app-root");
  root.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  shell.appendChild(renderHeader());
  shell.appendChild(renderContent());
  shell.appendChild(renderFooter());

  root.appendChild(shell);
}

/* ---------------- HEADER ---------------- */

function renderHeader() {
  const header = document.createElement("div");
  header.className = "app-header";

  const brand = document.createElement("div");
  brand.className = "app-brand";

  const title = document.createElement("div");
  title.className = "app-title";
  title.textContent = "Stresskeempat";

  const subtitle = document.createElement("div");
  subtitle.className = "app-subtitle";
  subtitle.textContent = "Nota Subjek";

  brand.appendChild(title);
  brand.appendChild(subtitle);

  const right = document.createElement("div");

  if (AppState.user) {
    right.className = "app-user-pill";

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = (AppState.user.displayName || AppState.user.email)[0].toUpperCase();

    const email = document.createElement("div");
    email.className = "user-email";
    email.textContent = AppState.user.email;

    const btnLogout = document.createElement("button");
    btnLogout.className = "btn-ghost";
    btnLogout.textContent = "Log keluar";
    btnLogout.onclick = () => signOut();

    right.appendChild(avatar);
    right.appendChild(email);
    right.appendChild(btnLogout);
  } else {
    right.className = "text-muted";
    right.textContent = "Sila log masuk";
  }

  header.appendChild(brand);
  header.appendChild(right);

  return header;
}

/* ---------------- ROUTER ---------------- */

function renderContent() {
  const container = document.createElement("div");
  container.className = "app-content";

  if (!AppState.user || AppState.view === "login") {
    container.appendChild(renderLoginView());
    return container;
  }

  if (AppState.view === "subjects") {
    container.appendChild(renderSubjectsView());
  } else if (AppState.view === "versions") {
    container.appendChild(renderVersionsView());
  } else if (AppState.view === "topics") {
    container.appendChild(renderTopicsView());
  } else if (AppState.view === "subtopics") {
    container.appendChild(renderSubtopicsView());
  } else if (AppState.view === "logs") {
    container.appendChild(renderLogsView());
  }

  return container;
}

/* ---------------- FOOTER ---------------- */

function renderFooter() {
  const footer = document.createElement("div");
  footer.className = "app-footer";

  const left = document.createElement("div");
  left.textContent = "Data disimpan dalam Firestore";

  const right = document.createElement("div");
  right.className = "sync-pill";

  const dot = document.createElement("span");
  dot.textContent = "●";
  dot.style.color = AppState.syncing ? "#f97316" : "#22c55e";

  const label = document.createElement("span");
  label.textContent = AppState.syncing ? "Menyimpan..." : "Tersimpan";

  right.appendChild(dot);
  right.appendChild(label);

  footer.appendChild(left);
  footer.appendChild(right);

  return footer;
}

function updateFooterSync() {
  const root = document.getElementById("app-root");
  if (!root) return;

  const footer = root.querySelector(".app-footer");
  if (!footer) return;

  const pill = footer.querySelector(".sync-pill");
  if (!pill) return;

  pill.innerHTML = "";

  const dot = document.createElement("span");
  dot.textContent = "●";
  dot.style.color = AppState.syncing ? "#f97316" : "#22c55e";

  const label = document.createElement("span");
  label.textContent = AppState.syncing ? "Menyimpan..." : "Tersimpan";

  pill.appendChild(dot);
  pill.appendChild(label);
}

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

function renderLoginView() {
  const card = document.createElement("div");
  card.className = "login-card";

  const title = document.createElement("div");
  title.className = "login-title";
  title.textContent = "Log masuk untuk mula";

  const subtitle = document.createElement("div");
  subtitle.className = "login-subtitle";
  subtitle.textContent = "Nota anda disimpan di awan.";

  const btn = document.createElement("button");
  btn.className = "btn-primary";
  btn.onclick = () => signInWithGoogle();

  const icon = document.createElement("span");
  icon.className = "btn-icon-circle";
  icon.textContent = "G";

  const text = document.createElement("span");
  text.textContent = "Log masuk dengan Google";

  btn.appendChild(icon);
  btn.appendChild(text);

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(btn);

  return card;
}

// ------------------------------------------------------------
// SHARED UI PIECES
// ------------------------------------------------------------

function createSearchRow(placeholder, onSearch, onAdd, addLabel) {
  const row = document.createElement("div");
  row.className = "search-row";

  const input = document.createElement("input");
  input.className = "input-search";
  input.placeholder = placeholder;
  input.value = AppState.searchText;
  input.oninput = (e) => {
    AppState.searchText = e.target.value;
    onSearch();
  };

  const btn = document.createElement("button");
  btn.className = "btn-secondary";
  btn.onclick = () => onAdd();

  const icon = document.createElement("span");
  icon.className = "btn-secondary-icon";
  icon.textContent = "+";

  const label = document.createElement("span");
  label.textContent = addLabel;

  btn.appendChild(icon);
  btn.appendChild(label);

  row.appendChild(input);
  row.appendChild(btn);

  return row;
}

function renderBreadcrumbForSubtopics() {
  // Perniagaan › Semester 1 › Topik Aidil › Cara Berjalan › Teknik Betul
  const parts = [];

  if (AppState.currentSubject) {
    parts.push(AppState.currentSubject.name);
  }
  if (AppState.currentVersion) {
    parts.push(AppState.currentVersion.name);
  }
  if (AppState.currentTopic) {
    parts.push(AppState.currentTopic.name);
  }
  AppState.currentSubtopicPath.forEach(sub => {
    parts.push(sub.name);
  });

  return parts.join(" › ");
}

// ------------------------------------------------------------
// SUBJECTS
// ------------------------------------------------------------

function renderSubjectsView() {
  const container = document.createElement("div");

  const header = document.createElement("div");
  header.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Nota Subjek";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Tambah subjek, versi, topik dan subtopik.";

  left.appendChild(title);
  left.appendChild(subtitle);

  const right = document.createElement("div");

  const logBtn = document.createElement("button");
  logBtn.className = "btn-secondary";
  logBtn.onclick = () => {
    setView("logs");
    renderApp();
  };

  const icon = document.createElement("span");
  icon.className = "btn-secondary-icon";
  icon.textContent = "⏱";

  const label = document.createElement("span");
  label.textContent = "Log Sejarah";

  logBtn.appendChild(icon);
  logBtn.appendChild(label);

  right.appendChild(logBtn);

  header.appendChild(left);
  header.appendChild(right);

  container.appendChild(header);

  const searchRow = createSearchRow(
    "Cari subjek...",
    () => reloadSubjects(container),
    async () => {
      const name = prompt("Nama subjek:");
      if (name) {
        await createSubject(name);
        reloadSubjects(container);
      }
    },
    "Tambah Subjek"
  );

  container.appendChild(searchRow);

  const list = document.createElement("div");
  list.className = "list-stack";
  list.id = "subjects-list";
  container.appendChild(list);

  reloadSubjects(container);

  return container;
}

async function reloadSubjects(container) {
  const list = container.querySelector("#subjects-list");
  list.innerHTML = "";

  const items = await listSubjects(AppState.searchText);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada subjek.";
    list.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const header = document.createElement("div");
    header.className = "item-card-header";

    const left = document.createElement("div");
    left.className = "item-card-title";
    left.textContent = item.name;

    const right = document.createElement("div");
    right.className = "item-actions";

    const badge = document.createElement("span");
    badge.className = "badge-level";
    badge.textContent = "Subjek";

    const edit = document.createElement("button");
    edit.className = "icon-btn";
    edit.innerHTML = "✎";
    edit.onclick = async (e) => {
      e.stopPropagation();
      const name = prompt("Nama subjek:", item.name);
      if (name) {
        await updateSubjectName(item.id, name);
        reloadSubjects(container);
      }
    };

    const del = document.createElement("button");
    del.className = "icon-btn danger";
    del.innerHTML = "✕";
    del.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam subjek ini beserta semua anak?")) {
        await deleteSubjectCascade(item.id);
        reloadSubjects(container);
      }
    };

    right.appendChild(badge);
    right.appendChild(edit);
    right.appendChild(del);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    card.onclick = () => {
      setCurrentSubject(item);
      setView("versions");
      AppState.searchText = "";
      renderApp();
    };

    list.appendChild(card);
  });
}

// ------------------------------------------------------------
// VERSIONS
// ------------------------------------------------------------

function renderVersionsView() {
  const container = document.createElement("div");

  const back = document.createElement("div");
  back.className = "back-row";

  const btn = document.createElement("button");
  btn.className = "back-btn";
  btn.innerHTML = "⟵ <span>Subjek</span>";
  btn.onclick = () => {
    setView("subjects");
    setCurrentSubject(null);
    AppState.searchText = "";
    renderApp();
  };

  const crumb = document.createElement("div");
  crumb.className = "breadcrumb";
  crumb.textContent = AppState.currentSubject.name;

  back.appendChild(btn);
  back.appendChild(crumb);
  container.appendChild(back);

  const header = document.createElement("div");
  header.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Versi Nota";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Contoh: Semester 1, Ulangan, Nota Ringkas";

  left.appendChild(title);
  left.appendChild(subtitle);
  header.appendChild(left);

  container.appendChild(header);

  const searchRow = createSearchRow(
    "Cari versi...",
    () => reloadVersions(container),
    async () => {
      const name = prompt("Nama versi:");
      if (name) {
        await createVersion(AppState.currentSubject.id, name);
        reloadVersions(container);
      }
    },
    "Tambah Versi"
  );

  container.appendChild(searchRow);

  const list = document.createElement("div");
  list.className = "list-stack";
  list.id = "versions-list";
  container.appendChild(list);

  reloadVersions(container);

  return container;
}

async function reloadVersions(container) {
  const list = container.querySelector("#versions-list");
  list.innerHTML = "";

  const items = await listVersions(AppState.currentSubject.id, AppState.searchText);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada versi.";
    list.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const header = document.createElement("div");
    header.className = "item-card-header";

    const left = document.createElement("div");
    left.className = "item-card-title";
    left.textContent = item.name;

    const right = document.createElement("div");
    right.className = "item-actions";

    const badge = document.createElement("span");
    badge.className = "badge-level";
    badge.textContent = "Versi";

    const edit = document.createElement("button");
    edit.className = "icon-btn";
    edit.innerHTML = "✎";
    edit.onclick = async (e) => {
      e.stopPropagation();
      const name = prompt("Nama versi:", item.name);
      if (name) {
        await updateVersionName(item.id, name);
        reloadVersions(container);
      }
    };

    const del = document.createElement("button");
    del.className = "icon-btn danger";
    del.innerHTML = "✕";
    del.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam versi ini beserta semua topik dan subtopik?")) {
        await deleteVersionCascade(item.id);
        reloadVersions(container);
      }
    };

    right.appendChild(badge);
    right.appendChild(edit);
    right.appendChild(del);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    card.onclick = () => {
      setCurrentVersion(item);
      setView("topics");
      AppState.searchText = "";
      renderApp();
    };

    list.appendChild(card);
  });
}

// ------------------------------------------------------------
// TOPICS
// ------------------------------------------------------------

function renderTopicsView() {
  const container = document.createElement("div");

  const back = document.createElement("div");
  back.className = "back-row";

  const btn = document.createElement("button");
  btn.className = "back-btn";
  btn.innerHTML = "⟵ <span>Versi</span>";
  btn.onclick = () => {
    setView("versions");
    setCurrentVersion(null);
    AppState.searchText = "";
    renderApp();
  };

  const crumb = document.createElement("div");
  crumb.className = "breadcrumb";
  crumb.textContent = `${AppState.currentSubject.name} › ${AppState.currentVersion.name}`;

  back.appendChild(btn);
  back.appendChild(crumb);
  container.appendChild(back);

  const header = document.createElement("div");
  header.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Topik Besar";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Setiap topik boleh ada nota dan pokok subtopik sendiri.";

  left.appendChild(title);
  left.appendChild(subtitle);
  header.appendChild(left);

  container.appendChild(header);

  const searchRow = createSearchRow(
    "Cari topik...",
    () => reloadTopics(container),
    async () => {
      const name = prompt("Nama topik:");
      if (name) {
        await createTopic(AppState.currentVersion.id, name);
        reloadTopics(container);
      }
    },
    "Tambah Topik"
  );

  container.appendChild(searchRow);

  const list = document.createElement("div");
  list.className = "list-stack";
  list.id = "topics-list";
  container.appendChild(list);

  reloadTopics(container);

  return container;
}

async function reloadTopics(container) {
  const list = container.querySelector("#topics-list");
  list.innerHTML = "";

  const items = await listTopics(AppState.currentVersion.id, AppState.searchText);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada topik.";
    list.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const header = document.createElement("div");
    header.className = "item-card-header";

    const left = document.createElement("div");
    left.className = "item-card-title";
    left.textContent = item.name;

    const right = document.createElement("div");
    right.className = "item-actions";

    const badge = document.createElement("span");
    badge.className = "badge-level";
    badge.textContent = "Topik";

    const edit = document.createElement("button");
    edit.className = "icon-btn";
    edit.innerHTML = "✎";
    edit.onclick = async (e) => {
      e.stopPropagation();
      const name = prompt("Nama topik:", item.name);
      if (name) {
        await updateTopicName(item.id, name);
        reloadTopics(container);
      }
    };

    const del = document.createElement("button");
    del.className = "icon-btn danger";
    del.innerHTML = "✕";
    del.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam topik ini beserta semua subtopik di bawahnya?")) {
        await deleteTopicCascade(item.id);
        reloadTopics(container);
      }
    };

    const go = document.createElement("button");
    go.className = "icon-btn";
    go.innerHTML = "⤵";
    go.title = "Pergi ke subtopik pertama";
    go.onclick = (e) => {
      e.stopPropagation();
      setCurrentTopic(item);
      resetSubtopicPath();
      setView("subtopics");
      AppState.searchText = "";
      renderApp();
    };

    right.appendChild(badge);
    right.appendChild(go);
    right.appendChild(edit);
    right.appendChild(del);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    // optional: boleh tambah editor nota topik besar di sini kalau perlu

    list.appendChild(card);
  });
}

// ------------------------------------------------------------
// SUBTOPICS (RECURSIVE)
// ------------------------------------------------------------

function getCurrentParentIdForSubtopics() {
  if (AppState.currentSubtopicPath.length === 0) {
    // anak-anak direct kepada topik
    return AppState.currentTopic.id;
  }
  // anak-anak direct kepada subtopic terakhir dalam path
  const last = AppState.currentSubtopicPath[AppState.currentSubtopicPath.length - 1];
  return last.id;
}

function renderSubtopicsView() {
  const container = document.createElement("div");

  // BACK ROW
  const back = document.createElement("div");
  back.className = "back-row";

  const btn = document.createElement("button");
  btn.className = "back-btn";

  if (AppState.currentSubtopicPath.length === 0) {
    btn.innerHTML = "⟵ <span>Topik Besar</span>";
    btn.onclick = () => {
      setView("topics");
      resetSubtopicPath();
      AppState.searchText = "";
      renderApp();
    };
  } else {
    btn.innerHTML = "⟵ <span>Naik satu tahap</span>";
    btn.onclick = () => {
      popSubtopicFromPath();
      AppState.searchText = "";
      renderApp();
    };
  }

  const crumb = document.createElement("div");
  crumb.className = "breadcrumb";
  crumb.textContent = renderBreadcrumbForSubtopics();

  back.appendChild(btn);
  back.appendChild(crumb);
  container.appendChild(back);

  // HEADER
  const header = document.createElement("div");
  header.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Subtopik";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Setiap subtopik boleh ada subtopik anak tanpa had.";

  left.appendChild(title);
  left.appendChild(subtitle);
  header.appendChild(left);

  // BUTTON: TAMBAH KE LOG (pada subtopik semasa, kalau ada)
  const right = document.createElement("div");
  if (AppState.currentSubtopicPath.length > 0) {
    const logBtn = document.createElement("button");
    logBtn.className = "btn-secondary";

    const icon = document.createElement("span");
    icon.className = "btn-secondary-icon";
    icon.textContent = "⏱";

    const label = document.createElement("span");
    label.textContent = "Tambah ke Log";

    logBtn.appendChild(icon);
    logBtn.appendChild(label);

    logBtn.onclick = async () => {
      try {
        const currentSubtopic =
          AppState.currentSubtopicPath[AppState.currentSubtopicPath.length - 1];

        await addLogEntry(
          AppState.currentSubject,
          AppState.currentVersion,
          AppState.currentTopic,
          currentSubtopic
        );

        alert("Log sejarah telah ditambah.");
      } catch (err) {
        console.error(err);
        alert("Gagal menambah log.");
      }
    };

    right.appendChild(logBtn);
  }

  header.appendChild(right);
  container.appendChild(header);

  // SEARCH ROW
  const searchRow = createSearchRow(
    "Cari subtopik...",
    () => reloadSubtopics(container),
    async () => {
      const name = prompt("Nama subtopik:");
      if (name) {
        const parentId = getCurrentParentIdForSubtopics();
        await createSubtopic(parentId, name);
        reloadSubtopics(container);
      }
    },
    "Tambah Subtopik"
  );

  container.appendChild(searchRow);

  // LIST
  const list = document.createElement("div");
  list.className = "list-stack";
  list.id = "subtopics-list";
  container.appendChild(list);

  reloadSubtopics(container);

  return container;
}

async function reloadSubtopics(container) {
  const list = container.querySelector("#subtopics-list");
  list.innerHTML = "";

  const parentId = getCurrentParentIdForSubtopics();
  const items = await listSubtopics(parentId, AppState.searchText);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada subtopik di tahap ini.";
    list.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    // HEADER
    const header = document.createElement("div");
    header.className = "item-card-header";

    const left = document.createElement("div");
    left.className = "item-card-title";
    left.textContent = item.name;

    const right = document.createElement("div");
    right.className = "item-actions";

    const badge = document.createElement("span");
    badge.className = "badge-level";
    badge.textContent = "Subtopik";

    const go = document.createElement("button");
    go.className = "icon-btn";
    go.innerHTML = "⤵";
    go.title = "Pergi ke subtopik anak";
    go.onclick = (e) => {
      e.stopPropagation();
      pushSubtopicToPath(item);
      AppState.searchText = "";
      renderApp();
    };

    const edit = document.createElement("button");
    edit.className = "icon-btn";
    edit.innerHTML = "✎";
    edit.onclick = async (e) => {
      e.stopPropagation();
      const name = prompt("Nama subtopik:", item.name);
      if (name) {
        await updateSubtopicName(item.id, name);
        reloadSubtopics(container);
      }
    };

    const del = document.createElement("button");
    del.className = "icon-btn danger";
    del.innerHTML = "✕";
    del.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam subtopik ini beserta semua subtopik anaknya?")) {
        await deleteSubtopic(item.id);
        reloadSubtopics(container);
      }
    };

    right.appendChild(badge);
    right.appendChild(go);
    right.appendChild(edit);
    right.appendChild(del);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    // EDITOR
    const editorContainer = document.createElement("div");
    editorContainer.className = "editor-container";

    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";
    toolbar.id = `toolbar-subtopic-${item.id}`;

    toolbar.innerHTML = `
      <span class="ql-formats">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-clean"></button>
      </span>
    `;

    const editorArea = document.createElement("div");
    editorArea.className = "editor-area";
    editorArea.id = `editor-subtopic-${item.id}`;

    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editorArea);
    card.appendChild(editorContainer);

    list.appendChild(card);

    // INIT QUILL
    const quill = new Quill(editorArea, {
      theme: "snow",
      placeholder: "Nota subtopik ini...",
      modules: {
        toolbar: `#toolbar-subtopic-${item.id}`
      }
    });

    if (item.noteHtml) {
      quill.root.innerHTML = item.noteHtml;
    }

    quill.on("text-change", debounce(async () => {
      AppState.syncing = true;
      updateFooterSync();
      await updateSubtopicNote(item.id, quill.root.innerHTML);
      AppState.syncing = false;
      AppState.lastSynced = new Date();
      updateFooterSync();
    }, 600));
  });
}

// ------------------------------------------------------------
// LOGS VIEW
// ------------------------------------------------------------

function renderLogsView() {
  const container = document.createElement("div");

  const back = document.createElement("div");
  back.className = "back-row";

  const btn = document.createElement("button");
  btn.className = "back-btn";
  btn.innerHTML = "⟵ <span>Kembali ke Subjek</span>";
  btn.onclick = () => {
    setView("subjects");
    renderApp();
  };

  const crumb = document.createElement("div");
  crumb.className = "breadcrumb";
  crumb.textContent = "Log Sejarah";

  back.appendChild(btn);
  back.appendChild(crumb);
  container.appendChild(back);

  const header = document.createElement("div");
  header.className = "section-header";

  const left = document.createElement("div");

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Log Sejarah";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent =
    "Senarai semua log yang ditambah daripada subtopik.";

  left.appendChild(title);
  left.appendChild(subtitle);
  header.appendChild(left);

  container.appendChild(header);

  const list = document.createElement("div");
  list.className = "log-list";
  list.id = "logs-list";
  container.appendChild(list);

  reloadLogs(container);

  return container;
}

async function reloadLogs(container) {
  const list = container.querySelector("#logs-list");
  list.innerHTML = "";

  const items = await listLogs();

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "Tiada log lagi. Pergi ke mana-mana subtopik dan tekan 'Tambah ke Log'.";
    list.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "log-item";

    const title = document.createElement("div");
    title.className = "log-title";
    title.textContent = item.subtopicName || "(Subtopik tanpa nama)";

    const meta = document.createElement("div");
    meta.className = "log-meta";

    const date = item.createdAt?.toDate ? item.createdAt.toDate() : null;
    let dateText = "Tarikh tidak diketahui";

    if (date) {
      const hari = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"][date.getDay()];
      const bulan = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogos","Sep","Okt","Nov","Dis"][date.getMonth()];
      const d = date.getDate();
      const y = date.getFullYear();

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "petang" : "pagi";
      if (hours === 0) hours = 12;
      else if (hours > 12) hours -= 12;

      dateText = `${hari}, ${d} ${bulan} ${y}, ${hours}:${minutes} ${ampm}`;
    }

    meta.textContent =
      `${item.subjectName} • ${item.versionName} • ${item.topicName} • ${dateText}`;

    row.appendChild(title);
    row.appendChild(meta);
    list.appendChild(row);
  });
}

// ------------------------------------------------------------
// DEBOUNCE
// ------------------------------------------------------------

function debounce(fn, delay) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}
