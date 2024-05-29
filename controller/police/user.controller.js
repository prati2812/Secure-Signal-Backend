import uuid from 'uuid-v4';
import {auth} from '../../db/connection.js';
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';
import { log } from 'firebase-functions/logger';

export const userProfileCreation = async(req,res) => {

    const bucket = auth.storage().bucket();
    const file = req.file;
    let {phoneNumber, userName , userId , location , notificationToken} = req.body;
    console.log(notificationToken);
    location = JSON.parse(location);
    try{
        if(file){
            const metadata = {
                metadata:{
                    firebaseStorageDownloadTokens: uuid()
                },
                contentType: req.file.mimetype,
            };
        
            const folderName = 'policeProfile';
            const fileName = `${folderName}/${file.originalname+"_"+Date.now()}`;
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream({
                metadata:metadata,
                gzip:true,
            });
        
            blobStream.on("error", err=>{
                return res.status(500).send('Unable to upload image');
            })
        
            blobStream.on("finish" , async() => {
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                const token = jwt.sign({userId} , 'JSON-TOKEN' , {expiresIn : '30d'});
                try{
                   const database = auth.database();
                   const policeRef = database.ref(`police_station/${userId}/policeStationProfile`);
                   policeRef.set({
                      "phoneNumber" : phoneNumber,
                      "userName" : userName,
                      "imageUrl":imageUrl,
                      "policeStationLocation":location,
                      "notificationToken":notificationToken,
                   }); 
        
                   return res.status(200).json({imageUrl , token});
                }
                catch(error){
                    res.status(500).send('Error Saving User Data');
                }
        
                
            });
        
        
            blobStream.end(req.file.buffer);
        }
        else if(phoneNumber || userName){
                try{
                   console.log("hello");
                   const token = jwt.sign({userId} , 'JSON-TOKEN' , {expiresIn : '30d'});
                   const database = auth.database();
                   const policeRef = database.ref(`police_station/${userId}/policeStationProfile`);
                   await policeRef.update({
                      "phoneNumber" : phoneNumber,
                      "userName" : userName,
                      "policeStationLocation":location,
                      "notificationToken":notificationToken,
                      "isDeleted":false,
                      "deletionTime":null,
                   }); 
        
                   return res.status(200).json({token});
                }
                catch(error){
                    console.log(error);
                }
        }
    }
    catch(error){
        return res.status(500).send(error);
    }
    
    
    
}


export const fetchUserDetails = async(req, res) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(400).send("User id is not provided");
        }

        const database = auth.database();
        const userRef = database.ref(`police_station/${userId}/policeStationProfile`);

        // Check if the path exists
        userRef.once("value", async(snapshot) => {
            if (snapshot.exists()) {
                // Path exists, proceed with fetching data
                const userData = snapshot.val();
                const { imageUrl } = userData;
                if(userData && userData.imageUrl){
                    if(userData.isDeleted && userData.deletionTime){
                        if(userData.isDeleted){
                            let deletionDate = userData.deletionTime;
                            let partsToCompare = deletionDate.split('/');
                   
                            let dayToCompare = parseInt(partsToCompare[0], 10);
                            let monthToCompare = parseInt(partsToCompare[1], 10) - 1; 
                            let yearToCompare = parseInt(partsToCompare[2], 10);
           
                         
                            let deletionDateToCompare = new Date(yearToCompare, monthToCompare, dayToCompare);
                            let currentDate = new Date();
           
                         
                             if (deletionDateToCompare <= currentDate) {
                                const userRef = database.ref(`police_station/${userId}`);
                                     await userRef.remove();
                                     console.log("delete");
                                     return res.status(200).send("delete Account Successfully");
                             } 
           
                       }
                    }
                     

                    const filePath = imageUrl.replace("https://storage.googleapis.com/signal-55ec5.appspot.com/", "");
                    const [imageBuffer] = await auth.storage().bucket().file(filePath).download();
                    return res.status(200).json({ userData, imageBuffer });
                }
                
            } else {
                // Path does not exist
                return res.status(404).send("Path does not exist");
            }
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
            return res.status(500).send("Internal Server Error");
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}


export const updateUserDetails = async(req,res) => {
    const bucket = auth.storage().bucket();
    const file = req.file;
    const {userId , edittedUsername} = req.body;
    if(!userId){
        return res.status(400).send('UserId not provided');  
    }
         
    
    try{
        if (file) {
        const metadata = {
          metadata: {
            firebaseStorageDownloadTokens: uuid()
          },
          contentType: req.file.mimetype,
        };
    
        const folderName = 'policeProfile';
        const fileName = `${folderName}/${file.originalname + "_" + Date.now()}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: metadata,
          gzip: true,
        });
    
    
    
        blobStream.on("error", err => {
          console.log("Unable to upload image");
          return res.status(500).json({ error: 'Unable to upload image' });
        })
    
        blobStream.on("finish", async () => {
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          try {
    
            const database = auth.database();
            await database.ref(`police_station/${userId}/policeStationProfile`)
               .update({ "userName": edittedUsername, "imageUrl": imageUrl });
            res.status(201).send("PoliceStationProfile updated successfully");
          }
          catch (error) {
            res.status(500).json({ error: "Error Saving User Data" });
          };
    
        })
    
    
        blobStream.end(req.file.buffer);
        }
        else if (edittedUsername) {
          const database = auth.database();
          await database.ref(`police_station/${userId}/policeStationProfile`)
          .update({ "userName": edittedUsername });
          res.status(201).send("UserProfile updated successfully");
        }  
    }
    catch(error){
      return res.status(500).send('Internal Server Error');
    }
    
}

export const deleteUserAccount = async(req,res) => {
    const database = auth.database();
    const {userId} = req.body;
    if(!userId){
      return res.status(400).send('UserId not provided');  
    } 

    console.log(userId);
    const userRef = database.ref(`police_station/${userId}/policeStationProfile`);

    const currentDate = new Date();

    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 14);
    const formattedDate = `${futureDate.getDate()}/${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`;
    const expirationDate = `${formattedDate}`;



    await userRef.update({
      "isDeleted" : true,
      "deletionTime" : expirationDate,
    });
    
    
    return res.status(200).send("Account Deleted Successfully");


}

export const fetchUserComplaints = async(req,res) => {
     const {userId} = req.body;
     let complaintsData = [];


     if(!userId){
        return res.status(400).send('UserId not provided');  
     }
     console.log(userId);

     const database = auth.database();
     const policeRef = database.ref(`police_station/${userId}/complaints`);

     await policeRef.get().then((snapshot) => {
        const data = snapshot.val();
        if(data){
            for(const id in data){
                const notification = data[id];
                complaintsData.push(notification);
            }
        }
     })

    

    let userComplaints = []; 
    for(let i=0;  i < complaintsData.length; i++){
             let complaintsImageBuffer = [];
             let complaints = complaintsData[i];
             let complaintsImage = complaints.complaintImage;

             if(complaintsImage !== undefined){
                for(let j=0; j < complaintsImage.length; j++){
                    const filePath = complaintsImage[j].replace("https://storage.googleapis.com/signal-55ec5.appspot.com/", "");
                    const [imageBuffer] = await auth.storage().bucket().file(filePath).download();
                    complaintsImageBuffer.push({imageBuffer});
                 }
                 userComplaints.push({complaints , complaintsImageBuffer});
             }
             else{
                userComplaints.push({complaints});
             }
                        
    } 

     console.log(userComplaints);    
     return res.status(200).send(userComplaints);

}