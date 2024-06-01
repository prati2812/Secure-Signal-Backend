import { Router } from "express";
import { deleteUserAccount, fetchUserComplaints, fetchUserDetails, updateComplaintStatus, updateUserDetails, userAuthentication, userProfileCreation } from "../../controller/police/user.controller.js";
import multer from 'multer';
import { authentication } from '../../middleware/authentication.js';


const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.post("/policeStation/userAuthentication" , userAuthentication);
userRouter.post("/userProfile" , authentication , upload.single('image'), userProfileCreation);
userRouter.post("/fetchDetails" ,  authentication , fetchUserDetails);
userRouter.put("/updateProfile" , authentication ,  upload.single('image'), updateUserDetails);
userRouter.post("/deletePoliceAccount" , authentication ,  deleteUserAccount);
userRouter.post("/fetchUserComplaint" , authentication ,  fetchUserComplaints);
userRouter.put("/policeStation/updateComplaintStatus", authentication , updateComplaintStatus);

export default userRouter;