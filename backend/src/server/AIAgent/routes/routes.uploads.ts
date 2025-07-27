import express from 'express';
import {getSignedURLController} from '../controllers/uploads.controllers'
const router =  express.Router();

router.post('/', getSignedURLController);


export default router;