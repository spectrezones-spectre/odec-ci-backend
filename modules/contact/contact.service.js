const nodemailer = require("nodemailer");
const { createHttpError } = require("../../utils/httpError.js");
const { db } = require("../../config/db.js");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Transport SMTP pour Namecheap Private Email (mail.privateemail.com) */
function createTransporter() {
  const host = process.env.SMTP_HOST || "mail.privateemail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw createHttpError(
      500,
      "Configuration SMTP incomplete: SMTP_USER et SMTP_PASS requis (ex. compte Namecheap)",
      "SMTP_CONFIG_INCOMPLETE",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "test@odec-ci.org";
const VALID_SUBJECTS = new Set([
  "demande_acces",
  "faire_don",
  "partenariat",
  "autre",
]);

const sendContactEmail = async (data) => {
  const { lastName, firstName, address, phone, email, subject, message } = data;

  if (
    !lastName?.trim() ||
    !firstName?.trim() ||
    !address?.trim() ||
    !phone?.trim() ||
    !email?.trim() ||
    !subject ||
    !message?.trim()
  ) {
    throw createHttpError(
      400,
      "Tous les champs sont requis (nom, prénom, adresse, téléphone, email, sujet, message)",
      "CONTACT_REQUIRED_FIELDS_MISSING",
    );
  }

  if (!isValidEmail(String(email))) {
    throw createHttpError(
      400,
      "Format d'email invalide",
      "CONTACT_INVALID_EMAIL",
      { email },
    );
  }

  if (!VALID_SUBJECTS.has(subject)) {
    throw createHttpError(400, "Sujet invalide", "CONTACT_INVALID_SUBJECT", {
      subject,
    });
  }

  // Sauvegarde en base (protection XSS : champs stockés tels quels, échappés à l'affichage)
  const contactRecord = await db.contactMessage.create({
    data: {
      lastName: String(lastName).trim(),
      firstName: String(firstName).trim(),
      address: String(address).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      subject: String(subject),
      message: String(message).trim(),
    },
  });

  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subjectLabels = {
    liste_doulante: "Liste déroulante",
    demande_acces: "Demande d'accès",
    faire_don: "Faire un don",
    partenariat: "Partenariat",
    autre: "Autre",
  };
  const subjectLabel = subjectLabels[subject] || subject;

  const mailBody = [
    `Nom: ${lastName}`,
    `Prénom: ${firstName}`,
    `Adresse: ${address}`,
    `Téléphone: ${phone}`,
    `Email: ${email}`,
    `Sujet: ${subjectLabel}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    await transporter.sendMail({
      from,
      replyTo: email,
      to: CONTACT_TO_EMAIL,
      subject: `[Contact ODEC-CI] ${subjectLabel} – ${firstName} ${lastName}`,
      text: mailBody,
    });
  } catch (error) {
    console.error("SMTP send error:", error?.message || error);
    throw createHttpError(
      502,
      "Échec d'envoi du message. Veuillez réessayer plus tard.",
      "SMTP_SEND_FAILED",
      { reason: error?.message },
    );
  }

  return { id: contactRecord.id, success: true };
};


module.exports = { isValidEmail, sendContactEmail };
