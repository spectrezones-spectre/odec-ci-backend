import { Router } from "express";
import { sendMail } from "./contact.controller.js";
import { contactLimiter } from "../../middlewares/routeLimiters.js";

const r = Router();
r.post("/", contactLimiter, sendMail);
export default r;
