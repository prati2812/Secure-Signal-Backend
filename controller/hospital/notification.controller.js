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
