import { Router } from "express";
import userRouter from "./user.router.js";

const hospitalRouter = Router();

hospitalRouter.use(userRouter);



export default hospitalRouter;
