import express, { Express, Request, Response, NextFunction} from 'express';
import { json as bodyParserJSON } from 'body-parser';
import { config } from 'dotenv';

import placesRouter from './routes/places.routes';
import usersRouter from './routes/users.routes'
import HTTPException from './models/exception.model';


// use environmental variables from .env file found in root of project
if (process.env.NODE_ENV === 'development') {
    config();
}

const app: Express = express();

app.use(bodyParserJSON());

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);

app.use((req, res, next) => {
    next(new HTTPException(`Could not find the specified route: ${req.path}`, 404));
});

app.use(((error: HTTPException, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.statusCode)
    .json({message: error.message});
}));


app.listen(5000);
