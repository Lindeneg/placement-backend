import axios, { AxiosResponse } from 'axios';

import HTTPException from '../models/exception.model';
import { GeoLocation } from './types';


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
}