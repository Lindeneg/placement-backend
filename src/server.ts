import path from 'path';
import fs from 'fs';

import express, { Express, Request, Response, NextFunction } from 'express';
import { connect } from 'mongoose';
import { json as bodyParserJSON } from 'body-parser';
import { config } from 'dotenv';

import placesRouter from './routes/places.routes';
import usersRouter from './routes/users.routes'
import HTTPException from './models/exception.model';
import { isDebug, requiredEnvVars } from './util/constants';


config({path: path.resolve(__dirname, '../.env')});

requiredEnvVars.forEach(key => {
    if (typeof process.env.key === 'undefined') {
        throw new Error(key + ' is undefined');
    }
});

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
            isDebug && console.log(err);
        });
    }
    if (res.headersSent) {
        next(error);
    } else {
        const fallBack: string = isDebug ? error : 'Something went wrong. Please try again.';
        res.status(error.statusCode || 500).json(error instanceof HTTPException ? error.toResponse() : (error instanceof Error ? error.message : fallBack));
    }
}));


console.log('connecting to mongodb...')
// https://mongoosejs.com/docs/deprecations.html
connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_KEY}@${process.env.MONGO_DB_CLUSTER}.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser   : true, 
    useUnifiedTopology: true,
    useCreateIndex    : true,
    useFindAndModify  : false
})
.then(() => {
    // only start server if connection to database exists
    app.listen(process.env.PORT || 5000, () => {
        console.log('connected to mongodb\nstarting server on port ' + process.env.PORT || 5000);
    });
})
.catch((err) => {
    console.log('connection to mongodb failed...');
    isDebug && console.log(err);
});