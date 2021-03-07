import express, { Express, Request, Response, NextFunction} from 'express';
import { json as bpJson } from 'body-parser';

import placesRouter from './routes/places.routes';
import HTTPException from './models/exception.model';
//import usersRouter from './routes/users-route'


const app: Express = express();

app.use(bpJson());

app.use('/api/places', placesRouter);
//app.use('/api/users', usersRouter);


app.use(((error: HTTPException, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.statusCode)
    .json({message: error.message});
}));


app.listen(5000);
