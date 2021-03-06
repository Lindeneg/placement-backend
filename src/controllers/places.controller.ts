import fs from 'fs';

import { validationResult, Result, ValidationError } from 'express-validator';
import { startSession, ClientSession } from 'mongoose';

import User from '../models/user.model';
import HTTPException from '../models/exception.model';
import Place, { IPlace } from '../models/place.model';
import { getCoordsFromAddress } from '../util/util';
import { isDebug } from '../util/constants';
import { EMiddleware, GeoLocation, SBody, CollectionName } from '../util/types';


export const getPlaceById: EMiddleware = async (req, res, next) => {
    const placeId: string = req.params.pid;
    try {
        const foundPlace: IPlace | null = await Place.findById(placeId);
        if (!foundPlace) {
            next(HTTPException.rNotFound());
        } else {
            res.json(foundPlace.toObject());
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};


export const getPlacesByUserId: EMiddleware = async (req, res, next) => {
    const userId: string = req.params.uid;    
    try {
        const foundPlaces: IPlace[] | null = await Place.find({creatorId: userId});
        if (!foundPlaces) {
            next(HTTPException.rNotFound());
        } else {
            res.json(foundPlaces.map(e => e.toObject()));
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const createPlace: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(HTTPException.rMalformed(errors));
    }

    const { title, description, address, creatorId }: SBody = req.body;
    
    try {
        // perhaps omit creatorId as an expected property on request body
        // and just use the already forwarded req.userData.userId
        if (creatorId === req.userData.userId) {
            const ts      : number = new Date().getTime();
            const location: GeoLocation = await getCoordsFromAddress(address);
            const newPlace: IPlace      = new Place({
                title,
                description,
                address,
                creatorId,
                location,
                image    : req.file.path,
                createdOn: ts,
                updatedOn: ts
            });
            const session: ClientSession = await startSession();
            session.startTransaction();
            await newPlace.save({ session });
            await User.findByIdAndUpdate(creatorId, { $push: { [CollectionName.Place]: newPlace._id }, updatedOn: ts}, { session });
            await session.commitTransaction();
            res.status(201).json(newPlace.toObject());
        } else {
            next(HTTPException.rAuth('provided creatorId does not match the userId in the current session'));
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const updatePlaceById: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(HTTPException.rMalformed(errors));
    }

    const placeId               : string = req.params.pid;
    const { title, description }: SBody  = req.body;

    try {
        const updatedOn : number = new Date().getTime();
        const foundPlace: IPlace | null = await Place.findById(placeId); 
        if (!foundPlace) {
            next(HTTPException.rNotFound())
        } else if (req.userData.userId === foundPlace.creatorId.toString()) {
            foundPlace.title = title; foundPlace.description = description; foundPlace.updatedOn = updatedOn;
            await foundPlace.save();
            await User.findByIdAndUpdate(foundPlace.creatorId, { updatedOn });
            // send the updated object with response
            res.status(200).json(foundPlace.toObject());
        } else {
            next(HTTPException.rAuth('incorrect token for desired action'));
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const deletePlaceById: EMiddleware = async (req, res, next) => {
    const placeId: string = req.params.pid;
    try {
        const foundPlace: IPlace | null = await Place.findById(placeId);
        if (!foundPlace) { 
            next(HTTPException.rNotFound());
         } else if (req.userData.userId === foundPlace.creatorId.toString()) {
             const updatedOn : number = new Date().getTime();
             // start transaction
             const session: ClientSession = await startSession();
             session.startTransaction();
             // remove place
             await foundPlace.remove();
             // remove the place reference from the tied user
             await User.findByIdAndUpdate(foundPlace.creatorId, { $pull: { [CollectionName.Place]: foundPlace._id }, updatedOn }, { session });
             await session.commitTransaction();
             // delete image on server
             fs.unlink(foundPlace.image, (err) => {
                 isDebug && console.log(err);
             });
             // send the deleted object with response
             res.status(200).json(foundPlace.toObject());
         } else {
            next(HTTPException.rAuth('incorrect token for desired action'));
         }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};