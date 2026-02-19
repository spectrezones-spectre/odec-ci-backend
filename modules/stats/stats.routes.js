import { Router } from "express";
import { getStats } from "./stats.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const r = Router();
r.get("/", protect, getStats);
export default r;
