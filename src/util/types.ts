import { Request, Response, NextFunction} from 'express';
import { Result, ValidationError } from 'express-validator';
import { Document } from "mongoose";


export enum ModelName {
    User  = 'User',
    Place = 'Place'
};

export enum CollectionName {
    User  = 'users',
    Place = 'places'
};

export interface GeoLocation {
    lat: number,
    lng: number
};

export interface BaseDoc extends Document {
    createdOn  : number,
    updatedOn  : number
};

export interface ErrorResponseContent {
    message: string,
    dev   ?: DevError
};

export interface SBody {
    [key: string]: string
};

export interface TokenData {
    userId: string
};

export type DevError = string | Result<ValidationError>;

export type EMiddleware = (req: Request, res: Response, next: NextFunction) => void;