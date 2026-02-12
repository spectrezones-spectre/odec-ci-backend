import { Router } from 'express';
import { generate } from './ai.controller.js';
import { aiLimiter } from "../../middlewares/routeLimiters.js";
const r=Router(); r.post('/', aiLimiter, generate); export default r;
