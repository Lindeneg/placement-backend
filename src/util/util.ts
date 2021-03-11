import axios, { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';

import HTTPException from '../models/exception.model';
import { GeoLocation, TokenData } from './types';


interface GoogleMapGeoCodeResult {
    geometry: {
        location: GeoLocation
    }  
};

interface GoogleMapGeoCodeResponse {
    status        : string,
    results       : GoogleMapGeoCodeResult[],
    error_message?: string
};

// TODO Use https://developer.mapquest.com/ for geolocation conversion
// TODO Use https://leafletjs.com/ for (frontend) display of map

export const getCoordsFromAddress = async (address: string): Promise<GeoLocation> => {

    const res: AxiosResponse<GoogleMapGeoCodeResponse> = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${
            encodeURI(address)
        }&key=${process.env.GOOGLE_API_KEY}`
    );

    if (!res.data || res.data.status === 'ZERO_RESULTS' || res.data.results.length <= 0) {
        throw new HTTPException('Could not find coordinates for specified address', 422);
    }

    return res.data.results[0].geometry.location;
};

export const getToken = (pl: string | object): string | null => {
    if (typeof process.env.JWT_PRIVATE_TOKEN !== 'undefined') {
        return jwt.sign(pl, process.env.JWT_PRIVATE_TOKEN, {expiresIn: '1h'});
    }
    return null;
}

export const verifyToken = (token: string): TokenData | null => {
    try {
        if (typeof process.env.JWT_PRIVATE_TOKEN !== 'undefined') {
            const result: TokenData = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN) as TokenData;
            if (typeof result === 'object') {
                return result;
            } else {
                process.env.NODE_ENV === 'development' && console.log('unexpected token result: ' + result);
            }
        }
    } catch(err) {
        process.env.NODE_ENV === 'development' && console.log(err);
    }
    return null;
}