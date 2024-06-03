import { log } from 'firebase-functions/logger';
import {auth} from '../../db/connection.js';

const database = auth.database();


export const saveLiveLocationNotificationPoliceStation = async(req,res) =>{
    const {userId , policeStationId , senderName} = req.body;

    

    if(!policeStationId){
        return res.status(400).send('PoliceStationId is not provided');
    }
    if(!senderName){
        return res.status(400).send('SenderName is not provided');
    }

    try{
   
        const policeRef = database.ref(`police_station/${policeStationId}/notifications/liveLocation`);
        const key = policeRef.push().key;
        policeRef.child(key).set({
            "senderName": senderName,
            "timeStamp": new Date().toLocaleString(),
            "isRead" : false,
            "notification_id": key,
            "senderId":userId,    
        });

        return res.status(200).send("Notification Saved Successfully"); 
        

    }
    catch(error){
        return res.status(500).send(error);
    }   
}

export const fetchLiveLocationNotificatioPoliceStation = async(req,res) => {
       const {userId} = req.body;
       let NotificationData = [];

       if(!userId){
           return res.status(400).send('UserId is not provided');
       }


    const userRef = database.ref(`police_station/${userId}/notifications/liveLocation`);

    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            for (const id in data) {
                const notification = data[id];
                NotificationData.push(notification);
            }
        }

    })

  

    return res.status(200).send(NotificationData);

}

export const markAsReadLiveLocationNotification = async(req,res) => {
    const {userId , notificationId} = req.body;

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    if(!notificationId){
        return res.status(400).send('NotificationId is not provided');
    }

    const userRef = database.ref(`police_station/${userId}/notifications/liveLocation/${notificationId}`);
    
    await userRef.update({"isRead" : true});

    return res.status(200).send("Notification Read Successfully");
}

export const markAllReadLiveLocationNotification = async(req,res) => {

    const {userId} = req.body;


    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    const userNotificationRef = database.ref(`police_station/${userId}/notifications/liveLocation`);

    await userNotificationRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                userNotificationRef.child(id).update({"isRead": true});
            }
        }
    })


    return res.status(200).send("All Notification Read as Successfully");
}

export const deleteAllLiveLocationNotificationData = async(req,res) => {
    const {userId} = req.body;
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

   
    const userRef = database.ref(`police_station/${userId}/notifications`);
     
    await userRef.remove().then(() => {
        return res.status(200).send("Delete All Notfication Successfully");
    }).catch((error) => {
        return res.status(500).send(error); 
    })
    
}

export const sendNotificationToComplainer = async(req,res) => {
   
    const { userId, title , body } = req.body;
    
    if (!userId) {
        return res.status(400).send("User id is not provided");
    }

    try {
        const database = auth.database();
        const userRef = database.ref(`users/${userId}/userProfile`);

        const snapshot = await userRef.once("value");

        if (snapshot.exists()) {
            const userData = snapshot.val();
            let notificationToken = userData.notificationToken;
            
            console.log(notificationToken);
            await auth.messaging().send({
                token: notificationToken,
                "notification": {
                        "title": title,
                        "body": `${body}`,
                 },
                
              });
              console.log(notificationToken);
            console.log("complainer, notification send");      
            return res.status(200).send("Notification Send Successfully");

        } else {
            return res.status(404).send("Path does not exist");
        }
    } catch (error) {
        console.log("The read failed: " + error.message);
        return res.status(500).send("Internal Server Error");
    }

}


export const saveComplaintPoliceStationStatusNotification = async(req,res) => {

    const {userId , senderName} = req.body;

    console.log(userId);
    console.log("Name",senderName);


    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    if(!senderName){
        return res.status(400).send('SenderName is not provided');
    }

    try{
   
        const userRef = database.ref(`users/${userId}/notifications/policeStationComplaintStatus`);
        const key = userRef.push().key;
        console.log(key);
        userRef.child(key).set({
            "senderName": senderName,
            "timeStamp": new Date().toLocaleString(),
            "isRead" : false,
            "notification_id": key,    
        });

        return res.status(200).send("Notification Saved Successfully"); 
        

    }
    catch(error){
        return res.status(500).send(error);
    }

}
