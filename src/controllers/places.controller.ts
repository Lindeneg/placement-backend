import { Request, Response, NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';

import HTTPException from '../models/exception.model';


const DUMMY_DATA: {[key: string]: string | {[key: string]: number}}[] = [
    {
        id: 'p1',
        creatorId: 'u1',
        title: 'Sweet home!',
        description: 'Cosy place to live.',
        address: 'Ulstensvej 51, 2650 Valby',
        location: {lat: 55.667315, lng: 12.507300}
    },
    {
        id: 'p2',
        creatorId: 'u2',
        title: 'Eeeew Sweden!',
        description: 'I dont feel sorry for them.',
        address: 'Liljeholmen 11, 21120 Stockholm',
        location: {lat: 59.308010, lng: 18.034725}
    }
];

type ExpressMW = (req: Request, res: Response, next: NextFunction) => void;


export const getPlaceById: ExpressMW = (req, res, next) => {
    // TODO safer way to extract params
    const placeId = req.params.pid;
    const match = DUMMY_DATA.find(e => e.id === placeId);

    console.log('GET REQUEST IN /PLACES/PID');

    if (!match) {
        next(new HTTPException(`Could not match place with id: ${placeId}`, 404));
    } else {
        res.json({message: 'place works!', data: match});
    }
};

export const getPlacesByUserId: ExpressMW = (req, res, next) => {
    const userId = req.params.uid;
    const matches = DUMMY_DATA.filter(e => e.creatorId === userId);

    console.log('GET REQUEST IN /PLACES/UID');

    if (matches.length <= 0) {
        next(new HTTPException(`Could not match user with id: ${userId}`, 404));
    } else {
        res.json({message: 'user found!', data: matches});
    }
};

export const createPlace: ExpressMW = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(new HTTPException('Cannot handle POST request. Request body malformed.', 422));
    }

    const { title, description, coordinates, address, creatorId}: {[key: string]: string} = req.body;

    console.log('POST REQUEST IN /PLACES');

    const createdPlace: {[key: string]: string | {[key: string]: number}} = {
        id: uuidv4(),
        title,
        description,
        address,
        creatorId,
        location: coordinates
    };

    DUMMY_DATA.push(createdPlace);

    res.status(201).json({createdPlace});
};

export const updatePlaceById: ExpressMW = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {    
        return next(new HTTPException('Cannot handle POST request. Request body malformed.', 422));
    }

    console.log('PATCH REQUEST IN /PLACES/PID');
    const placeId: string = req.params.pid;
    const { title, description }: {[key: string]: string | undefined} = req.body;
    let index: number = -1;

    for (let i = 0; i < DUMMY_DATA.length; i++) {
        if (DUMMY_DATA[i].id === placeId) {
            index = i;
            break;
        }
    }

    if (index >= 0 && title && description) {
        const updatedPlace = { ...DUMMY_DATA[index], title, description };
        DUMMY_DATA[index] = updatedPlace;
        res.status(200).json(updatedPlace);
    } else {
        next(new HTTPException(`Could not match user with id: ${placeId}`, 404));
    }
};

export const deletePlaceById: ExpressMW = (req, res, next) => {
    console.log('DELETE REQUEST IN /PLACES');
    const placeId = req.params.pid;
    let index: number = -1;
    for (let i = 0; i < DUMMY_DATA.length; i++) {
        if (DUMMY_DATA[i].id === placeId) {
            index = i;
            break;
        }
    }

    if (index < 0) {
        next(new HTTPException('Could not match place Id.', 404))
    } else {
        res.status(200).json(DUMMY_DATA.splice(index, 1));
    }  
};