import { Router } from 'express';
import { check } from 'express-validator';

import { 
    getPlaceById, 
    getPlacesByUserId, 
    updatePlaceById,
    deletePlaceById,
    createPlace 
} from '../controllers/places.controller';


const router = Router();

router.get('/:pid',      getPlaceById);
router.get('/user/:uid', getPlacesByUserId);

router.post('/', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty(),
    ], 
    createPlace
);

router.patch('/:pid', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
    ],
    updatePlaceById);

router.delete('/:pid', deletePlaceById);


export default router;