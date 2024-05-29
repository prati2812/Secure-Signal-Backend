import { Router } from "express";
import { authentication } from '../../middleware/authentication.js';
import { fetchLiveLocation } from "../../controller/police/location.controller.js";

const locationRouter = Router();

locationRouter.post("/policeStation/fetchLiveLocation", authentication , fetchLiveLocation);


export default locationRouter;