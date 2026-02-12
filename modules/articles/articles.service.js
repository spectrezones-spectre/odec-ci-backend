import sanitizeHtml from "sanitize-html";
import { createHttpError } from "../../utils/httpError.js";
import { db } from "../../config/db.js";

const toNumberId = (id) => {
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw createHttpError(
      400,
      "ID article invalide. La valeur doit etre un entier positif",
      "ARTICLE_INVALID_ID",
      { received: id },
    );
  }
  return articleId;
};

const normalizePayload = (data = {}) => {
  const safeTitle = sanitizeHtml(String(data.title || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  const safeSummary = sanitizeHtml(String(data.summary || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  const safeCategory = sanitizeHtml(String(data.category || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  const payload = {
    title: safeTitle,
    summary: safeSummary,
    content: sanitizeHtml(String(data.content || ""), {
      allowedTags: [
        "p",
        "br",
        "b",
        "strong",
        "i",
        "em",
        "u",
        "ul",
        "ol",
        "li",
        "h2",
        "h3",
        "blockquote",
        "a",
      ],
      allowedAttributes: {
        a: ["href", "target", "rel"],
      },
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: {
        a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      },
    }).trim(),
    category: safeCategory,
    date: String(data.date || "").trim(),
    imageUrl: data.imageUrl ? String(data.imageUrl) : null,
    videoUrl: data.videoUrl ? String(data.videoUrl) : null,
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : null,
  };

  const missingFields = ["title", "summary", "content", "category", "date"].filter(
    (field) => !payload[field],
  );

  if (missingFields.length > 0) {
    throw createHttpError(
      400,
      "Tous les champs title, summary, content, category et date sont obligatoires",
      "ARTICLE_REQUIRED_FIELDS_MISSING",
      { missingFields },
    );
  }

  return payload;
};

export const getAll = () =>
  db.article.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

export const create = (data) =>
  db.article.create({
    data: normalizePayload(data),
  });

export const update = (id, data) =>
  db.article
    .update({
      where: { id: toNumberId(id) },
      data: normalizePayload(data),
    })
    .catch((error) => {
      if (error?.code === "P2025") {
        throw createHttpError(
          404,
          "Article introuvable. Impossible de le modifier",
          "ARTICLE_NOT_FOUND",
          { id },
        );
      }
      throw error;
    });

export const remove = (id) =>
  db.article
    .delete({
      where: { id: toNumberId(id) },
    })
    .catch((error) => {
      if (error?.code === "P2025") {
        throw createHttpError(
          404,
          "Article introuvable. Impossible de le supprimer",
          "ARTICLE_NOT_FOUND",
          { id },
        );
      }
      throw error;
    });
