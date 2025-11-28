// ui.js

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
    const initial = (AppState.user.displayName || AppState.user.email || "?")[0].toUpperCase();
    avatar.textContent = initial;

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
    right.textContent = "Sila log masuk dengan Google";
  }

  header.appendChild(brand);
  header.appendChild(right);

  return header;
}

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
  } else if (AppState.view === "subtopicLevel") {
    container.appendChild(renderSubtopicLevelView());
  } else if (AppState.view === "logs") {
    container.appendChild(renderLogsView());
  }

  return container;
}

function renderFooter() {
  const footer = document.createElement("div");
  footer.className = "app-footer";

  const left = document.createElement("div");
  left.textContent = "Data disimpan dalam Firebase Firestore";

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

/* -------- Login View -------- */

function renderLoginView() {
  const card = document.createElement("div");
  card.className = "login-card";

  const title = document.createElement("div");
  title.className = "login-title";
  title.textContent = "Log masuk untuk mula simpan nota";

  const subtitle = document.createElement("div");
  subtitle.className = "login-subtitle";
  subtitle.textContent = "Aplikasi ini menggunakan akaun Google anda untuk menyimpan nota di awan.";

  const btn = document.createElement("button");
  btn.className = "btn-primary";
  btn.onclick = () => signInWithGoogle();

  const iconCircle = document.createElement("span");
  iconCircle.className = "btn-icon-circle";
  iconCircle.textContent = "G";

  const text = document.createElement("span");
  text.textContent = "Log masuk dengan Google";

  btn.appendChild(iconCircle);
  btn.appendChild(text);

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(btn);

  return card;
}

/* -------- Helper: Search row -------- */

function createSearchRow(placeholder, onSearchChange, onAddClick, addLabel) {
  const wrapper = document.createElement("div");
  wrapper.className = "search-row";

  const input = document.createElement("input");
  input.className = "input-search";
  input.type = "search";
  input.placeholder = placeholder;
  input.value = AppState.searchText || "";
  input.oninput = (e) => {
    AppState.searchText = e.target.value;
    onSearchChange && onSearchChange(AppState.searchText);
  };

  const btnAdd = document.createElement("button");
  btnAdd.className = "btn-secondary";
  btnAdd.type = "button";
  btnAdd.onclick = () => onAddClick && onAddClick();

  const icon = document.createElement("span");
  icon.className = "btn-secondary-icon";
  icon.textContent = "+";

  const label = document.createElement("span");
  label.textContent = addLabel;

  btnAdd.appendChild(icon);
  btnAdd.appendChild(label);

  wrapper.appendChild(input);
  wrapper.appendChild(btnAdd);

  return wrapper;
}

/* -------- Subjects View -------- */

function renderSubjectsView() {
  const container = document.createElement("div");

  const sectionHeader = document.createElement("div");
  sectionHeader.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Nota Subjek";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Tambah subjek, kemudian versi, topik besar dan subtopik.";

  left.appendChild(title);
  left.appendChild(subtitle);

  const right = document.createElement("div");

  const logBtn = document.createElement("button");
  logBtn.className = "btn-secondary";
  logBtn.type = "button";
  logBtn.onclick = () => {
    setView("logs");
    renderApp();
  };

  const logIcon = document.createElement("span");
  logIcon.className = "btn-secondary-icon";
  logIcon.textContent = "⏱";

  const logLabel = document.createElement("span");
  logLabel.textContent = "Log Sejarah";

  logBtn.appendChild(logIcon);
  logBtn.appendChild(logLabel);
  right.appendChild(logBtn);

  sectionHeader.appendChild(left);
  sectionHeader.appendChild(right);

  container.appendChild(sectionHeader);

  const searchRow = createSearchRow(
    "Cari subjek...",
    () => reloadSubjects(container),
    async () => {
      const name = prompt("Nama subjek baru:", "Subjek Perniagaan");
      if (name) {
        await createSubject(name);
        reloadSubjects(container);
      }
    },
    "Tambah Subjek"
  );
  container.appendChild(searchRow);

  const listWrapper = document.createElement("div");
  listWrapper.className = "list-stack";
  listWrapper.id = "subjects-list";
  container.appendChild(listWrapper);

  reloadSubjects(container);

  return container;
}

async function reloadSubjects(container) {
  const listWrapper = container.querySelector("#subjects-list");
  listWrapper.innerHTML = "";

  const items = await listSubjects(AppState.searchText || "");

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada subjek lagi. Tekan 'Tambah Subjek' untuk mula.";
    listWrapper.appendChild(empty);
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

    const btnEdit = document.createElement("button");
    btnEdit.className = "icon-btn";
    btnEdit.type = "button";
    btnEdit.title = "Sunting nama";
    btnEdit.innerHTML = "✎";
    btnEdit.onclick = async (e) => {
      e.stopPropagation();
      const newName = prompt("Nama subjek:", item.name);
      if (newName && newName.trim()) {
        await updateSubjectName(item.id, newName.trim());
        reloadSubjects(container);
      }
    };

    const btnDelete = document.createElement("button");
    btnDelete.className = "icon-btn danger";
    btnDelete.type = "button";
    btnDelete.title = "Padam subjek";
    btnDelete.innerHTML = "✕";
    btnDelete.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam subjek ini BESERTA semua versi, topik dan subtopik di bawahnya? Tindakan ini tidak boleh diundur.")) {
        await deleteSubjectCascade(item.id);
        reloadSubjects(container);
      }
    };

    right.appendChild(badge);
    right.appendChild(btnEdit);
    right.appendChild(btnDelete);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    card.onclick = () => {
      setCurrentSubject(item);
      setView("versions");
      AppState.searchText = "";
      renderApp();
    };

    listWrapper.appendChild(card);
  });
}

/* -------- Versions View -------- */

function renderVersionsView() {
  const container = document.createElement("div");

  const backRow = document.createElement("div");
  backRow.className = "back-row";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.type = "button";
  backBtn.innerHTML = "⟵ <span>Subjek</span>";
  backBtn.onclick = () => {
    setView("subjects");
    setCurrentSubject(null);
    AppState.searchText = "";
    renderApp();
  };

  const breadcrumb = document.createElement("div");
  breadcrumb.className = "breadcrumb";
  breadcrumb.textContent = AppState.currentSubject ? AppState.currentSubject.name : "";

  backRow.appendChild(backBtn);
  backRow.appendChild(breadcrumb);
  container.appendChild(backRow);

  const sectionHeader = document.createElement("div");
  sectionHeader.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Versi Nota";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Contoh: Perniagaan Semester 1, Ulangan, dll.";

  left.appendChild(title);
  left.appendChild(subtitle);
  sectionHeader.appendChild(left);

  container.appendChild(sectionHeader);

  const searchRow = createSearchRow(
    "Cari versi...",
    () => reloadVersions(container),
    async () => {
      const name = prompt("Nama versi:", "Perniagaan Semester 1");
      if (name) {
        await createVersion(AppState.currentSubject.id, name.trim());
        reloadVersions(container);
      }
    },
    "Tambah Versi"
  );
  container.appendChild(searchRow);

  const listWrapper = document.createElement("div");
  listWrapper.className = "list-stack";
  listWrapper.id = "versions-list";
  container.appendChild(listWrapper);

  reloadVersions(container);

  return container;
}

async function reloadVersions(container) {
  const listWrapper = container.querySelector("#versions-list");
  listWrapper.innerHTML = "";

  const items = await listVersions(AppState.currentSubject.id, AppState.searchText || "");

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada versi untuk subjek ini.";
    listWrapper.appendChild(empty);
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

    const btnEdit = document.createElement("button");
    btnEdit.className = "icon-btn";
    btnEdit.type = "button";
    btnEdit.title = "Sunting nama";
    btnEdit.innerHTML = "✎";
    btnEdit.onclick = async (e) => {
      e.stopPropagation();
      const newName = prompt("Nama versi:", item.name);
      if (newName && newName.trim()) {
        await updateVersionName(item.id, newName.trim());
        reloadVersions(container);
      }
    };

    const btnDelete = document.createElement("button");
    btnDelete.className = "icon-btn danger";
    btnDelete.type = "button";
    btnDelete.title = "Padam versi";
    btnDelete.innerHTML = "✕";
    btnDelete.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam versi ini sahaja? (Topik dan subtopik bawah versi ini tidak dipadam automatik dalam versi ini)")) {
        await deleteVersion(item.id);
        reloadVersions(container);
      }
    };

    right.appendChild(badge);
    right.appendChild(btnEdit);
    right.appendChild(btnDelete);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    card.onclick = () => {
      setCurrentVersion(item);
      setView("topics");
      AppState.searchText = "";
      renderApp();
    };

    listWrapper.appendChild(card);
  });
}

/* -------- Topics View -------- */

function renderTopicsView() {
  const container = document.createElement("div");

  const backRow = document.createElement("div");
  backRow.className = "back-row";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.type = "button";
  backBtn.innerHTML = "⟵ <span>Versi</span>";
  backBtn.onclick = () => {
    setView("versions");
    setCurrentVersion(null);
    AppState.searchText = "";
    renderApp();
  };

  const breadcrumb = document.createElement("div");
  breadcrumb.className = "breadcrumb";
  breadcrumb.textContent = `${AppState.currentSubject?.name || ""} › ${AppState.currentVersion?.name || ""}`;

  backRow.appendChild(backBtn);
  backRow.appendChild(breadcrumb);
  container.appendChild(backRow);

  const sectionHeader = document.createElement("div");
  sectionHeader.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Topik besar";

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Setiap topik ada ruang nota dan boleh bercabang ke subtopik x.1 hingga x.9.";

  left.appendChild(title);
  left.appendChild(subtitle);
  sectionHeader.appendChild(left);

  container.appendChild(sectionHeader);

  const searchRow = createSearchRow(
    "Cari topik besar...",
    () => reloadTopics(container),
    async () => {
      const name = prompt("Nama topik besar:", "Topik 1");
      if (name) {
        await createTopic(AppState.currentVersion.id, name.trim());
        reloadTopics(container);
      }
    },
    "Tambah Topik"
  );
  container.appendChild(searchRow);

  const listWrapper = document.createElement("div");
  listWrapper.className = "list-stack";
  listWrapper.id = "topics-list";
  container.appendChild(listWrapper);

  reloadTopics(container);

  return container;
}

async function reloadTopics(container) {
  const listWrapper = container.querySelector("#topics-list");
  listWrapper.innerHTML = "";

  const items = await listTopics(AppState.currentVersion.id, AppState.searchText || "");

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada topik besar. Tekan 'Tambah Topik' untuk mula.";
    listWrapper.appendChild(empty);
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

    const btnEdit = document.createElement("button");
    btnEdit.className = "icon-btn";
    btnEdit.type = "button";
    btnEdit.title = "Sunting nama";
    btnEdit.innerHTML = "✎";
    btnEdit.onclick = async (e) => {
      e.stopPropagation();
      const newName = prompt("Nama topik:", item.name);
      if (newName && newName.trim()) {
        await updateTopicName(item.id, newName.trim());
        reloadTopics(container);
      }
    };

    const btnDelete = document.createElement("button");
    btnDelete.className = "icon-btn danger";
    btnDelete.type = "button";
    btnDelete.title = "Padam topik";
    btnDelete.innerHTML = "✕";
    btnDelete.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Padam topik ini? Subtopik di bawahnya tidak dipadam automatik dalam versi ini.")) {
        await deleteTopic(item.id);
        reloadTopics(container);
      }
    };

    const btnGoSub = document.createElement("button");
    btnGoSub.className = "icon-btn";
    btnGoSub.type = "button";
    btnGoSub.title = "Pergi ke subtopik x.1";
    btnGoSub.innerHTML = "⤵";
    btnGoSub.onclick = (e) => {
      e.stopPropagation();
      setCurrentTopic(item);
      setCurrentLevel(1);
      setView("subtopicLevel");
      AppState.searchText = "";
      renderApp();
    };

    right.appendChild(badge);
    right.appendChild(btnGoSub);
    right.appendChild(btnEdit);
    right.appendChild(btnDelete);

    header.appendChild(left);
    header.appendChild(right);

    card.appendChild(header);

    const editorContainer = document.createElement("div");
    editorContainer.className = "editor-container";

    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";
    toolbar.id = `toolbar-topic-${item.id}`;

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
    editorArea.id = `editor-topic-${item.id}`;

    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editorArea);
    card.appendChild(editorContainer);

    listWrapper.appendChild(card);

    const quill = new Quill(editorArea, {
      theme: "snow",
      placeholder: "Nota topik ini...",
      modules: {
        toolbar: `#toolbar-topic-${item.id}`
      }
    });

    if (item.noteHtml) {
      quill.root.innerHTML = item.noteHtml;
    }

    quill.on("text-change", debounce(async () => {
      AppState.syncing = true;
      updateFooterSync();
      await updateTopicNote(item.id, quill.root.innerHTML);
      AppState.syncing = false;
      AppState.lastSynced = new Date();
      updateFooterSync();
    }, 600));
  });
}

/* -------- Subtopic Level View (x.1 ... x.9) -------- */

function renderSubtopicLevelView() {
  const container = document.createElement("div");

  const backRow = document.createElement("div");
  backRow.className = "back-row";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.type = "button";

  if (AppState.currentLevel === 1) {
    backBtn.innerHTML = "⟵ <span>Topik besar</span>";
    backBtn.onclick = () => {
      setView("topics");
      setCurrentLevel(0);
      AppState.searchText = "";
      renderApp();
    };
  } else {
    backBtn.innerHTML = "⟵ <span>Subtopik tahap sebelumnya</span>";
    backBtn.onclick = () => {
      setCurrentLevel(AppState.currentLevel - 1);
      setView("subtopicLevel");
      AppState.searchText = "";
      renderApp();
    };
  }

  const breadcrumb = document.createElement("div");
  breadcrumb.className = "breadcrumb";
  const levelLabel = AppState.currentLevel === 0
    ? "Topik"
    : `Subtopik x.${AppState.currentLevel}`;
  breadcrumb.textContent =
    `${AppState.currentSubject?.name || ""} › ${AppState.currentVersion?.name || ""} › ${AppState.currentTopic?.name || ""} › ${levelLabel}`;

  backRow.appendChild(backBtn);
  backRow.appendChild(breadcrumb);
  container.appendChild(backRow);

  const sectionHeader = document.createElement("div");
  sectionHeader.className = "section-header";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = `Subtopik x.${AppState.currentLevel}`;

  const subtitle = document.createElement("div");
  subtitle.className = "section-subtitle";
  subtitle.textContent =
    AppState.currentLevel === 9
      ? "Tahap subtopik terakhir. Di sini hanya nota dan subtopik dalam tahap ini sahaja."
      : "Setiap subtopik ada nota dan boleh bercabang lagi ke tahap seterusnya.";

  left.appendChild(title);
  left.appendChild(subtitle);
  sectionHeader.appendChild(left);

  container.appendChild(sectionHeader);

  // BUTANG "TAMBAH KE LOG" KHAS UNTUK SUBTOPIK x.1
  if (AppState.currentLevel === 1) {
    const logBtn = document.createElement("button");
    logBtn.className = "btn-secondary";
    logBtn.type = "button";

    const icon = document.createElement("span");
    icon.className = "btn-secondary-icon";
    icon.textContent = "⏱";

    const label = document.createElement("span");
    label.textContent = "Tambah ke Log";

    logBtn.appendChild(icon);
    logBtn.appendChild(label);

    logBtn.onclick = async () => {
      try {
        await addLogEntry(AppState.currentSubject, AppState.currentVersion, AppState.currentTopic);
        alert("Log sejarah telah ditambah.");
      } catch (err) {
        console.error("Gagal tambah log:", err);
        alert("Gagal tambah log. Sila cuba lagi.");
      }
    };

    container.appendChild(logBtn);
  }

  const searchRow = createSearchRow(
    "Cari subtopik...",
    () => reloadSubtopics(container),
    async () => {
      const name = prompt("Nama subtopik:", "Subtopik");
      if (name) {
        const parentId =
          AppState.currentLevel === 1
            ? AppState.currentTopic.id
            : AppState.currentTopic.id; // versi simple: semua level share parent topic
        await createSubtopic(parentId, AppState.currentLevel, name.trim());
        reloadSubtopics(container);
      }
    },
    "Tambah Subtopik"
  );
  container.appendChild(searchRow);

  const listWrapper = document.createElement("div");
  listWrapper.className = "list-stack";
  listWrapper.id = "subtopics-list";
  container.appendChild(listWrapper);

  reloadSubtopics(container);

  return container;
}

async function reloadSubtopics(container) {
  const listWrapper = container.querySelector("#subtopics-list");
  listWrapper.innerHTML = "";

  const parentId =
    AppState.currentLevel === 1
      ? AppState.currentTopic.id
      : AppState.currentTopic.id;

  const items = await listSubtopics(parentId, AppState.currentLevel, AppState.searchText || "");

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Tiada subtopik di tahap ini.";
    listWrapper.appendChild(empty);
    return;
  }

  items
