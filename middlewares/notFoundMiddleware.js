import { createHttpError } from "../utils/httpError.js";

export const notFoundHandler = (req, _res, next) => {
  next(
    createHttpError(
      404,
      `Route introuvable: ${req.method} ${req.originalUrl}`,
      "ROUTE_NOT_FOUND",
    ),
  );
};

