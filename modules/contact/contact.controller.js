import { sendContactEmail } from "./contact.service.js";
import { z } from "zod";
import { validateSchema } from "../../utils/validate.js";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().email("Email invalide"),
  subject: z.string().trim().min(3, "Sujet trop court"),
  message: z.string().trim().min(10, "Message trop court"),
});

export const sendMail = async (req, res, next) => {
  try {
    const payload = validateSchema(contactSchema, req.body || {});
    await sendContactEmail(payload);
    res.status(201).json({
      success: true,
      message: "Message envoye avec succes",
    });
  } catch (error) {
    next(error);
  }
};
