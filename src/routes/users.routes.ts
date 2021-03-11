import { Router } from 'express';
import { check } from 'express-validator';

import { getUsers, login, signup } from '../controllers/users.controller';


const router = Router();



router.get('/', getUsers);

router.post('/signup', 
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 8, max: 32}),
        check('image').not().isEmpty()
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