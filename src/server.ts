import path from 'path';

import express, { Express, Request, Response, NextFunction} from 'express';
import { connect } from 'mongoose';
import { json as bodyParserJSON } from 'body-parser';
import { config } from 'dotenv';

import placesRouter from './routes/places.routes';
import usersRouter from './routes/users.routes'
import HTTPException from './models/exception.model';


config({path: path.resolve(__dirname, '../.env')});

if (typeof process.env.MONGO_DB_URI === 'undefined') {
    throw new Error('MONGO_DB_URI is undefined');
}

// TODO use leaflet instead
if (typeof process.env.GOOGLE_API_KEY === 'undefined') {
    throw new Error('GOOGLE_API_KEY is undefined');
}


const app: Express = express();


app.use(bodyParserJSON());


app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);


app.use((req: Request, res: Response, next: NextFunction) => {
    next(HTTPException.rNotFound());
});


app.use(((error: HTTPException, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(error);
    } else {
        res.status(error.statusCode).json(error.toResponse());
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
    app.listen(5000, () => {
        console.log('connected to mongodb\nstarting server on port 5000');
    });
})
.catch((err) => {
    console.log('connection to mongodb failed...');
    if (process.env.NODE_ENV === 'development') {
        console.log(err);
    }
});