import { Router } from 'express';


const DUMMY_DATA = [
    {
        id: 'u1',
        name: 'miles',
        placeQty: 2
    },
    {
        id: 'u2',
        name: 'davis',
        placeQty: 5
    }
];

const router = Router();


router.get('/:uid', (req, res, next) => {
    const userId = req.params.uid;
    const match = DUMMY_DATA.find(e => e.id === userId);
    console.log('GET REQUEST IN /USERS');
    res.json({message: 'it works!', data: match});
});


export default router;