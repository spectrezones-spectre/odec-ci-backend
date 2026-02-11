import { Router } from "express";
import { sendMail } from "./contact.controller.js";

const r = Router();
r.post("/", sendMail);
export default r;
