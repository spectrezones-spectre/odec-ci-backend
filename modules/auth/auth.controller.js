import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError.js";

const prisma = new PrismaClient();

export const login = async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      throw createHttpError(
        400,
        "username et password sont requis",
        "AUTH_CREDENTIALS_MISSING",
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      throw createHttpError(401, "Identifiants invalides", "AUTH_INVALID_CREDENTIALS");
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError(
        500,
        "JWT_SECRET manquant dans les variables d'environnement",
        "JWT_SECRET_MISSING",
      );
    }

    const token = jwt.sign({ id: admin.id, admin: true }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};
