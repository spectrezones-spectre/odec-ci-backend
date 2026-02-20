const { Router } = require("express");
const {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} = require("./articles.controller.js");

const { protect } = require("../../middlewares/authMiddleware.js");

const router = Router();

router.get("/", getArticles);
router.post("/", protect, createArticle);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

module.exports = router;
