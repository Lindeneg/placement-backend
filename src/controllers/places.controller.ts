import { validationResult, Result, ValidationError } from 'express-validator';
import { startSession, ClientSession } from 'mongoose';

import User from '../models/user.model';
import HTTPException from '../models/exception.model';
import Place, { IPlace } from '../models/place.model';
import { getCoordsFromAddress } from '../util/util';
import { EMiddleware, GeoLocation, SBody, CollectionName } from '../util/types';


export const getPlaceById: EMiddleware = async (req, res, next) => {
    const placeId: string = req.params.pid;
    try {
        const foundPlace: IPlace | null = await Place.findById(placeId);
        if (!foundPlace) {
            next(HTTPException.rNotFound());
        } else {
            res.json({message: 'Successfully fetched place.', data: foundPlace.toObject()});
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
            res.json({message: 'Successfully fetched places.', data: foundPlaces.map(e => e.toObject())});
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const createPlace: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(HTTPException.rMalformed());
    }

    const { title, description, address, image, creatorId }: SBody = req.body;
    
    try {
        const ts      : number = new Date().getTime();
        const location: GeoLocation = await getCoordsFromAddress(address);
        const newPlace: IPlace      = new Place({
            title,
            description,
            address,
            creatorId,
            image,
            location,
            createdOn: ts,
            updatedOn: ts
        });
        const session: ClientSession = await startSession();
        session.startTransaction();
        await newPlace.save({ session });
        await User.findByIdAndUpdate(creatorId, { $push: { [CollectionName.Place]: newPlace._id }}, { session });
        await session.commitTransaction();
        res.status(201).json(newPlace.toObject());
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const updatePlaceById: EMiddleware = async (req, res, next) => {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(HTTPException.rMalformed());
    }

    const placeId               : string = req.params.pid;
    const { title, description }: SBody = req.body;

    try {
        const updatedOn : number = new Date().getTime();
        const foundPlace: IPlace | null = await Place.findByIdAndUpdate(placeId, { title, description, updatedOn }, {new: true});
        if (!foundPlace) {
            next(HTTPException.rNotFound())
        } else {
            await foundPlace.save();
            // send the updated object with response
            res.status(200).json(foundPlace.toObject());
        }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};

export const deletePlaceById: EMiddleware = async (req, res, next) => {
    const placeId: string = req.params.pid;
    try {
        const session: ClientSession = await startSession();
        session.startTransaction();
        const foundPlace: IPlace | null = await Place.findByIdAndDelete(placeId, { session });
        if (!foundPlace) { 
            next(HTTPException.rNotFound());
         } else {
            const updatedOn : number = new Date().getTime();
            // remove the place reference from the tied user
            await User.findByIdAndUpdate(foundPlace.creatorId, { $pull: { [CollectionName.Place]: foundPlace._id }, updatedOn }, { session });
            await session.commitTransaction();
            // send the deleted object with response
            res.status(200).json(foundPlace.toObject());
         }
    } catch(err) {
        next(HTTPException.rInternal(err));
    }
};