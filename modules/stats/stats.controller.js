import { db } from "../../config/db.js";
import { createHttpError } from "../../utils/httpError.js";

export const getStats = async (_req, res, next) => {
  try {
    const [totalForms, totalDonsResult, totalInscrits] = await Promise.all([
      db.contactMessage.count(),
      db.don.aggregate({ _sum: { amount: true } }),
      db.inscription.count(),
    ]);

    const totalDons = Number(totalDonsResult._sum?.amount ?? 0);

    res.json({
      totalForms,
      totalDons,
      totalInscrits,
    });
  } catch (error) {
    next(error);
  }
};
