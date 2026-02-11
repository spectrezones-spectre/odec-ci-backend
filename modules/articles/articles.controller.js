import * as s from "./articles.service.js";

export const getArticles = async (_req, res, next) => {
  try {
    res.json(await s.getAll());
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const created = await s.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const updated = await s.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    await s.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
