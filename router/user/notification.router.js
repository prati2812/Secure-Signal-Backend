import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import {deleteAllNotification, fetchEmergencyContactNotification, fetchLiveLocationNotification, fetchSafeArrivalNotification, markAllReadNotification, markAsReadNotification, markLiveLocationAsReadNotification, markSafeArrivalAsReadNotification, saveEmergencyContactNotification, saveLiveLocationNotification, saveSafelyArraivalNotification, sendNotificationEmergencyContact, sendNotificationToNearestHospital, sendNotificationToNearestPoliceStation } from "../../controller/user/notification.controller.js";



const notificationRouter = Router();


notificationRouter.post("/sendNotificationEmergencyContact" , authentication , sendNotificationEmergencyContact);
notificationRouter.post("/saveEmergencyContactNotification" , authentication , saveEmergencyContactNotification);
notificationRouter.post("/fetchEmergencyContactNotification" , authentication ,  fetchEmergencyContactNotification);
notificationRouter.post("/markAllAsRead" , authentication , markAllReadNotification);
notificationRouter.post("/deleteAllNotification" , authentication , deleteAllNotification);
notificationRouter.post("/markAsRead" , authentication , markAsReadNotification);
notificationRouter.post("/liveLocationNotificationMarkAsRead" , authentication , markLiveLocationAsReadNotification);
notificationRouter.post("/sendComplaintNotification" , authentication,sendNotificationToNearestPoliceStation);
notificationRouter.post("/hospital/complaint/sendNotification" , authentication , sendNotificationToNearestHospital);
notificationRouter.post("/saveLiveLocation" , authentication , saveLiveLocationNotification);
notificationRouter.post("/fetchLiveLocationNotification" , authentication , fetchLiveLocationNotification);
notificationRouter.post("/saveSafelyArrivalNotification" , authentication , saveSafelyArraivalNotification);
notificationRouter.post("/fetchSafeArrivalNotification" , authentication , fetchSafeArrivalNotification);
notificationRouter.post("/safeArrivalNotificationMarksAsRead" , authentication, markSafeArrivalAsReadNotification);


export default notificationRouter;