import { log } from 'firebase-functions/logger';
import {auth} from '../../db/connection.js';

const database = auth.database();

export const sendNotificationEmergencyContact = async(req,res) => {
    const {notifyToken , userName , title , body} = req.body;
    try {
        await auth.messaging().send({
            token: notifyToken,
            "notification": {
                    "title": `${title}`,
                    "body": `${body} ${userName}.`,
                },
            
          });
    console.log("notification send");      
    return res.status(200).send("Notification Send Successfully");
    }
    catch (error) {
    console.log(error);
    return res.status(500).send(error);
    }
}

export const sendNotificationToNearestPoliceStation = async(req,res) => {
   
    const { policeStationId, userName , title , body } = req.body;
    console.log("police" , policeStationId);

    if (!policeStationId) {
        return res.status(400).send("User id is not provided");
    }

    try {
        const database = auth.database();
        const policeRef = database.ref(`police_station/${policeStationId}/policeStationProfile`);

        const snapshot = await policeRef.once("value");

        if (snapshot.exists()) {
            const userData = snapshot.val();
            let notificationToken = userData.notificationToken;
            
            console.log(notificationToken);
            await auth.messaging().send({
                token: notificationToken,
                "notification": {
                        "title": title,
                        "body": `${body} ${userName}`,
                 },
                
              });
              console.log(notificationToken);
            console.log("police, notification send");      
            return res.status(200).send("Notification Send Successfully");

        } else {
            return res.status(404).send("Path does not exist");
        }
    } catch (error) {
        console.log("The read failed: " + error.message);
        return res.status(500).send("Internal Server Error");
    }

}

export const sendNotificationToNearestHospital = async(req,res) => {
   
    const { hospitalId, userName , title , body } = req.body;
    console.log("hospitalId" , hospitalId);

    if (!hospitalId) {
        return res.status(400).send("User id is not provided");
    }

    try {
        const database = auth.database();
        const hospitalRef = database.ref(`hospital/${hospitalId}/hospitalProfile`);

        const snapshot = await hospitalRef.once("value");

        if (snapshot.exists()) {
            const userData = snapshot.val();
            let notificationToken = userData.notificationToken;
            
            console.log(notificationToken);
            await auth.messaging().send({
                token: notificationToken,
                "notification": {
                        "title": title,
                        "body": `${body} ${userName}`,
                 },
                
              });
              console.log(notificationToken);
            console.log("hospital, notification send");      
            return res.status(200).send("Notification Send Successfully");

        } else {
            return res.status(404).send("Path does not exist");
        }
    } catch (error) {
        console.log("The read failed: " + error.message);
        return res.status(500).send("Internal Server Error");
    }

}


export const saveEmergencyContactNotification = async(req,res) => {

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
   
        const userRef = database.ref(`users/${userId}/notifications/emergencyContact`);
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


export const saveLiveLocationNotification = async(req,res) =>{
    const {userId , senderId ,  senderName} = req.body;

    
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    if(!senderId){
        return res.status(400).send('SenderId is not provided');
    }
    if(!senderName){
        return res.status(400).send('SenderName is not provided');
    }

    try{
   
        const userRef = database.ref(`users/${senderId}/notifications/liveLocation`);
        const key = userRef.push().key;
        console.log(key);
        userRef.child(key).set({
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

export const saveSafelyArraivalNotification = async(req,res) => {
    const {userId , senderId ,  senderName ,  placeName} = req.body;

    
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    if(!senderId){
        return res.status(400).send('SenderId is not provided');
    }
    if(!senderName){
        return res.status(400).send('SenderName is not provided');
    }

    try{
   
        const userRef = database.ref(`users/${senderId}/notifications/safeArrival`);
        const key = userRef.push().key;
        console.log(key);
        userRef.child(key).set({
            "senderName": senderName,
            "timeStamp": new Date().toLocaleString(),
            "isRead" : false,
            "notification_id": key,
            "senderId":userId,
            "placeName":placeName,    
        });

        return res.status(200).send("Notification Saved Successfully"); 
        

    }
    catch(error){
        return res.status(500).send(error);
    }
} 


export const fetchEmergencyContactNotification = async(req,res) => {
    const {userId} = req.body;
    let NotificationData = [];

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    const userRef = database.ref(`users/${userId}/notifications/emergencyContact`);
    



    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                const notification = data[id];
                NotificationData.push(notification);
            }
        }
        
    })


    return res.status(200).send(NotificationData);

}

export const fetchLiveLocationNotification = async(req,res) => {
    const {userId} = req.body;
    let notificationData = [];

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    const userRef = database.ref(`users/${userId}/notifications/liveLocation`);
    

    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                const notification = data[id];
                notificationData.push(notification);
            }
        }
        
    })


    return res.status(200).send(notificationData);


}

export const fetchSafeArrivalNotification = async(req,res) => {
    const {userId} = req.body;
    let notificationData = [];

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    const userRef = database.ref(`users/${userId}/notifications/safeArrival`);
    

    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                const notification = data[id];
                notificationData.push(notification);
            }
        }
        
    });


    return res.status(200).send(notificationData);
}

export const markAsReadNotification = async(req,res) => {
    const {userId , notificationId} = req.body;

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    if(!notificationId){
        return res.status(400).send('NotificationId is not provided');
    }

    const userRef = database.ref(`users/${userId}/notifications/emergencyContact/${notificationId}`);
    
    await userRef.update({"isRead" : true});

    return res.status(200).send("Notification Read Successfully");



}


export const markLiveLocationAsReadNotification = async(req,res) => {
    const {userId , notificationId} = req.body;

    
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    if(!notificationId){
        return res.status(400).send('NotificationId is not provided');
    }

    const userRef = database.ref(`users/${userId}/notifications/liveLocation/${notificationId}`);
    
    await userRef.update({"isRead" : true});

    
    return res.status(200).send("Notification Read Successfully");
}

export const markSafeArrivalAsReadNotification = async(req,res) => {
    const {userId , notificationId} = req.body;

    
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }

    if(!notificationId){
        return res.status(400).send('NotificationId is not provided');
    }

    const userRef = database.ref(`users/${userId}/notifications/safeArrival/${notificationId}`);
    
    await userRef.update({"isRead" : true});

    
    return res.status(200).send("Notification Read Successfully");
}



export const markAllReadNotification = async(req,res) => {
    const {userId} = req.body;

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    const userRef = database.ref(`users/${userId}/notifications/emergencyContact`);

    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                 
                userRef.child(id).update({"isRead" : true});
                
            }
        }
        
    })


    const userNotificationRef = database.ref(`users/${userId}/notifications/liveLocation`);

    await userNotificationRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                userNotificationRef.child(id).update({"isRead": true});
            }
        }
    })


    const userSafeArrivalNotificationRef = database.ref(`users/${userId}/notifications/safeArrival`);

    await userSafeArrivalNotificationRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                userSafeArrivalNotificationRef.child(id).update({"isRead": true});
            }
        }
    })


    return res.status(200).send("All Notification Read as Successfully");

  
    

}

export const deleteAllNotification = async(req,res) => {
    const {userId} = req.body;
    if(!userId){
        return res.status(400).send('UserId is not provided');
    }


    const userRef = database.ref(`users/${userId}/notifications`);
     
    await userRef.remove().then(() => {
        return res.status(200).send("Delete All Notfication Successfully");
    }).catch((error) => {
        return res.status(500).send(error); 
    })
    

}




