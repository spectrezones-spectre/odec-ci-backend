import { Router } from "express";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from "./articles.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getArticles);
router.post("/", protect, createArticle);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

export default router;
