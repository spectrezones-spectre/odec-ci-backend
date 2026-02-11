import nodemailer from "nodemailer";
import { createHttpError } from "../../utils/httpError.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sendContactEmail = async (data) => {
  if (!data?.name || !data?.email || !data?.subject || !data?.message) {
    throw createHttpError(
      400,
      "name, email, subject et message sont requis",
      "CONTACT_REQUIRED_FIELDS_MISSING",
    );
  }

  if (!isValidEmail(String(data.email))) {
    throw createHttpError(400, "Format d'email invalide", "CONTACT_INVALID_EMAIL", {
      email: data.email,
    });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw createHttpError(
      500,
      "Configuration SMTP incomplete: SMTP_HOST, SMTP_USER, SMTP_PASS requis",
      "SMTP_CONFIG_INCOMPLETE",
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    return await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      replyTo: data.email,
      to: process.env.CONTACT_TO_EMAIL || "contact@odec-ci.org",
      subject: `[Contact ODEC-CI] ${data.subject}`,
      text: `Nom: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    });
  } catch (error) {
    throw createHttpError(
      502,
      "Echec d'envoi du message de contact via SMTP",
      "SMTP_SEND_FAILED",
      { reason: error?.message || "UnknownSMTPError" },
    );
  }
};
