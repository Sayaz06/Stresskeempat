// state.js

const AppState = {
  user: null,
  view: "login", 
  currentSubject: null,
  currentVersion: null,
  currentTopic: null,
  currentLevel: 0, 
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
