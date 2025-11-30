// data.js — Recursive Version
// ------------------------------------------------------------
// SUBJECTS, VERSIONS, TOPICS, SUBTOPICS (RECURSIVE), LOGS
// ------------------------------------------------------------

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
  // delete versions of this subject
  const versions = await db.collection("versions")
    .where("subjectId", "==", subjectId)
    .get();

  for (const v of versions.docs) {
    const versionId = v.id;

    // delete topics under this version
    const topics = await db.collection("topics")
      .where("versionId", "==", versionId)
      .get();

    for (const t of topics.docs) {
      const topicId = t.id;

      // delete all subtopics recursively for this topic
      await deleteSubtopicsCascade(topicId);

      // delete topic
      await db.collection("topics").doc(topicId).delete();
    }

    // delete version
    await db.collection("versions").doc(versionId).delete();
  }

  // delete subject
  await db.collection("subjects").doc(subjectId).delete();
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

async function deleteVersionCascade(versionId) {
  // delete topics
  const topics = await db.collection("topics")
    .where("versionId", "==", versionId)
    .get();

  for (const t of topics.docs) {
    const topicId = t.id;
    await deleteSubtopicsCascade(topicId);
    await db.collection("topics").doc(topicId).delete();
  }

  // delete version
  await db.collection("versions").doc(versionId).delete();
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

async function deleteTopicCascade(topicId) {
  await deleteSubtopicsCascade(topicId);
  await db.collection("topics").doc(topicId).delete();
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

/* ---------------- SUBTOPICS (RECURSIVE) ---------------- */

/**
 * Subtopic shape:
 * {
 *   parentId: string, // boleh topic.id atau subtopic.id
 *   name: string,
 *   noteHtml: string,
 *   ownerUid: string,
 *   createdAt,
 *   updatedAt
 * }
 */

async function createSubtopic(parentId, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("subtopics").add({
    parentId,
    name,
    ownerUid: user.uid,
    noteHtml: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, parentId, name };
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

async function deleteSubtopic(id) {
  // delete all children first
  await deleteSubtopicsCascade(id);
  // then delete itself
  await db.collection("subtopics").doc(id).delete();
}

/**
 * Delete all descendants of a parent (topic or subtopic)
 */
async function deleteSubtopicsCascade(parentId) {
  const snap = await db.collection("subtopics")
    .where("parentId", "==", parentId)
    .get();

  for (const doc of snap.docs) {
    const childId = doc.id;
    // recursive delete children
    await deleteSubtopicsCascade(childId);
    // delete this child
    await db.collection("subtopics").doc(childId).delete();
  }
}

/**
 * List direct children of a parent (topic or subtopic)
 */
async function listSubtopics(parentId, search = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("subtopics")
    .where("ownerUid", "==", user.uid)
    .where("parentId", "==", parentId)
    .orderBy("createdAt", "asc");

  const snap = await q.get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

  return items;
}

/* ---------------- LOGS (SEJARAH) ---------------- */

async function addLogEntry(subject, version, topic, subtopic) {
  const user = AppState.user;
  if (!user) return;

  await db.collection("logs").add({
    subjectId: subject.id,
    subjectName: subject.name,
    versionId: version.id,
    versionName: version.name,
    topicId: topic.id,
    topicName: topic.name,
    subtopicId: subtopic.id,
    subtopicName: subtopic.name,
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
