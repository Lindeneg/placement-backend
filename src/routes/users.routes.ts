import { Router } from 'express';
import { check } from 'express-validator';

import { getUsers, login, signup } from '../controllers/users.controller';


const router = Router();



router.get('/', getUsers);

router.post('/signup', 
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6})
    ],
    signup
);

router.post('/login', login);


export default router;