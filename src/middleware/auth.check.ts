import HTTPException from '../models/exception.model';
import { verifyToken } from '../util/util';
import { EMiddleware, TokenData } from "../util/types";

// https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript

export const authCheck: EMiddleware = (req, res, next) => {
    try {
        const authHeader: string[] = req.headers.authorization?.split(' ') || [];
        if (authHeader.length === 2) {
            const token   : string           = authHeader[1];
            const decToken: TokenData | null = verifyToken(token);
            if (decToken) {
                req.userData = decToken;
            }
        } else {
            next(HTTPException.rAuth('authorization header is invalid'));
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};