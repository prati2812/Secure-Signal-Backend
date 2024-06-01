import uuid from 'uuid-v4';
import {auth} from '../../db/connection.js';
import jwt from 'jsonwebtoken';


export const userAuthentication = async(req,res) => {
    const { phoneNumber, userId } = req.body;
  
    if (!userId) {
      return res.status(400).send('UserId not provided');
    }
  
    const database = auth.database();
    const userRef = database.ref(`hospital/${userId}/hospitalProfile`);
  
    
    userRef.once('value', async (snapshot) => {
      const userProfile = snapshot.val();
  
      if (userProfile && userProfile.phoneNumber) {
        await userRef.update({ phoneNumber });
      } else {
        await userRef.set({ phoneNumber });
      }
  
      const token = jwt.sign({ userId }, 'JSON-TOKEN', { expiresIn: '30d' });
      res.status(201).json({ token });
  });
    
  
}
  
export const userProfileCreation = async(req,res) => {

    const bucket = auth.storage().bucket();
    const file = req.file;
    let {phoneNumber, userName , userId , location , notificationToken} = req.body;
    location = JSON.parse(location);
    try{
        if(file){
            const metadata = {
                metadata:{
                    firebaseStorageDownloadTokens: uuid()
                },
                contentType: req.file.mimetype,
            };
        
            const folderName = 'hospitalProfile';
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
                try{
                   const database = auth.database();
                   const policeRef = database.ref(`hospital/${userId}/hospitalProfile`);
                   policeRef.update({
                      "phoneNumber" : phoneNumber,
                      "userName" : userName,
                      "imageUrl":imageUrl,
                      "hospitalLocation":location,
                      "notificationToken":notificationToken,
                   }); 
        
                   return res.status(200).json({ message: "User Data saved successfully" });
                }
                catch(error){
                   return res.status(500).send('Error Saving User Data');
                }
        
                
            });
        
        
            blobStream.end(req.file.buffer);
        }
        else if(phoneNumber || userName){
                try{
                   const database = auth.database();
                   const policeRef = database.ref(`hospital/${userId}/hospitalProfile`);
                   await policeRef.update({
                      "phoneNumber" : phoneNumber,
                      "userName" : userName,
                      "hospitalLocation":location,
                      "notificationToken":notificationToken,
                      "isDeleted":false,
                      "deletionTime":null,
                   }); 
        
                   return res.status(200).json({ message: "User Data saved successfully" });
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
        const userRef = database.ref(`hospital/${userId}/hospitalProfile`);

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
                                const userRef = database.ref(`hospital/${userId}`);
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


export const fetchUserComplaints = async(req,res) => {
    const {userId} = req.body;
    let complaintsData = [];


    if(!userId){
       return res.status(400).send('UserId not provided');  
    }
    console.log(userId);

    const database = auth.database();
    const hospitalRef = database.ref(`hospital/${userId}/complaints`);

    await hospitalRef.get().then((snapshot) => {
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
            let complaints = complaintsData[i];
            userComplaints.push({complaints});
    } 

    console.log(userComplaints); 
    return res.status(200).send(userComplaints);

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
    
        const folderName = 'hospitalProfile';
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
            await database.ref(`hospital/${userId}/hospitalProfile`)
               .update({ "userName": edittedUsername, "imageUrl": imageUrl });
            res.status(201).send("HospitalProfile updated successfully");
          }
          catch (error) {
            res.status(500).json({ error: "Error Saving User Data" });
          };
    
        })
    
    
        blobStream.end(req.file.buffer);
        }
        else if (edittedUsername) {
          const database = auth.database();
          await database.ref(`hospital/${userId}/hospitalProfile`)
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
    const userRef = database.ref(`hospital/${userId}/hospitalProfile`);

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


export const updateComplaintStatus = async(req,res) => {
  const database = auth.database();
  const {userId, policeStationId , hospitalId , complaintId, isInjured,newStatus} = req.body;
  if(!userId){
    return res.status(400).send('UserId not provided');  
  }

  if(!policeStationId){
    return res.status(400).send('PoliceStationId not provided');
  }

  if(!hospitalId){
    return res.status(400).send('HospitalId is not provided');
  }

  if(!complaintId){
    return res.status(400).send('ComplaintId is not provided');
  }
  
  if(!newStatus){
    return res.status(400).send('status is not provided'); 
  }


  const updates = {};
  updates[`/users/${userId}/complaints/${complaintId}/hospitalStatus`] = newStatus;
  updates[`/police_station/${policeStationId}/complaints/${complaintId}/hospitalStatus`] = newStatus;
  if (isInjured === "Yes") {
    updates[`/hospital/${hospitalId}/complaints/${complaintId}/hospitalStatus`] = newStatus;
  }



  database.ref().update(updates)
  .then(() => {
    console.log("saveddd");
    return res.status(200).send("Update Status");
  })
  .catch(error => {
    console.log('Error updating database:', error);
    return res.status(500).send(error);
  });

  

  
}


