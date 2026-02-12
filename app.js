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
import { notFoundHandler } from "./middlewares/notFoundMiddleware.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { verifyDbConnection } from "./config/db.js";

const app = express();
app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production";
app.use(morgan(isProd ? "combined" : "dev"));

const normalizeOrigin = (origin) =>
  String(origin || "").trim().replace(/\/+$/, "");

const envCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(normalizeOrigin).filter(Boolean)
  : [];

const fallbackCorsOrigins = [
  "https://odec-ci.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
].map(normalizeOrigin);

const allowedOrigins = new Set([...fallbackCorsOrigins, ...envCorsOrigins]);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / curl
    const normalized = normalizeOrigin(origin);
    if (allowedOrigins.has(normalized)) return callback(null, true);
    return callback(new Error(`CORS: origine non autorisee (${normalized})`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/api/*", cors(corsOptions)); // preflight pour toutes les routes API

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
  })
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
  res.send("ODEC-CI API ONLINE");
});

app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
  try {
    console.log("CORS origins autorisees:", Array.from(allowedOrigins));
    await verifyDbConnection();
    console.log("Base de donnees connectee ✅");
  } catch (error) {
    console.error("Erreur connexion DB :", error?.message || error);
  }
})();

export default app;
