import { Router } from 'express';
import { check } from 'express-validator';

import { fileUpload } from '../middleware/file.upload';
import { getUsers, login, signup } from '../controllers/users.controller';


const router = Router();


router.get('/', getUsers);

router.post('/signup', 
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 8, max: 32}),
    ],
    signup
);

router.post('/login', 
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 8, max: 32})
    ],
    login
);


export default router;