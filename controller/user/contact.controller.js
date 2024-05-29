import {auth} from '../../db/connection.js';


export const addEmergencyContact = async(req,res) => {
    const {emergencyContactList, userId} = req.body;
    try{ 
       if(!emergencyContactList){
          return res.status(400).send('No Contacts are selected');
       }
       
       const database = auth.database();
       const userRef = await database.ref(`users/${userId}/emergencyContacts`);
       userRef.set(emergencyContactList);  
       return res.status(201).json({message:"Data Saved Successfully"});
    }
    catch(error){
      return res.status(500).send("Internal Server Error");
    }
  
}
  
export const fetchEmergencyContactList = async (req, res) => {
  const { userId } = req.body;
   
  try {
    
    if (!userId) {
      return res.status(400).send('UserId not provided');
    }

    let contacts = [];
    const database = auth.database();
    const userRef = await database.ref(`users/${userId}/emergencyContacts`);
    const snapshot = await userRef.get();
    contacts = snapshot.val();

    
    return res.status(200).json({ contacts });

   
  }
  catch (error) {
    return res.status(500).send("Internal Server Error");
  }
  
  
}


export const findMatchingContacts = async(req,res) => {
    const {userId , contacts} = req.body;
   
    const database = auth.database();
    if(!userId){
       return res.status(200).send("UserId is not provided");
    }
 
    
    const registeredUsers = []; 
    const registeredNumberMap = {};
    const matchingUsers = [];
 
    const userRef = database.ref(`users`);
    await userRef.get().then((snapshot) => {
         const data = snapshot.val();
         if(data){
             for(const id in data){
                 if(userId !== id){
                     const userData = data[id];
                     const userProfile = userData.userProfile;
                     registeredUsers.push({userProfile  , id}); 
                 }
             }
         }
    });
 
 
 
   Object.values(registeredUsers).forEach(userProfile => {
        registeredNumberMap[userProfile.userProfile.phoneNumber] = userProfile.id;
        
   });
 
 
   const contactsArray = Array.from(contacts);
 
   for(const contact of contactsArray){
     let phoneNumber = contact.phoneNumbers[0].number.replace(/[()-\s]/g, '');
     if(phoneNumber.startsWith("+91")){}
     else{
        phoneNumber = "+91"+phoneNumber;
     }
     if(registeredNumberMap[phoneNumber]){ 
          matchingUsers.push({ userId: registeredNumberMap[phoneNumber]  , ...contact});
     }
   }
 
 
   
 
    return res.status(200).send(matchingUsers);
 
       
}
 
 
export const removeSelectedContact = async (req,res) => {
   const database = auth.database();
   let AllContacts;
   let updatedContactList = [];
   const {userId , contact} = req.body;
   if(!userId){
     return res.status(200).send("UserId is not provided");
   }
 
   if(!contact){
     return res.status(200).send("delete contact is not provided");
   }
 
 
   
   const userRef = database.ref(`users/${userId}/emergencyContacts`);
     
 
   try {
     await userRef.get().then((snapshot) => {
       AllContacts = snapshot.val();
     }).catch((error) => {
       return res.status(200).send(error);
     })
 
 
     for (let i = 0; i < AllContacts.length; i++) {
       const id = AllContacts[i].recordID;
       if (id !== contact.recordID) {
         updatedContactList.push(AllContacts[i]);
       }
 
     }
 
     userRef.set(updatedContactList);
     return res.status(200).send("Delete Contact Successfully");
   }
   catch (error) {
     return res.status(500).send(error);
   }
 
  
 
}


