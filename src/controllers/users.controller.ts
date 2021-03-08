import { Request, Response, NextFunction} from 'express';
import { v4 as generateId } from 'uuid';
import { validationResult } from 'express-validator';

import HTTPException from '../models/exception.model';


const DUMMY_DATA = [
    {
        id: 'u1',
        name: 'miles davis',
        email: 'miles@smiles.com',
        password: 'kindofblue'
    },
    {
        id: 'u2',
        name: 'bill evans',
        email: 'rip@lafaro.com',
        password: 'debbie'
    }
];


type ExpressMW = (req: Request, res: Response, next: NextFunction) => void;


export const getUsers: ExpressMW = (req, res, next) => {
    res.status(200).json(DUMMY_DATA);
};

export const signup: ExpressMW = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(new HTTPException('Cannot handle POST request. Request body malformed.', 422));
    }
    
    const { name, email, password } = req.body;

    const match = DUMMY_DATA.find(e => e.email === email);

    if (match) {
        next(new HTTPException('Cannot signup. User already exists.', 422));
    } else {
        const newUser = {
            id: generateId(),
            name, email, password
        };  
    
        DUMMY_DATA.push(newUser);
    
        res.status(201).json(newUser);
    }
};

export const login: ExpressMW = (req, res, next) => {
    const { email, password } = req.body;

    const match = DUMMY_DATA.find(e => e.email === email && e.password === password);

    if (!match) {
        next(new HTTPException('Authentication Error. Credentials are incorrect.', 403))
    } else {
        res.status(200).json({message: 'Login successful'});
    }
};