import path from 'path';
import fs from 'fs';

import express, { Express, Request, Response, NextFunction } from 'express';
import { connect } from 'mongoose';
import { json as bodyParserJSON } from 'body-parser';
import { config } from 'dotenv';

import placesRouter from './routes/places.routes';
import usersRouter from './routes/users.routes'
import HTTPException from './models/exception.model';


// TODO logging

config({path: path.resolve(__dirname, '../.env')});

if (typeof process.env.MONGO_DB_URI === 'undefined') {
    throw new Error('MONGO_DB_URI is undefined');
}

if (typeof process.env.WHITELISTED_DOMAIN === 'undefined') {
    throw new Error('WHITELISTED_DOMAIN is undefined');
}

if (typeof process.env.JWT_PRIVATE_TOKEN === 'undefined') {
    throw new Error('JWT_PRIVATE_TOKEN is undefined');
}

if (typeof process.env.PORT === 'undefined') {
    throw new Error('PORT is undefined');
}


// TODO use leaflet instead
if (typeof process.env.GOOGLE_API_KEY === 'undefined') {
    throw new Error('GOOGLE_API_KEY is undefined');
}

const debug: boolean = process.env.NODE_ENV === 'development';


const app: Express = express();


app.use(bodyParserJSON());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WHITELISTED_DOMAIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);


app.use((req: Request, res: Response, next: NextFunction) => {
    next(HTTPException.rNotFound());
});


app.use(((error: HTTPException | any, req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        // if any error occurs and we have a file in the request,
        // that file could have been written to disk, thus remove it
        fs.unlink(req.file.path, (err) => {
            debug && console.log(err);
        });
    }
    if (res.headersSent) {
        next(error);
    } else {
        const fallBack: string = debug ? error : 'Something went wrong. Please try again.';
        res.status(error.statusCode || 500).json(error instanceof HTTPException ? error.toResponse() : (error instanceof Error ? error.message : fallBack));
    }
}));


console.log('connecting to mongodb...')
// https://mongoosejs.com/docs/deprecations.html
connect(process.env.MONGO_DB_URI, {
    useNewUrlParser   : true, 
    useUnifiedTopology: true,
    useCreateIndex    : true,
    useFindAndModify  : false
})
.then(() => {
    // only start server if connection to database exists
    app.listen(process.env.PORT, () => {
        console.log('connected to mongodb\nstarting server on port ' + process.env.PORT);
    });
})
.catch((err) => {
    console.log('connection to mongodb failed...');
    debug && console.log(err);
});