import { Router } from "express";
import { paymentController, paymentSuccessful, updateSubscriptionData } from "../../controller/user/subscription.controller.js";


const subscriptionRouter = Router();


subscriptionRouter.post("/payment" , paymentController);
subscriptionRouter.post("/paymentSucess" , paymentSuccessful);
subscriptionRouter.post("/updateSubscriptionDetails" , updateSubscriptionData);


export default subscriptionRouter;
