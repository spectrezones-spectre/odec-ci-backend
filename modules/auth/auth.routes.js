import { Router } from "express";
import { login } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/routeLimiters.js";

const r = Router();
r.post("/login", authLimiter, login);
export default r;
