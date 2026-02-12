import { generateContent } from "./ai.service.js";
import { z } from "zod";
import { validateSchema } from "../../utils/validate.js";

const aiSchema = z.object({
  prompt: z.string().trim().min(3, "prompt trop court"),
  task: z.string().trim().max(200, "task trop long").optional().default(""),
});

export const generate = async (req, res, next) => {
  try {
    const { prompt, task } = validateSchema(aiSchema, req.body || {});

    const text = await generateContent({ prompt, task });
    res.json({ text });
  } catch (error) {
    next(error);
  }
};
