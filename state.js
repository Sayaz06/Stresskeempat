// state.js — Recursive Version

const AppState = {
  user: null,

  // View:
  // "login" | "subjects" | "versions" | "topics" | "subtopics" | "logs"
  view: "login",

  currentSubject: null,
  currentVersion: null,
  currentTopic: null,

  // Path untuk subtopik (array of objects)
  // Contoh:
  // [
  //   { id: "sub1", name: "Cara Berjalan" },
  //   { id: "sub2", name: "Teknik Betul" }
  // ]
  currentSubtopicPath: [],

  searchText: "",
  syncing: false,
  lastSynced: null
};

/* ---------------- SETTERS ---------------- */

function setUser(user) {
  AppState.user = user;
}

function setView(view) {
  AppState.view = view;
}

function setCurrentSubject(subject) {
  AppState.currentSubject = subject;
}

function setCurrentVersion(version) {
  AppState.currentVersion = version;
}

function setCurrentTopic(topic) {
  AppState.currentTopic = topic;
}

function resetSubtopicPath() {
  AppState.currentSubtopicPath = [];
}

function pushSubtopicToPath(subtopic) {
  AppState.currentSubtopicPath.push({
    id: subtopic.id,
    name: subtopic.name
  });
}

function popSubtopicFromPath() {
  AppState.currentSubtopicPath.pop();
}
