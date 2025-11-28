// data.js

function serverTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/* ------- Subjects ------- */

async function createSubject(name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("subjects").add({
    name: name || "Subjek baru",
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, name, ownerUid: user.uid };
}

async function updateSubjectName(id, name) {
  await db.collection("subjects").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

// SUBJECT CASCADE DELETE
async function deleteSubjectCascade(subjectId) {
  // 1. Semua versions di bawah subject
  const versionsSnap = await db.collection("versions")
    .where("subjectId", "==", subjectId)
    .get();

  for (const versionDoc of versionsSnap.docs) {
    const versionId = versionDoc.id;

    // 2. Semua topics di bawah version
    const topicsSnap = await db.collection("topics")
      .where("versionId", "==", versionId)
      .get();

    for (const topicDoc of topicsSnap.docs) {
      const topicId = topicDoc.id;

      // 3. Padam semua subtopics di bawah topic ini (level 1..9)
      await deleteSubtopicsCascade(topicId);

      // 4. Padam topic
      await db.collection("topics").doc(topicId).delete();
    }

    // 5. Padam version
    await db.collection("versions").doc(versionId).delete();
  }

  // 6. Akhir sekali padam subject
  await db.collection("subjects").doc(subjectId).delete();
}

// Padam semua subtopics yang parentId = parentId (recursive)
async function deleteSubtopicsCascade(parentId) {
  // Loop level 1 hingga 9
  for (let level = 1; level <= 9; level++) {
    const snap = await db.collection("subtopics")
      .where("parentId", "==", parentId)
      .where("level", "==", level)
      .get();

    for (const doc of snap.docs) {
      const subId = doc.id;

      // Padam anak subtopic yang mungkin ada parent = subId
      await deleteSubtopicsCascade(subId);

      // Padam subtopic ini
      await db.collection("subtopics").doc(subId).delete();
    }
  }
}

async function listSubjects(searchText = "") {
  const user = AppState.user;
  if (!user) return [];

  let q = db.collection("subjects")
    .where("ownerUid", "==", user.uid)
    .orderBy("createdAt", "asc");

  const snapshot = await q.get();
  let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (searchText) {
    const s = searchText.toLowerCase();
    items = items.filter(x => (x.name || "").toLowerCase().includes(s));
  }

  return items;
}

/* ------- Versions ------- */

async function createVersion(subjectId, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("versions").add({
    subjectId,
    name: name || "Versi baru",
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, subjectId, name, ownerUid: user.uid };
}

async function updateVersionName(id, name) {
  await db.collection("versions").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function deleteVersion(id) {
  // Versi ini tidak cascade, kita boleh buat kemudian kalau perlu.
  await db.collection("versions").doc(id).delete();
}

async function listVersions(subjectId, searchText = "") {
  const user = AppState.user;
  if (!user || !subjectId) return [];

  let q = db.collection("versions")
    .where("ownerUid", "==", user.uid)
    .where("subjectId", "==", subjectId)
    .orderBy("createdAt", "asc");

  const snapshot = await q.get();
  let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (searchText) {
    const s = searchText.toLowerCase();
    items = items.filter(x => (x.name || "").toLowerCase().includes(s));
  }

  return items;
}

/* ------- Topics (Topik Besar) ------- */

async function createTopic(versionId, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("topics").add({
    versionId,
    name: name || "Topik baru",
    ownerUid: user.uid,
    noteHtml: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, versionId, name, ownerUid: user.uid };
}

async function updateTopicName(id, name) {
  await db.collection("topics").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function updateTopicNote(id, noteHtml) {
  await db.collection("topics").doc(id).update({
    noteHtml,
    updatedAt: serverTimestamp()
  });
}

async function deleteTopic(id) {
  // Tidak cascade di sini (hanya manual). Subject cascade sudah cover.
  await db.collection("topics").doc(id).delete();
}

async function listTopics(versionId, searchText = "") {
  const user = AppState.user;
  if (!user || !versionId) return [];

  let q = db.collection("topics")
    .where("ownerUid", "==", user.uid)
    .where("versionId", "==", versionId)
    .orderBy("createdAt", "asc");

  const snapshot = await q.get();
  let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (searchText) {
    const s = searchText.toLowerCase();
    items = items.filter(x => (x.name || "").toLowerCase().includes(s));
  }

  return items;
}

/* ------- Subtopics (x.1 ... x.9) ------- */

async function createSubtopic(parentId, level, name) {
  const user = AppState.user;
  if (!user) return;

  const docRef = await db.collection("subtopics").add({
    parentId,
    level, // 1..9
    name: name || "Subtopik baru",
    ownerUid: user.uid,
    noteHtml: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: docRef.id, parentId, level, name, ownerUid: user.uid };
}

async function updateSubtopicName(id, name) {
  await db.collection("subtopics").doc(id).update({
    name,
    updatedAt: serverTimestamp()
  });
}

async function updateSubtopicNote(id, noteHtml) {
  await db.collection("subtopics").doc(id).update({
    noteHtml,
    updatedAt: serverTimestamp()
  });
}

async function deleteSubtopic(id) {
  await db.collection("subtopics").doc(id).delete();
}

async function listSubtopics(parentId, level, searchText = "") {
  const user = AppState.user;
  if (!user || !parentId) return [];

  let q = db.collection("subtopics")
    .where("ownerUid", "==", user.uid)
    .where("parentId", "==", parentId)
    .where("level", "==", level)
    .orderBy("createdAt", "asc");

  const snapshot = await q.get();
  let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (searchText) {
    const s = searchText.toLowerCase();
    items = items.filter(x => (x.name || "").toLowerCase().includes(s));
  }

  return items;
}
