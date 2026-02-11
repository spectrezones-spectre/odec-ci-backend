import "./config/environment.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import globalLimiter from "./middlewares/global.middleware.js";
import articleRoutes from "./modules/articles/articles.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { verifyDbConnection } from "./config/db.js";

const app = express();
app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production";
app.use(morgan(isProd ? "combined" : "dev"));

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS: origine non autorisee"));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
  }),
);

app.use(globalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (_req, res) => {
  res.send("ODEC-CI API ONLINE📶");
});

app.use(errorHandler);

(async () => {
  try {
    await verifyDbConnection();
    console.log("Base de donnees connectee✅");
  } catch (error) {
    console.error("❌Erreur connexion DB :", error?.message || error);
  }
})();

export default app;
