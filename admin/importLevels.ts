// scripts/importLevels.ts
import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { ServiceAccount } from "firebase-admin";

// Recreate __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to your JSON files
const serviceAccountPath = path.join(__dirname, "./service-account.json");
const levelsJsonPath   = path.join(__dirname, "./levels.json");

async function importLevels() {
  // 1) Load and parse your service account key:
  const saRaw = await readFile(serviceAccountPath, "utf-8");
  const serviceAccount = JSON.parse(saRaw) as ServiceAccount;

  // 2) Initialize Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = admin.firestore();

  // 3) Load level definitions
  const lvRaw = await readFile(levelsJsonPath, "utf-8");
  const levels = JSON.parse(lvRaw) as Array<Record<string, any>>;

  // 4) Batch‐write up to 500 per batch
  const batches: Array<FirebaseFirestore.WriteBatch> = [];
  let batch = db.batch();
  let opCount = 0;

  for (const lvl of levels) {
    const docRef = db.collection("levels").doc(String(lvl.id));
    batch.set(docRef, lvl);
    opCount++;
    if (opCount === 500) {
      batches.push(batch);
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) batches.push(batch);

  console.log(`Importing ${levels.length} levels in ${batches.length} batch(es)…`);
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`  • Committed batch ${i + 1}`);
  }
  console.log("✅ All levels imported!");
}

importLevels().catch((err) => {
  console.error("❌ Error importing levels:", err);
  process.exit(1);
});
