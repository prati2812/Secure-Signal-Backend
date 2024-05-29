import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import { deleteAllLiveLocationNotificationData, fetchLiveLocationNotificatioPoliceStation, markAllReadLiveLocationNotification, markAsReadLiveLocationNotification, saveLiveLocationNotificationPoliceStation } from "../../controller/police/notification.controller.js";



const notificationRouter = Router();

notificationRouter.post("/savePoliceStationNotification" , authentication , saveLiveLocationNotificationPoliceStation);
notificationRouter.post("/policeStation/LiveLocation/fetchNotification" , authentication , fetchLiveLocationNotificatioPoliceStation);
notificationRouter.post("/policeStation/LiveLocation/markAsRead" , authentication , markAsReadLiveLocationNotification);
notificationRouter.post("/policeStation/LiveLocation/markAsAllRead", authentication, markAllReadLiveLocationNotification);
notificationRouter.post("/policeStation/LiveLocation/deleteAllNotification" , authentication, deleteAllLiveLocationNotificationData);


export default notificationRouter;