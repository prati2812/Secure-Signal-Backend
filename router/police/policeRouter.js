import { Router } from "express";
import userRouter from "./user.router.js";
import notificationRouter from "./notification.router.js";
import locationRouter from "./location.router.js";


const policeRouter = Router();

policeRouter.use(userRouter);
policeRouter.use(notificationRouter);
policeRouter.use(locationRouter);

export default policeRouter;
