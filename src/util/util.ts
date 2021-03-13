import axios, { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';

import { GeoLocation, TokenData } from './types';
import { COORDINATES_FROM_ADDRESS_FAILED_VALUE as errorLoc, isDebug } from './constants';


interface MapQuestGeoCodeResult {
    providedLocation: { location: string },
    locations       : { latLng  : GeoLocation }[]
};

interface MapQuestGeoCodeResponse {
    info          : { statuscode: number, messages: string[] },
    results       : MapQuestGeoCodeResult[]
};

export const getCoordsFromAddress = async (address: string): Promise<GeoLocation> => {

    const res: AxiosResponse<MapQuestGeoCodeResponse> = await axios.get(
        `https://www.mapquestapi.com/geocoding/v1/address?key=${process.env.MAP_QUEST_API_KEY}&location=${
            encodeURI(address)
        }&maxResults=1`
    );

    if (
        !res.data || res.data.info.statuscode !== 0 || res.data.results.length <= 0 || 
        res.data.results[0].locations.length <= 0 || typeof res.data.results[0].locations[0].latLng === 'undefined'
        ) {
        isDebug && console.log('error ' + res.data.info.statuscode + ' fetching coordinates from address: ', res.data.info.messages);
        return { lng: errorLoc, lat: errorLoc };
    }

    return res.data.results[0].locations[0].latLng;
};

export const getToken = (pl: string | object): string | null => {
    if (typeof process.env.JWT_PRIVATE_TOKEN !== 'undefined') {
        return jwt.sign(pl, process.env.JWT_PRIVATE_TOKEN, {expiresIn: '1h'});
    }
    return null;
};

export const verifyToken = (token: string): TokenData | null => {
    try {
        if (typeof process.env.JWT_PRIVATE_TOKEN !== 'undefined') {
            const result: TokenData = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN) as TokenData;
            if (typeof result === 'object') {
                return result;
            } else {
                isDebug && console.log('unexpected token result: ' + result);
            }
        }
    } catch(err) {
        isDebug && console.log(err);
    }
    return null;
};

export const logError = (error: string): void => {
    isDebug && console.log(error);
}