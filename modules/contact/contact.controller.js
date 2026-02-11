import { sendContactEmail } from "./contact.service.js";

export const sendMail = async (req, res, next) => {
  try {
    await sendContactEmail(req.body);
    res.status(201).json({
      success: true,
      message: "Message envoye avec succes",
    });
  } catch (error) {
    next(error);
  }
};
