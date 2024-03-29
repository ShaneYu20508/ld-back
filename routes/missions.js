import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { create, getAll, edit, get, getId } from '../controllers/missions.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'
import mailman from '../middlewares/mailman.js'

const router = Router()

router.post('/', auth.jwt, upload, create)
router.get('/all', auth.jwt, admin, getAll)
router.patch('/:id', auth.jwt, admin, upload, edit)
router.get('/',auth.jwt, mailman, get)
router.get('/:id', getId)

export default router
