import { Router } from 'express'
import { postShort } from '../controllers/urlsControllers.js'
import { getUrlbyId } from '../controllers/urlsControllers.js'
import { getShort } from '../controllers/urlsControllers.js'
import { deleteShort } from '../controllers/urlsControllers.js'
import { getUsersMe } from '../controllers/urlsControllers.js'
import { getRanking } from '../controllers/urlsControllers.js'

const router = Router();

router.post("/urls/shorten", postShort)
router.get("/urls/:id", getUrlbyId)
router.get("/urls/open/:shortUrl", getShort)
router.delete("/urls/:id", deleteShort)
router.get("/users/me", getUsersMe)
router.get("/ranking", getRanking)

export default router