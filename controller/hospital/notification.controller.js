import {auth} from '../../db/connection.js';



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


export const saveComplaintHospitalStatusNotification = async(req,res) => {

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
        const database = auth.database();
        const userRef = database.ref(`users/${userId}/notifications/hospitalComplaintStatus`);
        const key = userRef.push().key;
        console.log(key);
        userRef.child(key).set({
            "senderName": senderName,
            "timeStamp": new Date().toLocaleString(),
            "isRead" : false,
            "notification_id": key,    
        });

        console.log("saved");
        return res.status(200).send("Notification Saved Successfully"); 
        

    }
    catch(error){
        console.log(error);
        return res.status(500).send(error);
    }

}
