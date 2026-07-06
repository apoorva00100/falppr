import "../server/src/polyfills.js"; // must be first — sets DOM globals before pdfjs-dist loads
import app from "../server/src/app.js";

process.on("unhandledRejection", (err) => {
  console.error("[startup] Unhandled rejection:", err);
});

export default app;
