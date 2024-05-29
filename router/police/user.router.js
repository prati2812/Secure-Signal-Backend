import { Router } from "express";
import { deleteUserAccount, fetchUserComplaints, fetchUserDetails, updateUserDetails, userProfileCreation } from "../../controller/police/user.controller.js";
import multer from 'multer';
import { authentication } from '../../middleware/authentication.js';


const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.post("/userProfile" , upload.single('image'), userProfileCreation);
userRouter.post("/fetchDetails" ,  fetchUserDetails);
userRouter.put("/updateProfile" , authentication ,  upload.single('image'), updateUserDetails);
userRouter.post("/deletePoliceAccount" , authentication ,  deleteUserAccount);
userRouter.post("/fetchUserComplaint" , authentication ,  fetchUserComplaints);


export default userRouter;