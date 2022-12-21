import { Router } from 'express';
import { signIn } from '../controllers/sessionsController.js'

const router = Router();

router.post("/signin", signIn)

export default router