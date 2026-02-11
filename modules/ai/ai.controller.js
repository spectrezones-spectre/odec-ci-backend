import { generateContent } from "./ai.service.js";
import { createHttpError } from "../../utils/httpError.js";

export const generate = async (req, res, next) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    const task = String(req.body?.task || "").trim();

    if (!prompt) {
      throw createHttpError(400, "Le champ prompt est requis", "AI_PROMPT_MISSING");
    }

    const text = await generateContent({ prompt, task });
    res.json({ text });
  } catch (error) {
    next(error);
  }
};
