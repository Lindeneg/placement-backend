import { validationResult, Result, ValidationError } from 'express-validator';

import User, { IUser } from '../models/user.model';
import HTTPException from '../models/exception.model';
import { CollectionName, EMiddleware, ModelName, SBody } from '../util/types';


export const getUsers: EMiddleware = async (req, res, next) => {
    try {
        const users: IUser[] = await User.find({}, '-password -email');
        res.status(200).json(users.map(e => e.toObject()));
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const signup: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {
        return next(HTTPException.rMalformed(errors));
    }
    
    const { name, email, password }: SBody = req.body;

    try {
        const existingUser: IUser | null = await User.findOne({ email });
        if (existingUser) {
            next(HTTPException.rUnprocessable('user already exists in system'));
        } else {
            const ts     : number = new Date().getTime();
            const newUser: IUser  = new User({  
                name, 
                email, 
                password, 
                image    : req.file.path,
                places   : [], 
                createdOn: ts, 
                updatedOn: ts,
                lastLogin: ts
            });

            await newUser.save();
            res.status(201).json(newUser.toObject());
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const login: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(HTTPException.rMalformed(errors));
    }

    const { email, password }: SBody = req.body;

    try {
        const foundUser: IUser | null = await User.findOne({ email, password }, '-password -email').populate({
            path: CollectionName.Place, 
            model: ModelName.Place
        });
        if (!foundUser) {
            next(HTTPException.rAuth())
        } else {
            foundUser.lastLogin = new Date().getTime();
            await foundUser.save();
            res.status(200).json(foundUser.toObject());
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};