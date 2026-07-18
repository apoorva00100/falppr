import crypto from "crypto";
import { createQdrantClient } from "../vector/qdrantClient.js";

const COLLECTION = "users";
let ready = false;

async function ensureUsersCollection(client) {
  if (ready) return;
  const collections = await client.getCollections();
  const exists = collections.collections.some((item) => item.name === COLLECTION);
  if (!exists) {
    await client.createCollection(COLLECTION, {
      vectors: { size: 1, distance: "Dot" }
    });
  }
  try {
    await client.createPayloadIndex(COLLECTION, { field_name: "email", field_schema: "keyword" });
  } catch (error) {
    if (!String(error.message).includes("already exists")) throw error;
  }
  ready = true;
}

export async function findUserByEmail(email) {
  const client = createQdrantClient();
  await ensureUsersCollection(client);
  const result = await client.scroll(COLLECTION, {
    limit: 1,
    filter: { must: [{ key: "email", match: { value: email.toLowerCase() } }] },
    with_payload: true,
    with_vector: false
  });
  const point = result.points[0];
  return point ? point.payload : null;
}

export async function createUser({ email, passwordHash, name }) {
  const client = createQdrantClient();
  await ensureUsersCollection(client);
  const id = crypto.randomUUID();
  const payload = {
    id,
    email: email.toLowerCase(),
    passwordHash,
    name: name || null,
    createdAt: new Date().toISOString()
  };
  await client.upsert(COLLECTION, {
    points: [{ id, vector: [0], payload }]
  });
  return payload;
}
