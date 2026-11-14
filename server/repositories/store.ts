import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import {
  getFirestore,
  type Firestore,
  type Transaction,
  type DocumentReference,
} from "firebase-admin/firestore";
import type { Workspace } from "../../shared/types";
import { DomainError } from "../domain/engine";
export interface Store {
  read(key: string): Promise<Workspace | null>;
  create(key: string, w: Workspace): Promise<void>;
  mutate<T>(key: string, fn: (w: Workspace) => T): Promise<T>;
  reserveAI(key: string, demo: boolean, limit: number): Promise<void>;
}
export class MemoryStore implements Store {
  private records = new Map<string, Workspace>();
  private globalUsage = new Map<string, number>();
  async read(key: string) {
    return structuredClone(this.records.get(key) ?? null);
  }
  async create(key: string, w: Workspace) {
    this.records.set(key, structuredClone(w));
  }
  async mutate<T>(key: string, fn: (w: Workspace) => T) {
    const w = await this.read(key);
    if (!w)
      throw new DomainError(
        401,
        "SESSION_EXPIRED",
        "Session unavailable. Sign in again.",
      ); // Serialize synchronous domain work without an await after the read.
    const current = structuredClone(this.records.get(key)!);
    const result = fn(current);
    current.version++;
    this.records.set(key, current);
    return structuredClone(result);
  }
  async reserveAI(key: string, demo: boolean, limit: number) {
    const w = this.records.get(key);
    if (!w) throw new DomainError(401, "SESSION_EXPIRED", "Session expired.");
    const day = new Date().toISOString().slice(0, 10);
    const used = this.globalUsage.get(day) ?? 0;
    if (used >= limit || w.aiUsed >= (demo ? 3 : 30))
      throw new DomainError(
        429,
        "AI_QUOTA",
        "AI allowance exhausted. Assessments remain available.",
      );
    w.aiUsed++;
    this.globalUsage.set(day, used + 1);
  }
}
const collections = [
  "assessments",
  "evidence",
  "roadmaps",
  "studyLogs",
  "messages",
] as const;
type Root = Omit<Workspace, (typeof collections)[number]>;
export function firebaseApp() {
  return (
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  );
}
export class FirestoreStore implements Store {
  private db: Firestore;
  constructor() {
    this.db = getFirestore(firebaseApp());
  }
  private ref(key: string) {
    const [kind, id] = key.split(":");
    return this.db
      .collection(kind === "demo" ? "demoSessions" : "users")
      .doc(id);
  }
  private async load(ref: DocumentReference, tx?: Transaction) {
    const root = await (tx ? tx.get(ref) : ref.get());
    if (!root.exists) return null;
    const parts = await Promise.all(
      collections.map((c) =>
        tx ? tx.get(ref.collection(c)) : ref.collection(c).get(),
      ),
    );
    const w = { ...root.data() } as Workspace;
    collections.forEach((c, i) => {
      Object.assign(w, {
        [c]: parts[i].docs
          .map((d) => d.data())
          .sort((a, b) =>
            String(a.at ?? a.createdAt).localeCompare(
              String(b.at ?? b.createdAt),
            ),
          ),
      });
    });
    return w;
  }
  async read(key: string) {
    return this.load(this.ref(key));
  }
  private save(
    tx: Transaction,
    ref: DocumentReference,
    w: Workspace,
    previous?: Workspace,
  ) {
    const root = { ...w } as Partial<Workspace>;
    for (const c of collections) {
      delete root[c];
      for (const old of previous?.[c] ?? []) {
        if (!w[c].some((item) => item.id === old.id))
          tx.delete(ref.collection(c).doc(old.id));
      }
      for (const item of w[c]) {
        const old = previous?.[c].find((v) => v.id === item.id);
        if (JSON.stringify(old) !== JSON.stringify(item))
          tx.set(ref.collection(c).doc(item.id), item);
      }
    }
    tx.set(ref, root as Root);
  }
  async create(key: string, w: Workspace) {
    await this.db.runTransaction(async (tx) => {
      const ref = this.ref(key);
      if ((await tx.get(ref)).exists)
        throw new DomainError(409, "EXISTS", "Workspace already exists.");
      this.save(tx, ref, w);
    });
  }
  async mutate<T>(key: string, fn: (w: Workspace) => T) {
    return this.db.runTransaction(async (tx) => {
      const ref = this.ref(key),
        w = await this.load(ref, tx);
      if (!w)
        throw new DomainError(401, "SESSION_EXPIRED", "Session unavailable.");
      const old = structuredClone(w);
      const result = fn(w);
      w.version++;
      this.save(tx, ref, w, old);
      return result;
    });
  }
  async reserveAI(key: string, demo: boolean, limit: number) {
    await this.db.runTransaction(async (tx) => {
      const ref = this.ref(key),
        bucket = this.db
          .collection("usageBuckets")
          .doc(new Date().toISOString().slice(0, 10));
      const [user, global] = await Promise.all([tx.get(ref), tx.get(bucket)]);
      const count = Number(global.data()?.count ?? 0),
        used = Number(user.data()?.aiUsed ?? 0);
      if (!user.exists)
        throw new DomainError(401, "SESSION_EXPIRED", "Session expired.");
      if (count >= limit || used >= (demo ? 3 : 30))
        throw new DomainError(
          429,
          "AI_QUOTA",
          "AI allowance exhausted. Assessments remain available.",
        );
      tx.update(ref, { aiUsed: used + 1 });
      tx.set(bucket, { count: count + 1 });
    });
  }
}
