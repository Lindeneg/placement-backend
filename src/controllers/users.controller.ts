import { validationResult, Result, ValidationError } from 'express-validator';
import bcrypt from 'bcryptjs';

import User, { IUser } from '../models/user.model';
import HTTPException from '../models/exception.model';
import { getToken } from 'src/util/util';
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
            const pwd    : string = await bcrypt.hash(password, 16);
            const newUser: IUser  = new User({  
                name, 
                email, 
                password : pwd, 
                image    : req.file.path,
                places   : [], 
                createdOn: ts, 
                updatedOn: ts,
                lastLogin: ts
            });
            await newUser.save();
            const token: string | null = getToken({userId: newUser._id});
            if (token) {
                res.status(201).json({
                    token,
                    _id: newUser._id
                });
            } else {
                next(HTTPException.rInternal('jwt token could not be generated'));
            }
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
        const foundUser: IUser | null = await User.findOne({ email }, '-email').populate({
            path: CollectionName.Place, 
            model: ModelName.Place
        });
        if (!foundUser) {
            next(HTTPException.rAuth());
        } else {
            const pwdValid: boolean = await bcrypt.compare(password, foundUser.password);
            if (!pwdValid) {
                next(HTTPException.rAuth());
            } else {
                foundUser.lastLogin = new Date().getTime();
                await foundUser.save();
                const token: string | null = getToken({ userId: foundUser._id});
                if (token) {
                    res.status(200).json({
                        token,
                        _id: foundUser._id
                    });
                } else {
                    next(HTTPException.rInternal('jwt token could not be generated'));
                }
            }
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};