// data.js

function serverTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/* ---------------- SUBJECTS ---------------- */

async function createSubject(name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("subjects").add({
    name,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, name };
}

async function updateSubjectName(id, name) {
  await db.collection("subjects").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function deleteSubjectCascade(subjectId) {
  const versions = await db.collection("versions")
    .where("subjectId", "==", subjectId)
    .get();

  for (const v of versions.docs) {
    const versionId = v.id;

    const topics = await db.collection("topics")
      .where("versionId", "==", versionId)
      .get();

    for (const t of topics.docs) {
      const topicId = t.id;

      await deleteSubtopicsCascade(topicId);

      await db.collection("topics").doc(topicId).delete();
    }

    await db.collection("versions").doc(versionId).delete();
  }

  await db.collection("subjects").doc(subjectId).delete();
}

async function deleteSubtopicsCascade(parentId) {
  for (let level = 1; level <= 9; level++) {
    const snap = await db.collection("subtopics")
      .where("parentId", "==", parentId)
      .where("level", "==", level)
      .get();

    for (const doc of snap.docs) {
      await deleteSubtopicsCascade(doc.id);
      await db.collection("subtopics").doc(doc.id).delete();
    }
  }
}

async function listSubjects(search = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("subjects")
    .where("ownerUid", "==", user.uid)
    .orderBy("createdAt", "asc");

  const snap = await q.get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

  return items;
}

/* ---------------- VERSIONS ---------------- */

async function createVersion(subjectId, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("versions").add({
    subjectId,
    name,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, subjectId, name };
}

async function updateVersionName(id, name) {
  await db.collection("versions").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function listVersions(subjectId, search = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("versions")
    .where("ownerUid", "==", user.uid)
    .where("subjectId", "==", subjectId)
    .orderBy("createdAt", "asc");

  const snap = await q.get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

  return items;
}

/* ---------------- TOPICS ---------------- */

async function createTopic(versionId, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("topics").add({
    versionId,
    name,
    ownerUid: user.uid,
    noteHtml: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, versionId, name };
}

async function updateTopicName(id, name) {
  await db.collection("topics").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function updateTopicNote(id, html) {
  await db.collection("topics").doc(id).update({
    noteHtml: html,
    updatedAt: serverTimestamp()
  });
}

async function listTopics(versionId, search = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("topics")
    .where("ownerUid", "==", user.uid)
    .where("versionId", "==", versionId)
    .orderBy("createdAt", "asc");

  const snap = await q.get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

  return items;
}

/* ---------------- SUBTOPICS ---------------- */

async function createSubtopic(parentId, level, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("subtopics").add({
    parentId,
    level,
    name,
    ownerUid: user.uid,
    noteHtml: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, parentId, level, name };
}

async function updateSubtopicName(id, name) {
  await db.collection("subtopics").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function updateSubtopicNote(id, html) {
  await db.collection("subtopics").doc(id).update({
    noteHtml: html,
    updatedAt: serverTimestamp()
  });
}

async function listSubtopics(parentId, level, search = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("subtopics")
    .where("ownerUid", "==", user.uid)
    .where("parentId", "==", parentId)
    .where("level", "==", level)
    .orderBy("createdAt", "asc");

  const snap = await q.get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

  return items;
}

/* ---------------- LOGS (WITH SUBTOPIC X.1) ---------------- */

async function addLogEntry(subject, version, topic, subtopicX1) {
  const user = AppState.user;
  if (!user) return;

  await db.collection("logs").add({
    subjectId: subject.id,
    subjectName: subject.name,
    versionId: version.id,
    versionName: version.name,
    topicId: topic.id,
    topicName: topic.name,
    subtopicId: subtopicX1.id,
    subtopicName: subtopicX1.name,
    ownerUid: user.uid,
    createdAt: serverTimestamp()
  });
}

async function listLogs() {
  const user = AppState.user;
  if (!user) return [];

  const snap = await db.collection("logs")
    .where("ownerUid", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
