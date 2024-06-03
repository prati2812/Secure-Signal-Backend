import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import { deleteAllLiveLocationNotificationData, fetchLiveLocationNotificatioPoliceStation, markAllReadLiveLocationNotification, markAsReadLiveLocationNotification, saveComplaintPoliceStationStatusNotification, saveLiveLocationNotificationPoliceStation, sendNotificationToComplainer } from "../../controller/police/notification.controller.js";



const notificationRouter = Router();

notificationRouter.post("/savePoliceStationNotification" , authentication , saveLiveLocationNotificationPoliceStation);
notificationRouter.post("/policeStation/LiveLocation/fetchNotification" , authentication , fetchLiveLocationNotificatioPoliceStation);
notificationRouter.post("/policeStation/LiveLocation/markAsRead" , authentication , markAsReadLiveLocationNotification);
notificationRouter.post("/policeStation/LiveLocation/markAsAllRead", authentication, markAllReadLiveLocationNotification);
notificationRouter.post("/policeStation/LiveLocation/deleteAllNotification" , authentication, deleteAllLiveLocationNotificationData);
notificationRouter.post("/policeStation/Notification/sendNotificationComplainer" , authentication , sendNotificationToComplainer);
notificationRouter.post("/policeStation/Notification/complaint/savePoliceStationStatus", authentication , saveComplaintPoliceStationStatusNotification);

export default notificationRouter;