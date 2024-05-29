import { Router } from "express";
import { deleteUserAccount, fetchUserComplaints, fetchUserDetails, updateUserDetails, userProfileCreation } from "../../controller/hospital/user.controller.js";
import multer from 'multer';
import { authentication } from '../../middleware/authentication.js';



const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.post("/hospital/userProfile" , upload.single('image'), userProfileCreation);
userRouter.post("/hospital/fetchUserDetails" , fetchUserDetails);
userRouter.post("/hospital/fetchUserComplaints", authentication , fetchUserComplaints);
userRouter.put("/hospital/updateProfile" , authentication ,  upload.single('image'), updateUserDetails);
userRouter.post("/hospital/deleteUserAccount", authentication , deleteUserAccount);

export default userRouter;
