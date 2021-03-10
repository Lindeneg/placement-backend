import { Schema, Types, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator'

import { BaseDoc, ModelName } from '../util/types';
import { IPlace } from './place.model';


export interface IUser extends BaseDoc {
    name     : string,
    image    : string,
    email    : string,
    password : string,
    places   : Array<IPlace['_id']>,
    createdOn: number,
    updatedOn: number,
    lastLogin: number
};

const userSchema: Schema = new Schema({
    name     : { type: String, required: true },
    image    : { type: String, required: true },
    email    : { type: String, required: true, unique: true },
    password : { type: String, required: true, minLength: 6 },
    places   : { type: [ Types.ObjectId ], required: true, ref: ModelName.Place },
    createdOn: { type: Number, required: true },
    updatedOn: { type: Number, required: true },
    lastLogin: { type: Number, required: true }
});

// validate uniqueness of email
userSchema.plugin(uniqueValidator);


export default model<IUser>(ModelName.User, userSchema);