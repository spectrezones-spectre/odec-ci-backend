import jwt from "jsonwebtoken";
import { createHttpError } from "../utils/httpError.js";

export const protect = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      createHttpError(
        401,
        "Token manquant. Utilisez le format Authorization: Bearer <token>",
        "TOKEN_MISSING",
      ),
    );
  }

  if (!process.env.JWT_SECRET) {
    return next(
      createHttpError(
        500,
        "JWT_SECRET manquant dans la configuration serveur",
        "JWT_SECRET_MISSING",
      ),
    );
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(
      createHttpError(401, "Token invalide ou expire", "TOKEN_INVALID", {
        reason: error?.name || "UnknownTokenError",
      }),
    );
  }
};
