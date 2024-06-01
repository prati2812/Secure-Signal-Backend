import { Router } from "express";
import { deleteUserAccount, fetchUserComplaints, fetchUserDetails, updateComplaintStatus, updateUserDetails, userAuthentication, userProfileCreation } from "../../controller/hospital/user.controller.js";
import multer from 'multer';
import { authentication } from '../../middleware/authentication.js';



const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.post("/hospital/userAuthentication" , userAuthentication);
userRouter.post("/hospital/userProfile" , authentication,upload.single('image'), userProfileCreation);
userRouter.post("/hospital/fetchUserDetails" , authentication,fetchUserDetails);
userRouter.post("/hospital/fetchUserComplaints", authentication , fetchUserComplaints);
userRouter.put("/hospital/updateProfile" , authentication ,  upload.single('image'), updateUserDetails);
userRouter.post("/hospital/deleteUserAccount", authentication , deleteUserAccount);
userRouter.put("/hospital/updateComplaintStatus" , authentication , updateComplaintStatus);

export default userRouter;
