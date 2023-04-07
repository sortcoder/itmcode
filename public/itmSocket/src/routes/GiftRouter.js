import express from 'express';
const router = express.Router();
import Gift from '../Controller/GiftController';


router.post('',  Gift.create);
router.get('',  Gift.index);
router.get('/list/:id',  Gift.userGifts);
router.get('/:id',  Gift.single);
router.put('/:id',  Gift.update);
router.delete('/:id',  Gift.remove);
router.post('/send',  Gift.sendGift);

export default router;
