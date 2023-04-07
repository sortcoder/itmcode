import express from 'express';
import path from 'path';

import giftRouter from './GiftRouter';


const router = express();

router.use('/api/gifts', giftRouter);  

router.use('/:folder/:img', (req, res) => {
    const {folder, img} = req.params;
    res.sendFile(path.join(__dirname, '../..', 'uploads', folder, img));
});

export default router;
