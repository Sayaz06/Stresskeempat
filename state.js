// state.js

const AppState = {
  user: null, // Firebase user
  // "login" | "subjects" | "versions" | "topics" | "subtopicLevel" | "logs"
  view: "login",
  currentSubject: null,
  currentVersion: null,
  currentTopic: null,
  currentLevel: 0, // 0 = topik besar, 1..9 = subtopik x.1..x.9
  searchText: "",
  editors: {},
  syncing: false,
  lastSynced: null
};

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

function setCurrentLevel(level) {
  AppState.currentLevel = level;
}
