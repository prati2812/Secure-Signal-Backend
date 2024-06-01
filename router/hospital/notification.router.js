import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import { sendNotificationToComplainer } from "../../controller/hospital/notification.controller.js";

const notificationRouter = Router();

notificationRouter.post("/hospital/sendNotificationComplainer" , authentication , sendNotificationToComplainer);


export default notificationRouter;
