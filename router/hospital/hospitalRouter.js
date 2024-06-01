import { Router } from "express";
import userRouter from "./user.router.js";
import notificationRouter from "./notification.router.js";


const hospitalRouter = Router();

hospitalRouter.use(userRouter);
hospitalRouter.use(notificationRouter);


export default hospitalRouter;
