import { Router } from 'express';
import userRouter from './user.router.js';
import subscriptionRouter from './subscription.router.js';
import notificationRouter from './notification.router.js';
import locationRouter from './location.router.js';
import contactRouter from './contact.router.js';

const router = Router();


router.use(userRouter);
router.use(subscriptionRouter);
router.use(notificationRouter);
router.use(locationRouter);
router.use(contactRouter);


export default router;