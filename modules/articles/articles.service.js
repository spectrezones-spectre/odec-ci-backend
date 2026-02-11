import { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError.js";

const prisma = new PrismaClient();

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
  const payload = {
    title: String(data.title || "").trim(),
    summary: String(data.summary || "").trim(),
    content: String(data.content || "").trim(),
    category: String(data.category || "").trim(),
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
  prisma.article.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

export const create = (data) =>
  prisma.article.create({
    data: normalizePayload(data),
  });

export const update = (id, data) =>
  prisma.article
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
  prisma.article
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
