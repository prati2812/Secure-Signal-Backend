import uuid from 'uuid-v4';
import {auth} from '../../db/connection.js';
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';
import { log } from 'firebase-functions/logger';


export const userAuthentication = async(req,res) => {
  const { phoneNumber, userId } = req.body;

  if (!userId) {
    return res.status(400).send('UserId not provided');
  }

  const database = auth.database();
  const userRef = database.ref(`users/${userId}/userProfile`);

  
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

export const uploadImage = async(req,res) =>{
  
    const bucket = auth.storage().bucket();
    const file = req.file;
    let {phoneNumber, userName, userId , notificationToken} = req.body;
          

    try{
         if(file){
           const metadata = {
             metadata: {
               firebaseStorageDownloadTokens: uuid()
             },
             contentType: req.file.mimetype,
           };

           const folderName = 'userProfile';
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
               const userRef = database.ref(`users/${userId}/userProfile`);

               await userRef.update({
                 "phoneNumber": phoneNumber,
                 "userName": userName,
                 "imageUrl": imageUrl,
                 "notificationToken": notificationToken,
                 "isDeleted":false,
                 "deletionTime":null,
               });

               res.status(201).json({ message: "User Data saved successfully" });


             }
             catch (error) {
               res.status(500).json({ error: "Error Saving User Data" });
             };

           })


           blobStream.end(req.file.buffer);             
         }
         else if(userName){
          const database = auth.database();
          const userRef = database.ref(`users/${userId}/userProfile`);

          await userRef.update({
            "phoneNumber": phoneNumber,
            "userName": userName,
            "notificationToken": notificationToken,
            "isDeleted":false,
            "deletionTime":null,
          });

          res.status(201).json({ message: "User Data saved successfully" });
         }
    }
    catch(error){
      console.log("======" , error);
      return res.status(500).send(error);
    }

    
  
}

export const fetchUserDetails = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send('UserId not provided');
    }

    const database = auth.database();
    const userRef = database.ref(`users/${userId}/userProfile`);

    
    const snapshot = await userRef.once("value");

    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      
      if (userData && userData.imageUrl) {
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
                     const userRef = database.ref(`users/${userId}`);
                          await userRef.remove();
                          console.log("delete");
                          return res.status(200).send("delete Account Successfully");
                  } 

            }
        }
        const { imageUrl } = userData;
        const filePath = imageUrl.replace("https://storage.googleapis.com/signal-55ec5.appspot.com/", "");

        const [imageBuffer] = await auth.storage().bucket().file(filePath).download();
        return res.status(200).json({ userData, imageBuffer });
      } else {
        return res.status(400).send("User image URL not found");
      }
    } else {
      
      return res.status(404).send("Path does not exist");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).send("Internal Server Error");
  }
}

export const updateUserProfile = async(req,res) => {
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
    
        const folderName = 'userProfile';
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
            await database.ref(`users/${userId}/userProfile`).update({ "userName": edittedUsername, "imageUrl": imageUrl });
            res.status(201).send("UserProfile updated successfully");
          }
          catch (error) {
            res.status(500).json({ error: "Error Saving User Data" });
          };
    
        })
    
    
        blobStream.end(req.file.buffer);
        }
        else if (edittedUsername) {
          const database = auth.database();
          await database.ref(`users/${userId}/userProfile`).update({ "userName": edittedUsername });
          res.status(201).send("UserProfile updated successfully");
        }  
    }
    catch(error){
      return res.status(500).send('Internal Server Error');
    }
    
   
}


export const uploadComplaint = async(req,res) => {
  const database = auth.database();

  let { policeStationId, userId, complaintBy, complaint, isInjured, complaint_location , hospitalId , phoneNumber} = req.body;
  complaint_location = JSON.parse(complaint_location)
  const bucket = auth.storage().bucket();
  const files = req.files;

  if (!policeStationId) {
    return res.status(400).send('policeStationId not provided');
  }

  if (!hospitalId) {
    return res.status(400).send('hospitalId not provided');
  }

  if (!userId) {
    return res.status(400).send('UserId not provided');
  }

  if (!complaintBy) {
    return res.status(400).send("Complaint By not Provided");
  }

  if (!complaint) {
    return res.status(400).send("Complaint can't be empty");
  }

  if (!isInjured) {
    return res.status(400).send("Injured or not provided");
  }

  


  
  try {

    if (files.length > 0) {
      let complaint_imageUrl = [];

      for (const file of files) {

        const metadata = {
          metadata: {
            firebaseStorageDownloadTokens: uuid()
          },
          contentType: file.mimetype,
        };

        const folderName = 'complaints';
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
          const complaint_image = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          complaint_imageUrl.push(complaint_image);
          if (complaint_imageUrl.length === files.length) {
            const userRef = database.ref(`users/${userId}/complaints`);
            const complaintKey = userRef.push().key;

            const complaintData = {
              complaintId: complaintKey,
              complainerId: userId,
              complaintBy: complaintBy,
              complaint: complaint,
              complaintStatus: "pending",
              isInjured: isInjured,
              phoneNumber: phoneNumber,
              createdAt: new Date().toJSON(),
              complaintLocation: complaint_location,
              complaintImage: complaint_imageUrl,
              nearestPoliceStationId: policeStationId,
              nearestHospitalId: hospitalId,
            };

            // const policeRef = database.ref(`police_station/${policeStationId}/complaints`);
            // policeRef.child(key).set({
            //   "complaitId":key,
            //   "complainerId": userId,
            //   "complaintBy": complaintBy,
            //   "complaint": complaint,
            //   "complaintStatus": "pending",
            //   "isInjured": isInjured,
            //   "phoneNumber": phoneNumber,
            //   "createdAt": new Date().toJSON(),
            //   "complaintLocation": complaint_location,
            //   "complaintImage": complaint_imageUrl,
            //   "nearestPoliceStationId": policeStationId,
            // });


            // if(isInjured === "Yes"){
            //    const hospitalRef = database.ref(`hospital/${hospitalId}/complaints`);
            //     hospitalRef.child(key).set({
            //       "complaitId":key,
            //       "complainerId": userId,
            //       "complaintBy": complaintBy,
            //       "complaint": complaint,
            //       "complaintStatus": "pending",
            //       "isInjured": isInjured,
            //       "phoneNumber": phoneNumber,
            //       "createdAt": new Date().toJSON(),
            //       "complaintLocation": complaint_location,
            //       "complaintImage": complaint_imageUrl,
            //       "nearestPoliceStationId": policeStationId,
            //       "nearestHospitalId":hospitalId,
            //     }); 
               
            // }
              

              
            const updates = {};
            updates[`/users/${userId}/complaints/${complaintKey}`] = complaintData;
            updates[`/police_station/${policeStationId}/complaints/${complaintKey}`] = complaintData;

            if (isInjured === "Yes") {
                updates[`/hospital/${hospitalId}/complaints/${complaintKey}`] = complaintData;
            }

            database.ref().update(updates)
                .then(() =>{
                   console.log("saveddd");
                   return res.status(200).send("Complaint saved successfully") 
                })
                .catch(error => {
                    console.log('Error updating database:', error);
                    return res.status(500).send(error);
                });
                      

            // return res.status(200).send("Complaint save successfully");
          }
        })


        blobStream.end(file.buffer);

      }

    }
    else {
      const userRef = database.ref(`users/${userId}/complaints`);
      const complaintKey = userRef.push().key;

      const complaintData = {
        complaintId: complaintKey,
        complainerId: userId,
        complaintBy: complaintBy,
        complaint: complaint,
        complaintStatus: "pending",
        isInjured: isInjured,
        phoneNumber: phoneNumber,
        createdAt: new Date().toJSON(),
        complaintLocation: complaint_location,
        nearestPoliceStationId: policeStationId,
        nearestHospitalId: hospitalId,
      };


      const updates = {};
      updates[`/users/${userId}/complaints/${complaintKey}`] = complaintData;
      updates[`/police_station/${policeStationId}/complaints/${complaintKey}`] = complaintData;

      if (isInjured === "Yes") {
        updates[`/hospital/${hospitalId}/complaints/${complaintKey}`] = complaintData;
      }

      database.ref().update(updates)
        .then(() => {
          console.log("saveddd");
          return res.status(200).send("Complaint saved successfully")
        })
        .catch(error => {
          console.log('Error updating database:', error);
          return res.status(500).send(error);
        });

     
      
      
     }
      
    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }

}
    



export const deleteAccount = async(req,res) => {
    const database = auth.database();
    const {userId} = req.body;
    if(!userId){
      return res.status(400).send('UserId not provided');  
    } 

    // const userRef = database.ref(`users/${userId}`);

    

    const userRef = database.ref(`users/${userId}/userProfile`);

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

export const fetchComplaint = async(req,res) => {
  const database = auth.database();
  let complaintsData = [];
  const {userId} = req.body;
  if(!userId){
    return res.status(400).send('UserId not provided');  
  } 
  const userRef = database.ref(`users/${userId}/complaints`); 

  await userRef.get().then((snapshot) => {
    const data = snapshot.val();
    if (data) {
      for (const id in data) {
        const ComplaintData = data[id];
        complaintsData.push(ComplaintData);
      }
    }
  })



  let userComplaints = [];
  for (let i = 0; i < complaintsData.length; i++) {
    let complaintsImageBuffer = [];
    let complaints = complaintsData[i];
    let complaintsImage = complaints.complaintImage;

    if (complaintsImage !== undefined) {
      for (let j = 0; j < complaintsImage.length; j++) {
        const filePath = complaintsImage[j].replace("https://storage.googleapis.com/signal-55ec5.appspot.com/", "");
        const [imageBuffer] = await auth.storage().bucket().file(filePath).download();
        complaintsImageBuffer.push({ imageBuffer });
      }
      userComplaints.push({ complaints, complaintsImageBuffer });
    }
    else {
      userComplaints.push({ complaints });
    }

  }

  
  return res.status(200).send(userComplaints);


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
   updates[`/users/${userId}/complaints/${complaintId}/complaintStatus`] = newStatus;
   updates[`/police_station/${policeStationId}/complaints/${complaintId}/complaintStatus`] = newStatus;

   if (isInjured === "Yes") {
       updates[`/hospital/${hospitalId}/complaints/${complaintId}/complaintStatus`] = newStatus;
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