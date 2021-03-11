import { Router } from 'express';
import { check } from 'express-validator';

import { fileUpload } from '../middleware/file.upload';
import { authCheck } from '../middleware/auth.check';
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


router.use(authCheck);


router.post('/', 
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty(),
        check('creatorId').not().isEmpty()
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