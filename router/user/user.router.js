import { Router } from 'express';
import {uploadImage ,  
     fetchUserDetails , 
     updateUserProfile,
     uploadComplaint,
     deleteAccount,
     userAuthentication,
     fetchComplaint} 
from '../../controller/user/user.controller.js';
import multer from 'multer';
import { authentication } from '../../middleware/authentication.js';



const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


userRouter.post("/userAuthentication" , userAuthentication);
userRouter.post("/uploadImage" , authentication, upload.single('image') , uploadImage);
userRouter.post("/fetchUserDetails", authentication , fetchUserDetails);
userRouter.post("/updateUserProfile" ,authentication, upload.single('image') , updateUserProfile);
userRouter.post("/uploadComplaints" , authentication , upload.array('image'), uploadComplaint);
userRouter.post("/deleteUserAccount" , authentication , deleteAccount);
userRouter.post("/user/fetchComplaint", authentication , fetchComplaint);




export default userRouter;