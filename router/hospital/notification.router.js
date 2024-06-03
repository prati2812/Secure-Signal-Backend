import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import { saveComplaintHospitalStatusNotification, sendNotificationToComplainer } from "../../controller/hospital/notification.controller.js";


const notificationRouter = Router();

notificationRouter.post("/hospital/sendNotificationComplainer" , authentication , sendNotificationToComplainer);
notificationRouter.post("/hospital/complaintStatus/saveHospitalStatus" , authentication , saveComplaintHospitalStatusNotification);

export default notificationRouter;
