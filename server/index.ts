import "dotenv/config";
import { createApp } from "./app";
import { FirestoreStore, MemoryStore } from "./repositories/store";
const storage = process.env.STORAGE ?? "memory";
if (
  process.env.NODE_ENV === "production" &&
  (storage !== "firestore" || !process.env.APP_ORIGIN)
)
  throw new Error("Production requires STORAGE=firestore and APP_ORIGIN.");
const server = createApp(
  storage === "firestore" ? new FirestoreStore() : new MemoryStore(),
  { storage },
).listen(Number(process.env.PORT ?? 3000), "0.0.0.0", () =>
  console.log(
    JSON.stringify({
      event: "listening",
      port: Number(process.env.PORT ?? 3000),
      storage,
    }),
  ),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
