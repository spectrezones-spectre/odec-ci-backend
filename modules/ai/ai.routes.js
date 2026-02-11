import { Router } from 'express';
import { generate } from './ai.controller.js';
const r=Router(); r.post('/',generate); export default r;
