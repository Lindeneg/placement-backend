import { Schema, Types, model } from 'mongoose';

import { IUser } from './user.model';
import { BaseDoc, ModelName, GeoLocation } from '../util/types';


export interface IPlace extends BaseDoc {
    title      : string,
    description: string,
    image      : string,
    address    : string,
    creatorId  : IUser['_id'],
    location   : GeoLocation,
};

const placeSchema: Schema = new Schema({
    title      : { type: String, required: true },
    description: { type: String, required: true },
    image      : { type: String, required: true },
    address    : { type: String, required: true },
    creatorId  : { type: Types.ObjectId, required: true, ref: ModelName.User },
    location   : { 
        lat    : { type: Number, required: true },
        lng    : { type: Number, required: true }
     },
     createdOn : { type: Number, required: true },
     updatedOn : { type: Number, required: true }
});


export default model<IPlace>(ModelName.Place, placeSchema);