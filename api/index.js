import app from "../server/src/app.js";

// Surface any unhandled startup errors in Vercel logs
process.on("unhandledRejection", (err) => {
  console.error("[startup] Unhandled rejection:", err);
});

export default app;
