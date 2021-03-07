import { Request, Response, NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';


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
    const placeId = req.params.pid;
    const match = DUMMY_DATA.find(e => e.id === placeId);

    console.log('GET REQUEST IN /PLACES/PID');

    if (!match) {
        return next(new HTTPException('Could not match place with the provided id', 404));
    }
    res.json({message: 'place works!', data: match});
};

export const getPlaceByUserId: ExpressMW = (req, res, next) => {
    const userId = req.params.uid;
    const match = DUMMY_DATA.find(e => e.creatorId === userId);

    console.log('GET REQUEST IN /PLACES/UID');

    if (!match) {
        return next(new HTTPException('Could not match user with the provided id', 404));
    }
    res.json({message: 'user found!', data: match});
};

export const createPlace: ExpressMW = (req, res, next) => {
    const { title, description, coordinates, address, creatorId}: {[key: string]: string | undefined} = req.body;

    console.log('POST REQUEST IN /PLACES');

    console.log(req.body)

    if (title && description && coordinates && address && creatorId) {
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
    } else {
        next(new HTTPException('Request body malformed. Cannot handle POST request', 400));
    }
};